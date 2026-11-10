-- 001_create_core_tables.sql
-- Core entities: users, categories, suppliers, import_templates, items

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  pin_hash TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Owner/Admin', 'Manager/Purchaser', 'Staff')),
  area VARCHAR(50) NOT NULL DEFAULT 'All' CHECK (area IN ('Bar', 'Kitchen', 'All')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('Bar', 'Kitchen')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, area)
);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  contact_info TEXT,
  lead_time_days INTEGER NOT NULL DEFAULT 2 CHECK (lead_time_days >= 0),
  min_order_qty NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (min_order_qty >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Import Templates Table (Saved CSV column mappings)
CREATE TABLE IF NOT EXISTS import_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  column_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Items Master Table (Fixed core fields + flexible JSONB custom_fields)
CREATE TABLE IF NOT EXISTS items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
  template_id UUID REFERENCES import_templates(template_id) ON DELETE SET NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('Bar', 'Kitchen')),
  location VARCHAR(150),
  base_unit VARCHAR(50) NOT NULL,
  purchase_unit VARCHAR(50) NOT NULL,
  conversion_factor NUMERIC(12, 4) NOT NULL DEFAULT 1 CHECK (conversion_factor > 0),
  par_level NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (par_level >= 0),
  reorder_point NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reorder_point >= 0),
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  shelf_life_days INTEGER CHECK (shelf_life_days IS NULL OR shelf_life_days > 0),
  custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_area ON items(area);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_items_is_archived ON items(is_archived);

