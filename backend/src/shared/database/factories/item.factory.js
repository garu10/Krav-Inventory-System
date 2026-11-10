import crypto from 'crypto';

let itemCounter = 1;

/**
 * Factory for generating Item records with unit conversion, par levels, and custom CSV fields.
 */
export function createItemFactory(overrides = {}) {
  const index = itemCounter++;
  return {
    item_id: overrides.item_id || crypto.randomUUID(),
    name: overrides.name || `Cafe Supply Item ${index}`,
    category_id: overrides.category_id || null,
    supplier_id: overrides.supplier_id || null,
    template_id: overrides.template_id || null,
    area: overrides.area || 'Bar',
    location: overrides.location || 'Main Bar Shelf',
    base_unit: overrides.base_unit || 'ml',
    purchase_unit: overrides.purchase_unit || 'carton',
    conversion_factor: overrides.conversion_factor ?? 1000,
    par_level: overrides.par_level ?? 10000,
    reorder_point: overrides.reorder_point ?? 3000,
    unit_cost: overrides.unit_cost ?? 140.0,
    shelf_life_days: overrides.shelf_life_days ?? 14,
    custom_fields: overrides.custom_fields || { brand: 'Krāv Standard', excel_row_ref: index },
    is_archived: overrides.is_archived ?? false,
    ...overrides,
  };
}

