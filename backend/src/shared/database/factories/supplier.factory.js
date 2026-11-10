import crypto from 'crypto';

let supplierCounter = 1;

/**
 * Factory for generating Supplier objects with lead times and MOQs.
 */
export function createSupplierFactory(overrides = {}) {
  const index = supplierCounter++;
  return {
    supplier_id: overrides.supplier_id || crypto.randomUUID(),
    name: overrides.name || `Supplier ${index}`,
    contact_info: overrides.contact_info || `orders@supplier${index}.ph | +63 917 000 ${String(index).padStart(4, '0')}`,
    lead_time_days: overrides.lead_time_days ?? 2,
    min_order_qty: overrides.min_order_qty ?? 1,
    ...overrides,
  };
}

