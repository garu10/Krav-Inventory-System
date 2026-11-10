-- 002_create_ledger_and_counts.sql
-- Event bookings header, append-only stock movement ledger, physical stock counts, and CQRS stock_on_hand_view

-- 6. Events Table (Created before stock_movements for event_id FK)
CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  buffer_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (buffer_pct >= 0),
  status VARCHAR(50) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Confirmed', 'Completed', 'Cancelled')),
  notes TEXT,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Stock Movements Table (Append-only ledger with client_uuid for offline idempotency)
CREATE TABLE IF NOT EXISTS stock_movements (
  movement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(event_id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('Initial Count', 'Stock In', 'Stock Out', 'Waste', 'Transfer', 'Adjustment', 'Event Usage')
  ),
  qty_entered NUMERIC(12, 3) NOT NULL CHECK (qty_entered > 0),
  unit_entered VARCHAR(50) NOT NULL,
  qty_base_unit NUMERIC(12, 3) NOT NULL,
  reason TEXT,
  batch_no VARCHAR(100),
  expiry_date DATE,
  client_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_reason_for_waste_or_adjustment CHECK (
    (type NOT IN ('Waste', 'Adjustment')) OR (reason IS NOT NULL AND LENGTH(TRIM(reason)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(type);

-- 8. Stock Counts Table (Physical inventory count sessions)
CREATE TABLE IF NOT EXISTS stock_counts (
  count_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counted_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  counted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Stock Count Lines Table
CREATE TABLE IF NOT EXISTS stock_count_lines (
  line_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES stock_counts(count_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
  system_qty NUMERIC(12, 3) NOT NULL,
  counted_qty NUMERIC(12, 3) NOT NULL CHECK (counted_qty >= 0),
  variance NUMERIC(12, 3) GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
  UNIQUE (count_id, item_id)
);

-- CQRS Read Model: Stock on Hand & Status View
-- Calculates current stock as SUM of signed movements in base units, never from an overwritten cell.
CREATE OR REPLACE VIEW stock_on_hand_view AS
SELECT
  i.item_id,
  i.name,
  i.area,
  i.category_id,
  c.name AS category_name,
  i.supplier_id,
  s.name AS supplier_name,
  i.base_unit,
  i.purchase_unit,
  i.conversion_factor,
  i.par_level,
  i.reorder_point,
  i.unit_cost,
  i.shelf_life_days,
  i.custom_fields,
  i.is_archived,
  COALESCE(SUM(m.qty_base_unit), 0)::NUMERIC(12, 3) AS stock_on_hand,
  CASE
    WHEN COALESCE(SUM(m.qty_base_unit), 0) <= 0 THEN 'Out of Stock'
    WHEN COALESCE(SUM(m.qty_base_unit), 0) <= (i.reorder_point * 0.5) THEN 'Critical'
    WHEN COALESCE(SUM(m.qty_base_unit), 0) <= i.reorder_point THEN 'Low'
    WHEN i.par_level > 0 AND COALESCE(SUM(m.qty_base_unit), 0) > (i.par_level * 1.5) THEN 'Overstock'
    ELSE 'OK'
  END AS stock_status,
  MAX(m.created_at) AS last_movement_at
FROM items i
LEFT JOIN categories c ON i.category_id = c.category_id
LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
LEFT JOIN stock_movements m ON i.item_id = m.item_id
GROUP BY
  i.item_id,
  c.name,
  s.name;

