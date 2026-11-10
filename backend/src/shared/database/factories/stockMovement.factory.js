import crypto from 'crypto';

const OUTFLOW_TYPES = new Set(['Stock Out', 'Waste', 'Event Usage']);

/**
 * Factory for generating append-only StockMovement ledger entries.
 * Automatically converts entered units to signed base units and generates a client_uuid.
 */
export function createStockMovementFactory(overrides = {}) {
  const type = overrides.type || 'Stock In';
  const qtyEntered = Number(overrides.qty_entered ?? 1);
  const unitEntered = overrides.unit_entered || 'ml';
  const conversionFactor = Number(overrides.conversion_factor ?? 1);
  const baseUnit = overrides.base_unit || unitEntered;

  const rawBaseQty = unitEntered === baseUnit ? qtyEntered : qtyEntered * conversionFactor;
  const direction = overrides.direction ?? (OUTFLOW_TYPES.has(type) ? -1 : 1);
  const qtyBaseUnit = overrides.qty_base_unit ?? rawBaseQty * direction;

  const requiresReason = type === 'Waste' || type === 'Adjustment';

  return {
    movement_id: overrides.movement_id || crypto.randomUUID(),
    item_id: overrides.item_id,
    user_id: overrides.user_id || null,
    event_id: overrides.event_id || null,
    type,
    qty_entered: qtyEntered,
    unit_entered: unitEntered,
    qty_base_unit: qtyBaseUnit,
    reason: overrides.reason || (requiresReason ? `Routine ${type.toLowerCase()} log` : null),
    batch_no: overrides.batch_no || `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    expiry_date: overrides.expiry_date || null,
    client_uuid: overrides.client_uuid || crypto.randomUUID(),
    created_at: overrides.created_at || new Date().toISOString(),
  };
}

