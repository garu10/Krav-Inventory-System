import crypto from 'crypto';

let categoryCounter = 1;

/**
 * Factory for generating Category objects (Bar or Kitchen).
 */
export function createCategoryFactory(overrides = {}) {
  const index = categoryCounter++;
  return {
    category_id: overrides.category_id || crypto.randomUUID(),
    name: overrides.name || `Category ${index}`,
    area: overrides.area || 'Bar',
    ...overrides,
  };
}

