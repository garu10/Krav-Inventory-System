---
name: krav-project-proposal
description: >-
  The full Krāv Cafe Inventory System project proposal. Consult this skill when
  working on feature design, scope decisions, data model questions, MoSCoW
  priorities, AI prediction/prescription features, user roles, MVC structure,
  OOP application, or any task that needs to reference the original project plan.
metadata:
  short-description: Krāv Project Proposal
---

**Krav Cafe \- Inventory System**

*Problem Description:*

- Currently, the store is dependent on using “Excel” tool for their Inventory Management. This includes both Bar and Kitchen supplies inventory which is very hard to navigate especially for mobile screens which in store’s case, they use a Tablet device.  
- Some employees are experiencing difficulty in the In/Out of stocks which causes difficulty in buying stocks/supplies. On some cases, some stocks/supplies are being labeled as 0 or “Low” even though there’s still so much supplies which causes  inaccurate forecasting of stocks  
- They manually input (type) all stocks data in the Excel which is quite a hassle especially for a non-techy person/employee  
- Because of inaccurate forecasting of the current status of supplies, there’s an occurrence of “oversupply” or “undersupply” because the stock purchaser is relying on the inventory status with inaccurate supply status  
- Since the Store already has their own Inventory List files in Excel tool (.csv), it needs an Inventory System that can adapt easily to their inventory lists, making its own columns, rows, etc. by just importing their Inventory List  
  - It must also be accessible offline since the current location of the store is prone to power interruptions. Either make the Inventory List exportable or make the Inventory System itself offline accessible (still depends on what I can do)  
- They also experience unexpected need for supply purchasing because of inaccurate inventory (Example case: The stock is still not being labeled as “Low” which results to not being included in the Purchase list)  
  - Also, there’s unexpected Event Bookings in the store which covers massive orders resulting in unexpected and immediate buying of supplies in order to support massive orders.

*Project Proposal:*

1. **System Type** \- Inventory system built for tablets. It uses a flexible, CSV-importable item schema, a transaction-based stock ledger, and an AI module that predicts demand and prescribes purchases.

| Progressive Web App (PWA) | Installs to the tablet's home screen with no app store needed. It runs on tablets, phones, and desktops, and opens without internet. |
| :---- | :---- |
| **Offline-first architecture** | Power interruptions often bring down the Wi-Fi router too. The tablet stores data locally and syncs to the server when the connection returns. |
| **Flexible schema** | Fixed core fields plus custom fields let the store's existing CSV columns be imported without redesigning them. |
| **Stock movement ledger** | Stock is calculated from every In/Out/Adjustment entry instead of being typed into a cell. This prevents wrong "0"/"Low" labels and makes every change traceable. |
| **AI prediction and prescription** | Forecasts usage and recommends what to buy, how much, and when, including supplies for event bookings. |

2. ### **Problem-to-Solution Mapping**

| Dependence on Excel | Both Bar and Kitchen inventories are kept in Excel, which is very hard to navigate on mobile screens. The store uses a tablet as its main device. | Tablet-first, touch-friendly UI with search, filters, and Bar/Kitchen tabs |
| :---- | :---- | :---- |
| **Difficulty with Stock In/Out** | Some employees have difficulty recording stock In/Out, which makes buying stocks and supplies harder. | Guided one-screen In/Out flows with \+/− steppers, preset quantities, and QR scanning |
| **Inaccurate stock status** | Some stocks and supplies are labeled "0" or "Low" even when plenty is still on hand, which makes stock forecasting inaccurate. | Ledger-based stock, unit conversion, per-item thresholds, physical counts with variance reports, audit trail |
| **Manual data entry** | All stock data is typed into Excel by hand, which is a hassle, especially for non-technical employees. | CSV import, QR/barcode scanning, autocomplete, quick-add buttons, minimal typing |
| **Oversupply and undersupply** | The stock purchaser relies on inaccurate inventory status, which leads to oversupply or undersupply. | AI demand forecasting, dynamic reorder points, suggested order quantities |
| **Existing inventory lists** | The store already has its own inventory lists as Excel/.csv files. The system must adapt to them easily, building its own columns and rows simply by importing those lists. | Import wizard with column mapping, custom fields, and saved mapping templates |
| **Offline accessibility** | The store's location is prone to power interruptions. The inventory list must be exportable, or the system itself must work offline. | PWA with local storage and a sync queue, plus CSV/XLSX/PDF export |
| **Unexpected supply purchasing** | Because the inventory is inaccurate, some items are never labeled "Low" and are left out of the purchase list, forcing unplanned buying. | Purchase list generated automatically from predicted stockout dates, plus alerts |
| **Unexpected event bookings** | Unplanned event bookings with large orders force immediate, unplanned purchases of supplies. | Event module: menu × guest count → ingredient needs → shortage list and purchase plan |

3. ### **AI Prediction Features**

| Demand forecasting | Expected usage per item for the next 7, 14, and 30 days. |
| :---- | :---- |
| **Stockout date prediction** | Estimated date each item will run out (e.g., "Oat milk runs out in about 3 days"). |
| **Event demand estimation** | Ingredient needs from guest count and menu, adjusted using past events. |
| **Seasonality and trend detection** | Weekend spikes, seasonal drink shifts, payday peaks. |
| **Expiry/spoilage risk** | Perishable items likely to expire before they are used. |
| **Supplier lead-time prediction** | Learned from actual order-to-delivery times. |

4. ### **AI Prescription Features**

| Dynamic reorder point | Reorder point \= forecast demand during lead time \+ safety stock, recalculated automatically instead of a fixed "Low" value. (P8) |
| :---- | :---- |
| **Suggested order quantity** | Quantity needed to reach the target stock level, rounded to purchase units and supplier minimums. (P5) |
| **Smart purchase list** | Items ranked by urgency (days until stockout vs lead time) and grouped by supplier. |
| **Event preparation plan** | What to buy for an event, how much, and the buy-by date (e.g., "80-pax event on Saturday: buy 12 L milk, 3 kg beans by Thursday"). (P9) |
| **Anomaly detection** | Flags unlikely entries such as sudden drops to 0, Stock Out larger than stock on hand, or unusually high usage. (P3) |
| **Overstock warning** | Advises skipping or reducing orders for items with excess days of supply. |
| **Waste reduction suggestions** | Recommends using soon-to-expire items first and adjusting order sizes. |
| **Budget optimization** (stretch goal) | Recommends the best purchase mix within a set budget. |
| **Natural-language assistant** (stretch goal) | Answers questions like "What do I need to buy for Saturday?" using system data. |

5. **Functional Requirements**

1. ### **User and Access Management**

- Log in with a PIN for fast tablet access, and email/password for administrators.  
- Role-based access control (Owner/Admin, Manager/Purchaser, Staff).  
- Record every action with the user and a timestamp for accountability.  
- Allow offline login using securely cached credentials.

2. ### **Inventory List**

- Separate Bar and Kitchen inventories, with custom categories (e.g., Dairy, Syrups, Dry Goods).  
- Core item fields: name, category, location, base unit, purchase unit, conversion factor, par level, reorder point, supplier, unit cost, shelf life.  
- Custom fields created from imported CSV columns.  
- Search, filter, and sort, with large touch targets and card or table views.  
- Color-coded status indicators: OK, Low, Critical, Out of Stock, Overstock.  
- Generate printable QR code labels for each item.  
- Archive items instead of deleting them, keeping their history.

3. ### **CSV Import and Schema Adaptation**

- Upload inventory lists in .csv or .xlsx format.  
- Preview the data and automatically detect column types (text, number, date, unit).  
- Column mapping wizard: map each column to a core field, create a custom field, or skip it.  
- Save column mappings as reusable import templates.  
- Validate rows and report errors (duplicates, missing names, invalid numbers).  
- Record imported opening quantities as "Initial Count" stock movements.  
- AI-assisted column mapping suggestions.

4. ### **Stock Movement (In/Out)**

- Movement types: Stock In, Stock Out, Waste/Spoilage, Transfer (Bar ↔ Kitchen), Adjustment, Event Usage.  
- Three-tap flow: select or scan the item → tap a quantity (steppers or presets) → confirm.  
- Unit conversion between purchase units (packs/cases) and usage units (grams/ml/pieces).  
- Batch mode for receiving a full delivery in one session.  
- Require a reason for waste and adjustment entries.  
- Corrections are recorded as new entries. Records are never overwritten.  
- Optional batch, expiry date, and FIFO tracking for perishable items.

5. ### **Physical Stock Count and Reconciliation**

- Scheduled stock counts (daily for perishables, weekly for other items).  
- Count mode for entering actual on-hand quantities.  
- Variance report comparing system and counted quantities.  
- Approving variances automatically creates adjustment movements.  
- AI anomaly detection flags suspicious entries.

6. ### **Purchasing / Purchase List**

- Generate the purchase list automatically from AI-predicted needs, not only the "Low" status.  
- Suggested order quantity for each item, editable by the purchaser.  
- Group the list by supplier, with estimated cost and total.  
- Purchase status flow: Draft → Approved → Ordered → Received. Receiving creates Stock In entries.  
- Supplier management with lead times and minimum order quantities.

7. ### **Recipes / Bill of Materials**

8. ### **Event Booking Management**

9. ### **Dashboard and Reports**

- Dashboard: items at risk, predicted stockouts (next 7 days), today's purchase list, upcoming events.  
- Reports: consumption trends, waste, variances, inventory value, supplier spend.  
- Per-item charts showing history and forecast.

10. ### **Notifications**

- Alerts for Low, Critical, predicted stockout within lead time, expiring items, and event shortages.  
- Daily inventory summary for the purchaser.

11. ### **Offline Access and Synchronization**

- Installable PWA with a service worker that caches the application.  
- Local database (IndexedDB) storing items, movements, and the latest forecasts.  
- Outbox/sync queue that pushes offline actions when the connection returns.  
- Conflict handling: movements are append-only. Item edits use last-write-wins and are logged.  
- Online/offline indicator and last-synced timestamp.  
- Cached forecasts and recommendations available while offline.

12. ### **Export and Backup**

- Export inventory, purchase lists, and reports to CSV, XLSX, and PDF, even while offline.  
- Exports keep the original import column layout so Excel can be used as a fallback.

	**F. Non-functional Requirements**

1. **Usability**   
- Tablet-first layout (10-inch, landscape and portrait), touch targets of at least 44 px, readable fonts, minimal typing, optional Filipino/English labels  
2. **Offline Availability**  
- Core features (viewing, Stock In/Out, counts, purchase list) work without internet  
3. **Reliability**  
- No data loss during power interruptions. Data is saved locally first, then synced.  
4. **Performance**  
- Lists of 1,000+ items load in under 2 seconds. Stock movements save locally in under 300 ms.  
5. **Data Integrity**  
- Append-only stock ledger, database transactions, and warnings before negative stock.  
6. **Security**  
- Hashed passwords/PINs (bcrypt), token-based authentication (JWT), HTTPS, role-based access, input validation, parameterized SQL queries  
7. **Auditability**  
- Every change logged with user, action, timestamp, and before/after values.  
8. **Maintainability**  
- Layered backend (routes → controllers → services → database), database migrations, environment-based configuration.  
9. **Scalability**  
- Data model ready for multiple branches in the future.  
10. **Backup and Recovery**  
- Automated daily backups. Manual export available at any time.  
11. **Compatibility**  
- Chrome and Safari on Android tablets and iPads, plus desktop browsers.

## **D. AI Prediction and Prescription**

The AI module turns the stock movement history into forward-looking insights (**prediction**) and specific, actionable recommendations (**prescription**), so the purchaser no longer relies on manual guesswork.

### **1\. Principles for Getting the Most Out of the AI**

| Principle | Application |
| :---- | :---- |
| **Capture every movement** | The stock ledger is the AI's training data. Usage comes from Stock Out, Waste, and Event Usage entries. |
| **Add context** | Day of week, holidays, paydays, events, menu changes, promotions, and optionally weather. |
| **Separate normal and event demand** | Event usage is tagged separately so it doesn't inflate everyday forecasts. |
| **Recipe-driven demand** | Forecast menu-item sales, then convert them into ingredient needs through recipes. |
| **Explainable recommendations** | Each suggestion shows its reasoning, e.g., "Buy 6 L milk: average 2.1 L/day, 2-day lead time, event on Saturday (+4 L)." |
| **Human in the loop** | The purchaser can accept or edit suggestions. Their decisions are fed back to improve the model. |
| **Start simple, improve over time** | Rule-based estimates at first, then statistical and machine-learning models as more data is collected. |

### **2\. AI Prediction Features (What Will Happen)**

| ID | Feature | Output |
| :---- | :---- | :---- |
| AI-P1 | **Demand forecasting** | Expected usage per item for the next 7, 14, and 30 days. |
| AI-P2 | **Stockout date prediction** | Estimated date each item will run out (e.g., "Oat milk runs out in about 3 days"). |
| AI-P3 | **Event demand estimation** | Ingredient needs from guest count and menu, adjusted using past events. |
| AI-P4 | **Seasonality and trend detection** | Weekend spikes, seasonal drink shifts, payday peaks. |
| AI-P5 | **Expiry/spoilage risk** | Perishable items likely to expire before they are used. |
| AI-P6 | **Supplier lead-time prediction** | Learned from actual order-to-delivery times. |

### **3\. AI Prescription Features (What To Do)**

| ID | Feature | Output |
| :---- | :---- | :---- |
| AI-R1 | **Dynamic reorder point** | Reorder point \= forecast demand during lead time \+ safety stock, recalculated automatically instead of a fixed "Low" value. (P8) |
| AI-R2 | **Suggested order quantity** | Quantity needed to reach the target stock level, rounded to purchase units and supplier minimums. (P5) |
| AI-R3 | **Smart purchase list** | Items ranked by urgency (days until stockout vs lead time) and grouped by supplier. |
| AI-R4 | **Event preparation plan** | What to buy for an event, how much, and the buy-by date (e.g., "80-pax event on Saturday: buy 12 L milk, 3 kg beans by Thursday"). (P9) |
| AI-R5 | **Anomaly detection** | Flags unlikely entries such as sudden drops to 0, Stock Out larger than stock on hand, or unusually high usage. (P3) |
| AI-R6 | **Overstock warning** | Advises skipping or reducing orders for items with excess days of supply. |
| AI-R7 | **Waste reduction suggestions** | Recommends using soon-to-expire items first and adjusting order sizes. |
| AI-R8 | **Budget optimization** (stretch goal) | Recommends the best purchase mix within a set budget. |
| AI-R9 | **Natural-language assistant** (stretch goal) | Answers questions like "What do I need to buy for Saturday?" using system data. |

### **4\. Forecasting Model Roadmap**

| Stage | Data Available | Technique |
| :---- | :---- | :---- |
| **Stage 0:** Cold start | No history | Rule-based: par levels from the imported CSV, recipe × average sales. |
| **Stage 1:** 2–4 weeks | Short history | Moving average, weighted moving average, day-of-week factors. |
| **Stage 2:** 2+ months | Medium history | Exponential smoothing (Holt-Winters), linear regression with features. |
| **Stage 3:** Mature | Rich history \+ events | Prophet or gradient boosting (XGBoost/LightGBM) with event, holiday, and weather features. |

### **5\. Key Computations and Evaluation**

* **Safety Stock** \= z × σ(daily demand) × √(lead time). For example, z \= 1.65 targets a 95% service level.  
* **Reorder Point** \= average daily demand × lead time \+ safety stock.  
* **Suggested Order Quantity** \= target stock level − (current stock \+ incoming orders).  
* **Days of Supply** \= current stock ÷ forecast average daily demand.  
* **Evaluation Metrics:** MAE and MAPE per item, number of stockouts, and number of overstock days.

### **6\. AI Feedback Loop**

1. Stock movements, sales, and events are recorded.  
2. The forecasting model predicts demand per item.  
3. The prescription engine generates reorder alerts, order quantities, and event plans.  
4. The purchaser accepts or edits the recommendations.  
5. Actual usage and physical counts are recorded and fed back to retrain the model.

## **E. Data Model / Schema (Overall)**

The database is relational (PostgreSQL). Current stock is never stored as an editable value. It is calculated as the sum of all stock movements per item (e.g., through a database view), which keeps it accurate and auditable.

### **1\. Entities and Attributes**

| Table | Key Attributes | Description |
| :---- | :---- | :---- |
| **users** | user\_id (PK), full\_name, email, password\_hash, pin\_hash, role, area, is\_active, created\_at | System users and their access level. |
| **categories** | category\_id (PK), name, area (Bar/Kitchen) | Item groupings. |
| **suppliers** | supplier\_id (PK), name, contact\_info, lead\_time\_days, min\_order\_qty | Supplier details. |
| **import\_templates** | template\_id (PK), name, column\_mapping (JSONB), created\_by (FK) | Saved CSV column mappings. |
| **items** | item\_id (PK), name, category\_id (FK), supplier\_id (FK), template\_id (FK), area, location, base\_unit, purchase\_unit, conversion\_factor, par\_level, reorder\_point, unit\_cost, shelf\_life\_days, custom\_fields (JSONB), is\_archived, created\_at, updated\_at | Item master list, including custom CSV fields. |
| **stock\_movements** | movement\_id (PK), item\_id (FK), user\_id (FK), event\_id (FK, nullable), type, qty\_entered, unit\_entered, qty\_base\_unit, reason, batch\_no, expiry\_date, client\_uuid (unique), created\_at, synced\_at | Append-only ledger of all stock changes. |
| **stock\_counts** | count\_id (PK), counted\_by (FK), approved\_by (FK), status, counted\_at | Physical count sessions. |
| **stock\_count\_lines** | line\_id (PK), count\_id (FK), item\_id (FK), system\_qty, counted\_qty, variance | Count results for each item. |
| **menu\_items** | menu\_item\_id (PK), name, category, price, is\_active | Products sold by the cafe. |
| **recipe\_ingredients** | menu\_item\_id (FK), item\_id (FK), qty\_per\_serving | Bill of materials per menu item. |
| **daily\_sales** | sale\_id (PK), menu\_item\_id (FK), sale\_date, qty\_sold | Daily sales used for demand forecasting. |
| **events** | event\_id (PK), name, event\_date, guest\_count, buffer\_pct, status, notes, created\_by (FK) | Event bookings. |
| **event\_menu** | event\_id (FK), menu\_item\_id (FK), servings | Menu items and servings per event. |
| **purchase\_lists** | list\_id (PK), type (Regular/Event), event\_id (FK, nullable), status, created\_by (FK), approved\_by (FK), created\_at | Purchase list header. |
| **purchase\_items** | purchase\_item\_id (PK), list\_id (FK), item\_id (FK), supplier\_id (FK), suggested\_qty, final\_qty, unit\_cost, received\_qty | Line items of a purchase list. |
| **forecasts** | forecast\_id (PK), item\_id (FK), forecast\_date, predicted\_qty, lower\_bound, upper\_bound, model\_name, generated\_at | AI demand predictions. |
| **recommendations** | rec\_id (PK), item\_id (FK), event\_id (FK, nullable), type, message, suggested\_qty, status (Pending/Accepted/Edited/Dismissed), created\_at | AI prescriptions and user responses. |
| **audit\_logs** | log\_id (PK), user\_id (FK), entity, entity\_id, action, before\_data (JSONB), after\_data (JSONB), created\_at | History of all changes. |

### **2\. Entity Relationships**

| Relationship | Cardinality | Description |
| :---- | :---- | :---- |
| users → stock\_movements | One-to-Many | A user records many stock movements. |
| categories → items | One-to-Many | A category contains many items. |
| suppliers → items | One-to-Many | A supplier provides many items. |
| import\_templates → items | One-to-Many | A template can import many items. |
| items → stock\_movements | One-to-Many | An item has many stock movements. |
| stock\_counts → stock\_count\_lines | One-to-Many | A count session has many count lines. |
| menu\_items ↔ items (via recipe\_ingredients) | Many-to-Many | A menu item uses many ingredients, and an ingredient is used in many menu items. |
| menu\_items → daily\_sales | One-to-Many | A menu item has many daily sales records. |
| events ↔ menu\_items (via event\_menu) | Many-to-Many | An event serves many menu items. |
| events → stock\_movements | One-to-Many | An event can have many event-usage movements. |
| purchase\_lists → purchase\_items | One-to-Many | A purchase list contains many line items. |
| items → forecasts / recommendations | One-to-Many | An item has many forecasts and recommendations. |

## **F. User Roles**

| Role | Responsibilities and Permissions |
| :---- | :---- |
| **Owner / Admin** | Full access: user management, system settings, CSV imports, all reports, approving adjustments and purchase lists. |
| **Manager / Purchaser** | Manages purchase lists, suppliers, and events. Approves stock counts and views AI insights and recommendations. |
| **Staff (Bar / Kitchen)** | Records Stock In/Out, waste, and stock counts, and views items. Access is limited to their assigned area. |

## **G. Feature Prioritization (MoSCoW)**

| Priority | Features |
| :---- | :---- |
| **Must Have** | User authentication and roles; item master list; CSV import with column mapping; Stock In/Out ledger; unit conversion; stock status indicators; purchase list; offline PWA with sync; CSV/XLSX export; basic demand forecast (moving average) with dynamic reorder point. |
| **Should Have** | Physical stock count with variance report; recipes/bill of materials; event booking module with gap analysis; notifications; dashboard charts; anomaly detection; audit log. |
| **Could Have** | QR code labels and scanning; expiry/FIFO tracking; AI-assisted column mapping; advanced forecasting (Holt-Winters/Prophet); supplier lead-time learning; PDF reports. |
| **Won't Have (this version)** | POS integration; multi-branch support; natural-language AI assistant; budget optimization. |

## **H. Backend Architecture: MVC Pattern**

The backend follows the **Model-View-Controller (MVC)** pattern for file and responsibility organization. In the context of a REST API (no server-rendered views), MVC maps to:

| MVC Layer | Role in This Project | Example |
| :---- | :---- | :---- |
| **Model** | Defines entity structure, database schema, and data-access logic (repositories). | `Item`, `StockMovement`, `User`, `PurchaseList` models and their repository classes. |
| **View** | The API's JSON responses and serialization logic. In a REST API the "view" is the response shape, not an HTML template. | Response DTOs (Data Transfer Objects) that control what fields are sent to the client. |
| **Controller** | Receives HTTP requests, validates input, delegates to services, and returns responses. Controllers contain no business logic. | `ItemController.create()` validates the request body, calls `ItemService.createItem()`, and returns the result. |

A **Service Layer** sits between Controller and Model to hold business rules, keeping controllers thin and models focused on data:

```
Request → Route → Controller → Service → Repository → Database
                                  ↓
                            Business Rules
                        (validation, calculations,
                         audit logging, forecasting)
```

### Backend File Structure (MVC + Modular)

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts     # Handles login/register HTTP requests
│   │   ├── auth.service.ts        # PIN/password verification, JWT issuance
│   │   ├── auth.routes.ts         # POST /auth/login, POST /auth/register
│   │   └── auth.model.ts          # User entity class, role definitions
│   ├── inventory/
│   │   ├── item.controller.ts     # CRUD endpoints for items
│   │   ├── item.service.ts        # Archive logic, custom fields, status calc
│   │   ├── item.repository.ts     # SQL queries for items table
│   │   ├── item.model.ts          # Item entity class with unit conversion
│   │   ├── item.routes.ts         # GET/POST/PATCH /items
│   │   └── category.model.ts      # Category entity class
│   ├── movements/
│   │   ├── movement.controller.ts
│   │   ├── movement.service.ts    # Ledger rules, idempotency, stock calc
│   │   ├── movement.repository.ts
│   │   ├── movement.model.ts      # StockMovement entity class
│   │   └── movement.routes.ts
│   ├── purchasing/
│   │   ├── purchase.controller.ts
│   │   ├── purchase.service.ts    # Status flow, order qty calculation
│   │   ├── purchase.repository.ts
│   │   ├── purchase.model.ts      # PurchaseList & PurchaseItem entities
│   │   └── purchase.routes.ts
│   ├── forecasting/
│   │   ├── forecast.controller.ts
│   │   ├── forecast.service.ts    # Strategy selection, model execution
│   │   ├── forecast.repository.ts
│   │   ├── forecast.model.ts      # Forecast & Recommendation entities
│   │   └── forecast.routes.ts
│   ├── counts/                    # Physical count module
│   ├── recipes/                   # BOM / menu items module
│   ├── events/                    # Event booking module
│   ├── imports/                   # CSV/XLSX import module
│   ├── exports/                   # Export generation module
│   ├── notifications/             # Alert & email module
│   └── audit/                     # Audit logging module
├── shared/
│   ├── middleware/                 # Auth guards, error handler, validation
│   ├── database/                  # pg pool, migrations, query helpers
│   └── utils/                     # Unit conversion, date helpers
└── server.ts
```

---

## **I. Object-Oriented Programming (OOP) Application**

### 1. Why OOP Fits This Project

The Krāv Inventory System has a **rich domain model** with clearly defined entities that carry both state and behavior:

- **Items** have properties (name, unit, cost) and behavior (convert units, check status, archive).
- **Stock Movements** have data (qty, type, timestamp) and rules (must be append-only, must convert to base unit, must carry a reason for adjustments).
- **Purchase Lists** have a lifecycle (Draft → Approved → Ordered → Received) with state-dependent behavior.
- **Forecasts** have interchangeable algorithms (Strategy pattern) that must be swapped as data matures.

These are exactly the conditions where OOP provides the most value: **entities with state, behavior, rules, and lifecycles**.

### 2. Noun-Verb Analysis — Mapping the Domain to OOP

From the project requirements, the **nouns** become classes and the **verbs** become methods:

| Noun (→ Class) | Key Verbs (→ Methods) |
| :---- | :---- |
| **User** | `authenticate()`, `verifyPin()`, `hasPermission(action)`, `hashPassword()` |
| **Item** | `convertToBaseUnit(qty, unit)`, `getStatus()`, `archive()`, `applyCustomFields(csv)` |
| **StockMovement** | `validate()`, `convertQuantity()`, `isIdempotent(clientUuid)` |
| **StockCount** | `calculateVariance()`, `approve()`, `generateAdjustments()` |
| **PurchaseList** | `addItem()`, `approve()`, `markOrdered()`, `receive(receivedQtys)`, `calculateTotal()` |
| **Supplier** | `getLeadTime()`, `updateLeadTime(actualDays)` |
| **Event** | `calculateIngredientNeeds()`, `getShortageList(currentStock)`, `getBuyByDate(leadTimes)` |
| **Forecast** | `predict(horizon)`, `getStockoutDate()`, `getReorderPoint()`, `getSuggestedQty()` |
| **Recipe** | `getIngredients()`, `scaleToServings(count)`, `calculateCost()` |
| **AuditLog** | `record(user, action, before, after)` |

### 3. Where OOP Is Applied — Layer by Layer

#### A. Model Layer (Entities) — **Heavy OOP**

Each database entity is represented as a class with encapsulated state and behavior. This is where OOP delivers the most value.

**Example — Item Entity:**

```typescript
class Item {
  private id: string;
  private name: string;
  private baseUnit: string;
  private purchaseUnit: string;
  private conversionFactor: number;
  private parLevel: number;
  private reorderPoint: number;
  private shelfLifeDays: number | null;
  private isArchived: boolean;
  private customFields: Record<string, unknown>;

  // Behavior: unit conversion (encapsulates the conversion rule)
  convertToBaseUnit(qty: number, unit: string): number {
    if (unit === this.baseUnit) return qty;
    return qty * this.conversionFactor;
  }

  // Behavior: derive stock status from a given quantity
  getStatus(stockOnHand: number): StockStatus {
    if (stockOnHand <= 0) return StockStatus.OUT_OF_STOCK;
    if (stockOnHand <= this.reorderPoint * 0.5) return StockStatus.CRITICAL;
    if (stockOnHand <= this.reorderPoint) return StockStatus.LOW;
    if (stockOnHand > this.parLevel * 1.5) return StockStatus.OVERSTOCK;
    return StockStatus.OK;
  }

  // Behavior: archive instead of delete
  archive(): void {
    this.isArchived = true;
  }
}
```

**Example — StockMovement Entity:**

```typescript
class StockMovement {
  private itemId: string;
  private userId: string;
  private type: MovementType;  // StockIn, StockOut, Waste, Transfer, Adjustment, EventUsage
  private qtyEntered: number;
  private unitEntered: string;
  private qtyBaseUnit: number;
  private reason: string | null;
  private clientUuid: string;  // Idempotency key from device

  // Behavior: enforce business rule — reason required for waste/adjustment
  validate(): ValidationResult {
    const errors: string[] = [];
    if (this.qtyEntered <= 0) errors.push('Quantity must be positive');
    if ((this.type === 'Waste' || this.type === 'Adjustment') && !this.reason) {
      errors.push('Reason is required for waste and adjustment entries');
    }
    return { isValid: errors.length === 0, errors };
  }

  // Behavior: convert entered quantity to base unit using the item's factor
  convertQuantity(item: Item): void {
    this.qtyBaseUnit = item.convertToBaseUnit(this.qtyEntered, this.unitEntered);
  }
}
```

**Example — PurchaseList Entity (Lifecycle with state-dependent behavior):**

```typescript
class PurchaseList {
  private status: PurchaseStatus;  // Draft, Approved, Ordered, Received
  private items: PurchaseItem[];

  // Behavior: state machine — only allow valid transitions
  approve(approvedBy: string): void {
    if (this.status !== PurchaseStatus.DRAFT) {
      throw new Error('Only draft lists can be approved');
    }
    this.status = PurchaseStatus.APPROVED;
  }

  markOrdered(): void {
    if (this.status !== PurchaseStatus.APPROVED) {
      throw new Error('Only approved lists can be marked as ordered');
    }
    this.status = PurchaseStatus.ORDERED;
  }

  // Behavior: receiving creates Stock In movements
  receive(receivedQtys: Map<string, number>): StockMovement[] {
    if (this.status !== PurchaseStatus.ORDERED) {
      throw new Error('Only ordered lists can be received');
    }
    this.status = PurchaseStatus.RECEIVED;
    return this.items.map(item => item.createStockInMovement(receivedQtys.get(item.id)));
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.finalQty * item.unitCost, 0);
  }
}
```

#### B. Service Layer — **Moderate OOP**

Services are classes that orchestrate business operations across multiple entities. They depend on repositories (injected via constructor) rather than accessing the database directly.

```typescript
class MovementService {
  constructor(
    private movementRepo: MovementRepository,
    private itemRepo: ItemRepository,
    private auditService: AuditService
  ) {}

  async recordMovement(dto: CreateMovementDTO, userId: string): Promise<StockMovement> {
    const item = await this.itemRepo.findById(dto.itemId);
    const movement = new StockMovement(dto);
    movement.convertQuantity(item);

    const validation = movement.validate();
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const saved = await this.movementRepo.insert(movement);
    await this.auditService.record(userId, 'MOVEMENT_CREATED', null, saved);
    return saved;
  }
}
```

#### C. Repository Layer — **Moderate OOP**

Repositories are classes that encapsulate all database queries for a given entity. They implement a shared interface, enabling the same interface to work with PostgreSQL (backend) and SQLite (mobile).

```typescript
// Interface (shared contract)
interface MovementRepository {
  insert(movement: StockMovement): Promise<StockMovement>;
  findByItem(itemId: string, range: DateRange): Promise<StockMovement[]>;
  getStockOnHand(itemId: string): Promise<number>;
}

// PostgreSQL implementation (backend)
class PgMovementRepository implements MovementRepository {
  constructor(private pool: Pool) {}

  async insert(movement: StockMovement): Promise<StockMovement> {
    const result = await this.pool.query(
      `INSERT INTO stock_movements (...) VALUES (...) 
       ON CONFLICT (client_uuid) DO NOTHING RETURNING *`,
      [movement.itemId, movement.qtyBaseUnit, movement.clientUuid, ...]
    );
    return result.rows[0];
  }

  async getStockOnHand(itemId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COALESCE(SUM(qty_base_unit), 0) as stock 
       FROM stock_movements WHERE item_id = $1`,
      [itemId]
    );
    return result.rows[0].stock;
  }
}
```

#### D. Controller Layer — **Light OOP**

Controllers are thin classes that parse requests and delegate to services. They contain no business logic.

```typescript
class MovementController {
  constructor(private movementService: MovementService) {}

  async create(req: Request, res: Response): Promise<void> {
    const movement = await this.movementService.recordMovement(req.body, req.user.id);
    res.status(201).json(movement);
  }
}
```

#### E. Strategy Pattern — **Polymorphism in Action (Forecasting)**

The forecasting module uses polymorphism to swap algorithms without changing calling code:

```typescript
// Abstract base (interface)
interface ForecastStrategy {
  predict(item: Item, history: StockMovement[], horizon: number): Forecast;
}

// Concrete strategies
class MovingAverageStrategy implements ForecastStrategy {
  predict(item: Item, history: StockMovement[], horizon: number): Forecast {
    // Stage 0–1: Simple moving average
  }
}

class HoltWintersStrategy implements ForecastStrategy {
  predict(item: Item, history: StockMovement[], horizon: number): Forecast {
    // Stage 2: Exponential smoothing with seasonality
  }
}

// Factory selects the right strategy based on data maturity
class ForecastStrategyFactory {
  static create(historyLength: number): ForecastStrategy {
    if (historyLength < 14) return new MovingAverageStrategy();
    if (historyLength < 60) return new HoltWintersStrategy();
    return new MovingAverageStrategy(); // fallback
  }
}
```

#### F. Frontend (Mobile) — **Selective OOP**

The React Native frontend uses **functional components with hooks** for UI (React's recommended approach), but applies OOP to non-UI logic:

| Where | OOP? | Why |
| :---- | :---- | :---- |
| UI Components (screens, buttons) | ❌ Functional | React hooks and functional components are the modern standard |
| API Client | ✅ Class | `ApiClient` class encapsulates base URL, auth headers, error handling, retry logic |
| Local Database Repositories | ✅ Class | `SqliteItemRepository` class wraps all SQLite queries for items |
| Sync Worker | ✅ Class | `SyncWorker` class manages outbox processing, conflict resolution, retry backoff |
| Data Models (client-side) | ✅ Class | `Item`, `Movement` classes with validation and unit conversion methods |
| Zustand Stores | ❌ Functional | Zustand uses a functional API by design |

**Example — API Client (Frontend OOP):**

```typescript
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new ApiError(response.status, await response.text());
    return response.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }
}
```

### 4. OOP Summary Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Krāv Inventory System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BACKEND (Node.js + TypeScript)                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Controllers  │→│   Services   │→│    Repositories         │ │
│  │ (Light OOP)  │  │(Moderate OOP)│  │   (Moderate OOP)       │ │
│  │              │  │              │  │                        │ │
│  │ Parse req    │  │ Business     │  │ SQL queries behind     │ │
│  │ Return res   │  │ rules,       │  │ interfaces             │ │
│  │              │  │ orchestrate  │  │                        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│         ↑                ↑                     ↑                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Entity Models (Heavy OOP)                      ││
│  │  Item, StockMovement, PurchaseList, User, Event,           ││
│  │  Forecast, Recipe, Supplier, StockCount, AuditLog          ││
│  │  → State + Behavior + Validation + Lifecycle               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  FRONTEND (React Native + TypeScript)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │  UI Components│  │ API Client   │  │ SQLite Repositories   ││
│  │  (Functional) │  │ (OOP Class)  │  │ (OOP Class)           ││
│  │  Hooks/JSX    │  │              │  │                       ││
│  └──────────────┘  └──────────────┘  └────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Key OOP Principles Applied

| OOP Principle | How It's Applied in Krāv |
| :---- | :---- |
| **Encapsulation** | Entity classes hide internal state. `Item.getStatus()` encapsulates the threshold logic — callers don't need to know the formula. `PurchaseList.approve()` enforces valid state transitions internally. |
| **Polymorphism** | `ForecastStrategy` interface allows swapping `MovingAverageStrategy` ↔ `HoltWintersStrategy` without changing the service code. `MovementRepository` interface allows swapping `PgMovementRepository` (server) ↔ `SqliteMovementRepository` (mobile). |
| **Abstraction** | Repository interfaces abstract away whether the data comes from PostgreSQL or SQLite. Service classes abstract away complex multi-step operations (e.g., receiving a purchase order = update status + create Stock In movements + log audit entry). |
| **Composition over Inheritance** | Services are composed of injected repositories and other services (e.g., `MovementService` receives `MovementRepository` + `ItemRepository` + `AuditService`), rather than inheriting from a base class. |

Technology Stack:  
