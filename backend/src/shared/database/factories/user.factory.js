import crypto from 'crypto';

let userCounter = 1;

/**
 * Factory for generating User objects (Owner/Admin, Manager/Purchaser, Staff).
 */
export function createUserFactory(overrides = {}) {
  const index = userCounter++;
  return {
    user_id: overrides.user_id || crypto.randomUUID(),
    full_name: overrides.full_name || `Krāv Staff ${index}`,
    email: overrides.email || `staff${index}@kravcafe.com`,
    password_hash: overrides.password_hash || '$2b$10$KravDemoHashedPasswordPlaceholder123456789012',
    pin_hash: overrides.pin_hash || '$2b$10$KravDemoHashedPinPlaceholder1234',
    role: overrides.role || 'Staff',
    area: overrides.area || 'Bar',
    is_active: overrides.is_active ?? true,
    ...overrides,
  };
}

