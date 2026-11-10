-- 003_create_recipes_events_purchasing.sql
-- Recipes / Bill of Materials, daily sales, event menus, and purchasing workflows

-- 10. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  menu_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Recipe Ingredients Table (Bill of Materials per Menu Item)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  menu_item_id UUID NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
  qty_per_serving NUMERIC(12, 3) NOT NULL CHECK (qty_per_serving > 0),
  PRIMARY KEY (menu_item_id, item_id)
);

-- 12. Daily Sales Table (Used for recipe-driven demand forecasting)
CREATE TABLE IF NOT EXISTS daily_sales (
  sale_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  qty_sold INTEGER NOT NULL CHECK (qty_sold >= 0),
  UNIQUE (menu_item_id, sale_date)
);

-- 13. Event Menu Table (Many-to-Many between events and menu_items)
CREATE TABLE IF NOT EXISTS event_menu (
  event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE RESTRICT,
  servings INTEGER NOT NULL CHECK (servings > 0),
  PRIMARY KEY (event_id, menu_item_id)
);

-- 14. Purchase Lists Table (Header: Draft -> Approved -> Ordered -> Received)
CREATE TABLE IF NOT EXISTS purchase_lists (
  list_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL DEFAULT 'Regular' CHECK (type IN ('Regular', 'Event')),
  event_id UUID REFERENCES events(event_id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Ordered', 'Received')),
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Purchase Items Table (Line items of a purchase list)
CREATE TABLE IF NOT EXISTS purchase_items (
  purchase_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES purchase_lists(list_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE RESTRICT,
  supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
  suggested_qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (suggested_qty >= 0),
  final_qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (final_qty >= 0),
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  received_qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (received_qty >= 0)
);

