import { fileURLToPath } from 'url';
import pool, { withTransaction } from '../index.js';
import {
  createUserFactory,
  createCategoryFactory,
  createSupplierFactory,
  createItemFactory,
  createStockMovementFactory,
} from '../factories/index.js';

const __filename = fileURLToPath(import.meta.url);

export async function seedDatabase() {
  console.log('🌱 Starting Krāv Cafe database seeding...');

  await withTransaction(async (client) => {
    // Clear existing data in reverse dependency order for idempotent re-seeding
    await client.query(`
      TRUNCATE TABLE
        audit_logs,
        recommendations,
        forecasts,
        purchase_items,
        purchase_lists,
        event_menu,
        daily_sales,
        recipe_ingredients,
        menu_items,
        stock_count_lines,
        stock_counts,
        stock_movements,
        events,
        items,
        import_templates,
        suppliers,
        categories,
        users
      RESTART IDENTITY CASCADE;
    `);

    // 1. Seed Users (Owner/Admin, Manager/Purchaser, Bar Staff, Kitchen Staff)
    const users = [
      createUserFactory({
        full_name: 'Ralph Alcantara (Owner)',
        email: 'admin@kravcafe.com',
        role: 'Owner/Admin',
        area: 'All',
      }),
      createUserFactory({
        full_name: 'Maya Santos (Purchaser)',
        email: 'purchaser@kravcafe.com',
        role: 'Manager/Purchaser',
        area: 'All',
      }),
      createUserFactory({
        full_name: 'Liam Cruz (Head Barista)',
        email: 'barista@kravcafe.com',
        role: 'Staff',
        area: 'Bar',
      }),
      createUserFactory({
        full_name: 'Chef Elena Reyes (Kitchen)',
        email: 'kitchen@kravcafe.com',
        role: 'Staff',
        area: 'Kitchen',
      }),
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (user_id, full_name, email, password_hash, pin_hash, role, area, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.user_id, u.full_name, u.email, u.password_hash, u.pin_hash, u.role, u.area, u.is_active]
      );
    }
    const [adminUser, purchaserUser, barStaff, kitchenStaff] = users;
    console.log(`✅ Seeded ${users.length} users`);

    // 2. Seed Categories (Bar & Kitchen)
    const categoriesData = [
      createCategoryFactory({ name: 'Dairy & Plant Milk', area: 'Bar' }),
      createCategoryFactory({ name: 'Coffee & Espresso Beans', area: 'Bar' }),
      createCategoryFactory({ name: 'Syrups, Sauces & Powders', area: 'Bar' }),
      createCategoryFactory({ name: 'Cups, Lids & Packaging', area: 'Bar' }),
      createCategoryFactory({ name: 'Bakery & Pastries', area: 'Kitchen' }),
      createCategoryFactory({ name: 'Meats, Eggs & Dairy', area: 'Kitchen' }),
      createCategoryFactory({ name: 'Dry Goods & Condiments', area: 'Kitchen' }),
    ];

    const categoryMap = {};
    for (const c of categoriesData) {
      await client.query(
        `INSERT INTO categories (category_id, name, area) VALUES ($1, $2, $3)`,
        [c.category_id, c.name, c.area]
      );
      categoryMap[c.name] = c.category_id;
    }
    console.log(`✅ Seeded ${categoriesData.length} categories`);

    // 3. Seed Suppliers
    const suppliersData = [
      createSupplierFactory({
        name: 'Pacific Dairy & Oat Co.',
        contact_info: 'orders@pacificdairy.ph | +63 917 111 2233',
        lead_time_days: 2,
        min_order_qty: 6,
      }),
      createSupplierFactory({
        name: 'Highland Specialty Roasters',
        contact_info: 'wholesale@highlandroasters.ph | +63 917 222 3344',
        lead_time_days: 3,
        min_order_qty: 2,
      }),
      createSupplierFactory({
        name: 'Barista Syrups & Matcha PH',
        contact_info: 'sales@baristasyrups.ph | +63 917 333 4455',
        lead_time_days: 2,
        min_order_qty: 3,
      }),
      createSupplierFactory({
        name: 'Metro Kitchen & Artisanal Bakery',
        contact_info: 'supply@metrokitchen.ph | +63 917 444 5566',
        lead_time_days: 1,
        min_order_qty: 10,
      }),
    ];

    const supplierMap = {};
    for (const s of suppliersData) {
      await client.query(
        `INSERT INTO suppliers (supplier_id, name, contact_info, lead_time_days, min_order_qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [s.supplier_id, s.name, s.contact_info, s.lead_time_days, s.min_order_qty]
      );
      supplierMap[s.name] = s.supplier_id;
    }
    console.log(`✅ Seeded ${suppliersData.length} suppliers`);

    // 4. Seed Default CSV Import Template
    const templateRes = await client.query(
      `INSERT INTO import_templates (name, column_mapping, created_by)
       VALUES ($1, $2, $3) RETURNING template_id`,
      [
        'Krāv Excel Standard Sheet',
        JSON.stringify({
          'Item Description': 'name',
          'Section': 'area',
          'Category': 'category',
          'Base UOM': 'base_unit',
          'Buying UOM': 'purchase_unit',
          'Conversion': 'conversion_factor',
          'Par Level': 'par_level',
          'Reorder Point': 'reorder_point',
          'Cost per Buying Unit': 'unit_cost',
          'Storage Rack': 'custom_fields.storage_rack',
        }),
        adminUser.user_id,
      ]
    );
    const defaultTemplateId = templateRes.rows[0].template_id;

    // 5. Seed Inventory Items (Bar & Kitchen)
    const itemsData = [
      createItemFactory({
        name: 'Barista Oat Milk (1L)',
        category_id: categoryMap['Dairy & Plant Milk'],
        supplier_id: supplierMap['Pacific Dairy & Oat Co.'],
        template_id: defaultTemplateId,
        area: 'Bar',
        location: 'Bar Chiller 1',
        base_unit: 'ml',
        purchase_unit: 'carton',
        conversion_factor: 1000,
        par_level: 12000,
        reorder_point: 4000,
        unit_cost: 165.0,
        shelf_life_days: 14,
        custom_fields: { brand: 'Oatside', storage_temp: '2-4C' },
      }),
      createItemFactory({
        name: 'Full Cream Dairy Milk (1L)',
        category_id: categoryMap['Dairy & Plant Milk'],
        supplier_id: supplierMap['Pacific Dairy & Oat Co.'],
        template_id: defaultTemplateId,
        area: 'Bar',
        location: 'Bar Chiller 1',
        base_unit: 'ml',
        purchase_unit: 'carton',
        conversion_factor: 1000,
        par_level: 15000,
        reorder_point: 5000,
        unit_cost: 115.0,
        shelf_life_days: 10,
        custom_fields: { brand: 'Emborg', storage_temp: '2-4C' },
      }),
      createItemFactory({
        name: 'Signature Arabica Espresso Beans (1kg)',
        category_id: categoryMap['Coffee & Espresso Beans'],
        supplier_id: supplierMap['Highland Specialty Roasters'],
        template_id: defaultTemplateId,
        area: 'Bar',
        location: 'Dry Storage Bin A',
        base_unit: 'g',
        purchase_unit: 'bag',
        conversion_factor: 1000,
        par_level: 6000,
        reorder_point: 2000,
        unit_cost: 950.0,
        shelf_life_days: 30,
        custom_fields: { roast_profile: 'Medium-Dark', origin: 'Mt. Apo + Brazil' },
      }),
      createItemFactory({
        name: 'Salted Caramel Syrup (750ml)',
        category_id: categoryMap['Syrups, Sauces & Powders'],
        supplier_id: supplierMap['Barista Syrups & Matcha PH'],
        template_id: defaultTemplateId,
        area: 'Bar',
        location: 'Bar Speed Rail',
        base_unit: 'ml',
        purchase_unit: 'bottle',
        conversion_factor: 750,
        par_level: 3000,
        reorder_point: 1500,
        unit_cost: 480.0,
        shelf_life_days: 90,
        custom_fields: { brand: 'Monin', pump_dose_ml: 10 },
      }),
      createItemFactory({
        name: 'Uji Ceremonial Matcha Powder (500g)',
        category_id: categoryMap['Syrups, Sauces & Powders'],
        supplier_id: supplierMap['Barista Syrups & Matcha PH'],
        template_id: defaultTemplateId,
        area: 'Bar',
        location: 'Bar Cold Tin',
        base_unit: 'g',
        purchase_unit: 'pouch',
        conversion_factor: 500,
        par_level: 1500,
        reorder_point: 500,
        unit_cost: 1350.0,
        shelf_life_days: 60,
        custom_fields: { grade: 'Ceremonial First Harvest', origin: 'Kyoto' },
      }),
      createItemFactory({
        name: 'Butter Croissant Dough (Frozen Pack of 10)',
        category_id: categoryMap['Bakery & Pastries'],
        supplier_id: supplierMap['Metro Kitchen & Artisanal Bakery'],
        template_id: defaultTemplateId,
        area: 'Kitchen',
        location: 'Kitchen Freezer 1',
        base_unit: 'pcs',
        purchase_unit: 'pack',
        conversion_factor: 10,
        par_level: 50,
        reorder_point: 20,
        unit_cost: 520.0,
        shelf_life_days: 14,
        custom_fields: { bake_temp: '185C', bake_mins: 16 },
      }),
      createItemFactory({
        name: 'Smoked Farmer Ham (1kg Pack)',
        category_id: categoryMap['Meats, Eggs & Dairy'],
        supplier_id: supplierMap['Metro Kitchen & Artisanal Bakery'],
        template_id: defaultTemplateId,
        area: 'Kitchen',
        location: 'Kitchen Prep Chiller',
        base_unit: 'g',
        purchase_unit: 'pack',
        conversion_factor: 1000,
        par_level: 4000,
        reorder_point: 1500,
        unit_cost: 490.0,
        shelf_life_days: 7,
        custom_fields: { slice_weight_g: 50 },
      }),
    ];

    const itemMap = {};
    for (const item of itemsData) {
      await client.query(
        `INSERT INTO items (
          item_id, name, category_id, supplier_id, template_id, area, location,
          base_unit, purchase_unit, conversion_factor, par_level, reorder_point,
          unit_cost, shelf_life_days, custom_fields, is_archived
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          item.item_id,
          item.name,
          item.category_id,
          item.supplier_id,
          item.template_id,
          item.area,
          item.location,
          item.base_unit,
          item.purchase_unit,
          item.conversion_factor,
          item.par_level,
          item.reorder_point,
          item.unit_cost,
          item.shelf_life_days,
          JSON.stringify(item.custom_fields),
          item.is_archived,
        ]
      );
      itemMap[item.name] = item;
    }
    console.log(`✅ Seeded ${itemsData.length} inventory items`);

    // 6. Seed Append-Only Stock Movements (creating OK, Low, Critical, Out of Stock, and Overstock states)
    const oatMilk = itemMap['Barista Oat Milk (1L)'];
    const dairyMilk = itemMap['Full Cream Dairy Milk (1L)'];
    const espressoBeans = itemMap['Signature Arabica Espresso Beans (1kg)'];
    const caramelSyrup = itemMap['Salted Caramel Syrup (750ml)'];
    const matchaPowder = itemMap['Uji Ceremonial Matcha Powder (500g)'];
    const croissants = itemMap['Butter Croissant Dough (Frozen Pack of 10)'];
    const smokedHam = itemMap['Smoked Farmer Ham (1kg Pack)'];

    const movementsData = [
      // Oat Milk -> Initial 8 cartons (8,000ml), used 5,000ml -> Remaining: 3,000ml (LOW: reorder_point is 4,000ml)
      createStockMovementFactory({
        item_id: oatMilk.item_id,
        user_id: adminUser.user_id,
        type: 'Initial Count',
        qty_entered: 8,
        unit_entered: 'carton',
        base_unit: oatMilk.base_unit,
        conversion_factor: oatMilk.conversion_factor,
      }),
      createStockMovementFactory({
        item_id: oatMilk.item_id,
        user_id: barStaff.user_id,
        type: 'Stock Out',
        qty_entered: 5000,
        unit_entered: 'ml',
        base_unit: oatMilk.base_unit,
        conversion_factor: oatMilk.conversion_factor,
      }),

      // Dairy Milk -> Initial 10 cartons (10,000ml) -> Remaining: 10,000ml (OK)
      createStockMovementFactory({
        item_id: dairyMilk.item_id,
        user_id: adminUser.user_id,
        type: 'Initial Count',
        qty_entered: 10,
        unit_entered: 'carton',
        base_unit: dairyMilk.base_unit,
        conversion_factor: dairyMilk.conversion_factor,
      }),

      // Espresso Beans -> Initial 3 bags (3,000g), used 2,200g -> Remaining: 800g (CRITICAL: <= 50% of 2,000g reorder_point)
      createStockMovementFactory({
        item_id: espressoBeans.item_id,
        user_id: adminUser.user_id,
        type: 'Initial Count',
        qty_entered: 3,
        unit_entered: 'bag',
        base_unit: espressoBeans.base_unit,
        conversion_factor: espressoBeans.conversion_factor,
      }),
      createStockMovementFactory({
        item_id: espressoBeans.item_id,
        user_id: barStaff.user_id,
        type: 'Stock Out',
        qty_entered: 2200,
        unit_entered: 'g',
        base_unit: espressoBeans.base_unit,
        conversion_factor: espressoBeans.conversion_factor,
      }),

      // Caramel Syrup -> Initial 8 bottles (6,000ml) -> Remaining: 6,000ml (OVERSTOCK: > 1.5x of 3,000ml par_level)
      createStockMovementFactory({
        item_id: caramelSyrup.item_id,
        user_id: adminUser.user_id,
        type: 'Initial Count',
        qty_entered: 8,
        unit_entered: 'bottle',
        base_unit: caramelSyrup.base_unit,
        conversion_factor: caramelSyrup.conversion_factor,
      }),

      // Matcha Powder -> Initial 2 pouches (1,000g), used 100g -> Remaining: 900g (OK)
      createStockMovementFactory({
        item_id: matchaPowder.item_id,
        user_id: adminUser.user_id,
        type: 'Initial Count',
        qty_entered: 2,
        unit_entered: 'pouch',
        base_unit: matchaPowder.base_unit,
        conversion_factor: matchaPowder.conversion_factor,
      }),
      createStockMovementFactory({
        item_id: matchaPowder.item_id,
        user_id: barStaff.user_id,
        type: 'Stock Out',
        qty_entered: 100,
        unit_entered: 'g',
        base_unit: matchaPowder.base_unit,
        conversion_factor: matchaPowder.conversion_factor,
      }),

      // Croissants -> Initial 4 packs (40 pcs), waste 2 pcs -> Remaining: 38 pcs (OK)
      createStockMovementFactory({
        item_id: croissants.item_id,
        user_id: kitchenStaff.user_id,
        type: 'Initial Count',
        qty_entered: 4,
        unit_entered: 'pack',
        base_unit: croissants.base_unit,
        conversion_factor: croissants.conversion_factor,
      }),
      createStockMovementFactory({
        item_id: croissants.item_id,
        user_id: kitchenStaff.user_id,
        type: 'Waste',
        qty_entered: 2,
        unit_entered: 'pcs',
        base_unit: croissants.base_unit,
        conversion_factor: croissants.conversion_factor,
        reason: 'Over-baked during morning prep',
      }),

      // Smoked Ham -> 0 movements -> Remaining: 0g (OUT OF STOCK)
    ];

    for (const m of movementsData) {
      await client.query(
        `INSERT INTO stock_movements (
          movement_id, item_id, user_id, event_id, type,
          qty_entered, unit_entered, qty_base_unit, reason, batch_no, expiry_date, client_uuid
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          m.movement_id,
          m.item_id,
          m.user_id,
          m.event_id,
          m.type,
          m.qty_entered,
          m.unit_entered,
          m.qty_base_unit,
          m.reason,
          m.batch_no,
          m.expiry_date,
          m.client_uuid,
        ]
      );
    }
    console.log(`✅ Seeded ${movementsData.length} stock movements`);

    // 7. Seed Menu Items & Recipe Ingredients (Bill of Materials)
    const oatLatteRes = await client.query(
      `INSERT INTO menu_items (name, category, price) VALUES ($1, $2, $3) RETURNING menu_item_id`,
      ['Iced Oat Latte', 'Espresso & Coffee', 175.0]
    );
    const caramelMacchiatoRes = await client.query(
      `INSERT INTO menu_items (name, category, price) VALUES ($1, $2, $3) RETURNING menu_item_id`,
      ['Salted Caramel Latte', 'Espresso & Coffee', 185.0]
    );
    const hamCroissantRes = await client.query(
      `INSERT INTO menu_items (name, category, price) VALUES ($1, $2, $3) RETURNING menu_item_id`,
      ['Smoked Ham Croissant', 'Pastries & Sandwiches', 195.0]
    );

    const oatLatteId = oatLatteRes.rows[0].menu_item_id;
    const caramelMacchiatoId = caramelMacchiatoRes.rows[0].menu_item_id;
    const hamCroissantId = hamCroissantRes.rows[0].menu_item_id;

    const recipes = [
      // Iced Oat Latte: 18g Espresso Beans + 200ml Oat Milk
      [oatLatteId, espressoBeans.item_id, 18],
      [oatLatteId, oatMilk.item_id, 200],
      // Salted Caramel Latte: 18g Espresso Beans + 200ml Dairy Milk + 20ml Caramel Syrup
      [caramelMacchiatoId, espressoBeans.item_id, 18],
      [caramelMacchiatoId, dairyMilk.item_id, 200],
      [caramelMacchiatoId, caramelSyrup.item_id, 20],
      // Smoked Ham Croissant: 1 pc Croissant + 60g Smoked Ham
      [hamCroissantId, croissants.item_id, 1],
      [hamCroissantId, smokedHam.item_id, 60],
    ];

    for (const [menuId, itemId, qty] of recipes) {
      await client.query(
        `INSERT INTO recipe_ingredients (menu_item_id, item_id, qty_per_serving) VALUES ($1, $2, $3)`,
        [menuId, itemId, qty]
      );
    }
    console.log(`✅ Seeded 3 menu items and ${recipes.length} recipe ingredients`);

    // 8. Seed Upcoming Event Booking + Event Menu
    const eventRes = await client.query(
      `INSERT INTO events (name, event_date, guest_count, buffer_pct, status, notes, created_by)
       VALUES ($1, CURRENT_DATE + INTERVAL '4 days', $2, $3, $4, $5, $6) RETURNING event_id`,
      [
        'Tech Startup Coffee & Pastry Mixer (80 pax)',
        80,
        10.0,
        'Confirmed',
        'Morning corporate event booking requiring oat lattes and ham croissants.',
        purchaserUser.user_id,
      ]
    );
    const eventId = eventRes.rows[0].event_id;

    await client.query(
      `INSERT INTO event_menu (event_id, menu_item_id, servings) VALUES ($1, $2, $3), ($1, $4, $5)`,
      [eventId, oatLatteId, 60, hamCroissantId, 80]
    );

    // 9. Seed AI Forecasts & Actionable Recommendations
    await client.query(
      `INSERT INTO forecasts (item_id, forecast_date, predicted_qty, lower_bound, upper_bound, model_name)
       VALUES ($1, CURRENT_DATE + INTERVAL '1 day', 1800, 1500, 2100, 'MovingAverage'),
              ($2, CURRENT_DATE + INTERVAL '1 day', 450, 380, 520, 'MovingAverage')`,
      [oatMilk.item_id, espressoBeans.item_id]
    );

    await client.query(
      `INSERT INTO recommendations (item_id, event_id, type, message, suggested_qty, status)
       VALUES
         ($1, $4, 'Event Preparation', '80-pax event in 4 days requires 13.2L Oat Milk (incl. 10% buffer). Current stock is 3.0L. Buy 12 cartons by tomorrow.', 12, 'Pending'),
         ($2, NULL, 'Suggested Order', 'Arabica Espresso Beans are Critical (800g left, ~1.7 days supply vs 3-day supplier lead time). Order 6 bags immediately.', 6, 'Pending'),
         ($3, NULL, 'Overstock Warning', 'Salted Caramel Syrup is at 200% of par level (6,000ml on hand). Skip next order cycle.', 0, 'Pending')`,
      [oatMilk.item_id, espressoBeans.item_id, caramelSyrup.item_id, eventId]
    );
    console.log('✅ Seeded sample event booking, AI forecasts, and prescriptions');
  });

  // Display summary from stock_on_hand_view
  const { rows: summary } = await pool.query(`
    SELECT name, area, stock_on_hand, base_unit, stock_status
    FROM stock_on_hand_view
    ORDER BY area, name;
  `);
  console.log('\n📊 Current Stock Ledger Summary (from stock_on_hand_view):');
  console.table(summary);
  console.log('🎉 Database seeding completed successfully!');
}

// CLI execution
if (process.argv[1] === __filename) {
  (async () => {
    try {
      await seedDatabase();
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      await pool.end();
      process.exit(1);
    }
  })();
}

