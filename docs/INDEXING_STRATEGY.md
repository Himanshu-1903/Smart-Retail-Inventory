# ⚡ Indexing Strategy Document

## Smart Retail Inventory Management System

---

## Table of Contents

- [Index Philosophy & Principles](#index-philosophy--principles)
- [Index Inventory](#index-inventory)
- [Detailed Index Analysis](#detailed-index-analysis)
- [Composite Index Ordering Rationale](#composite-index-ordering-rationale)
- [Covering Index Examples](#covering-index-examples)
- [Time Complexity Analysis](#time-complexity-analysis)
- [Index Maintenance Considerations](#index-maintenance-considerations)
- [When NOT to Add Indexes](#when-not-to-add-indexes)
- [EXPLAIN Query Examples](#explain-query-examples)
- [Interview Talking Points](#interview-talking-points)

---

## Index Philosophy & Principles

### Core Principles

1. **Index for the query, not the table** — Every index should optimize at least one frequently-executed query.
2. **Leftmost prefix rule** — Composite indexes are only useful when the query uses the leftmost column(s) of the index.
3. **Selectivity matters** — Index columns with high cardinality (many unique values) first for maximum filtering power.
4. **Write cost awareness** — Every index adds overhead to INSERT, UPDATE, and DELETE operations. Only index what's needed.
5. **Covering indexes save I/O** — When all columns needed by a query are in the index, MySQL can answer from the index alone (index-only scan) without touching the table data.

### Index Types Used

| Type                     | MySQL Implementation                         | When Used                          |
| ------------------------ | -------------------------------------------- | ---------------------------------- |
| **Primary Key**          | Clustered B-Tree (InnoDB)                    | Auto-created for every PK          |
| **UNIQUE**               | Non-clustered B-Tree + uniqueness constraint | Email, SKU, PO number              |
| **Single-Column B-Tree** | Non-clustered B-Tree                         | Frequently filtered/sorted columns |
| **Composite B-Tree**     | Non-clustered B-Tree on multiple columns     | Multi-condition WHERE clauses      |
| **Covering Index**       | Composite index including SELECT columns     | High-frequency read queries        |

---

## Index Inventory

### Summary of All Indexes

| #   | Index Name                        | Table                | Column(s)                       | Type             | Purpose                       |
| --- | --------------------------------- | -------------------- | ------------------------------- | ---------------- | ----------------------------- |
| 1   | `idx_users_email`                 | users                | email                           | UNIQUE           | Login lookups                 |
| 2   | `idx_users_role_status`           | users                | role_id, status                 | Composite        | User listing with role filter |
| 3   | `idx_products_sku`                | products             | sku                             | UNIQUE           | SKU lookups                   |
| 4   | `idx_products_category`           | products             | category_id                     | B-Tree           | Category filtering            |
| 5   | `idx_products_brand`              | products             | brand_id                        | B-Tree           | Brand filtering               |
| 6   | `idx_products_supplier`           | products             | supplier_id                     | B-Tree           | Supplier's products           |
| 7   | `idx_products_status_deleted`     | products             | status, is_deleted              | Composite        | Active product listing        |
| 8   | `idx_products_name`               | products             | product_name                    | B-Tree           | Product name search           |
| 9   | `idx_inventory_product_warehouse` | inventory            | product_id, warehouse_id        | UNIQUE Composite | Stock lookups                 |
| 10  | `idx_inventory_warehouse`         | inventory            | warehouse_id                    | B-Tree           | Warehouse inventory           |
| 11  | `idx_inventory_low_stock`         | inventory            | quantity_on_hand, minimum_stock | Composite        | Low stock alerts              |
| 12  | `idx_po_supplier`                 | purchase_orders      | supplier_id                     | B-Tree           | Supplier's POs                |
| 13  | `idx_po_status`                   | purchase_orders      | status                          | B-Tree           | PO status filtering           |
| 14  | `idx_po_date_status`              | purchase_orders      | order_date, status              | Composite        | Date-range + status queries   |
| 15  | `idx_po_number`                   | purchase_orders      | po_number                       | UNIQUE           | PO number lookups             |
| 16  | `idx_po_items_po`                 | purchase_order_items | po_id                           | B-Tree           | PO line items                 |
| 17  | `idx_po_items_product`            | purchase_order_items | product_id                      | B-Tree           | Product purchase history      |
| 18  | `idx_so_customer`                 | sales_orders         | customer_id                     | B-Tree           | Customer's orders             |
| 19  | `idx_so_status`                   | sales_orders         | status                          | B-Tree           | SO status filtering           |
| 20  | `idx_so_date_status`              | sales_orders         | order_date, status              | Composite        | Date-range + status queries   |
| 21  | `idx_so_number`                   | sales_orders         | so_number                       | UNIQUE           | SO number lookups             |
| 22  | `idx_so_items_so`                 | sales_order_items    | so_id                           | B-Tree           | SO line items                 |
| 23  | `idx_so_items_product`            | sales_order_items    | product_id                      | B-Tree           | Product sales history         |
| 24  | `idx_payments_so`                 | payments             | so_id                           | B-Tree           | Order payments                |
| 25  | `idx_payments_date`               | payments             | payment_date                    | B-Tree           | Payment date reporting        |
| 26  | `idx_payments_status`             | payments             | payment_status                  | B-Tree           | Payment status filtering      |
| 27  | `idx_audit_table_record`          | audit_logs           | table_name, record_id           | Composite        | Audit history per record      |
| 28  | `idx_audit_user`                  | audit_logs           | user_id                         | B-Tree           | User's audit trail            |
| 29  | `idx_audit_created`               | audit_logs           | created_at                      | B-Tree           | Time-range audit queries      |
| 30  | `idx_notifications_user_read`     | notifications        | user_id, is_read                | Composite        | Unread notifications          |
| 31  | `idx_stock_adj_product`           | stock_adjustments    | product_id                      | B-Tree           | Product adjustment history    |
| 32  | `idx_stock_transfers_product`     | stock_transfers      | product_id                      | B-Tree           | Product transfer history      |
| 33  | `idx_suppliers_email`             | suppliers            | email                           | UNIQUE           | Supplier lookups              |
| 34  | `idx_customers_email`             | customers            | email                           | UNIQUE           | Customer lookups              |
| 35  | `idx_categories_parent`           | categories           | parent_category_id              | B-Tree           | Category hierarchy            |

---

## Detailed Index Analysis

### Index 1: `idx_users_email` (UNIQUE)

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Table:** `users`  
**Columns:** `email`  
**Index Type:** UNIQUE B-Tree

**Query Optimized:**

```sql
-- Login authentication — called on every login attempt
SELECT user_id, email, password_hash, role_id, status
FROM users
WHERE email = 'admin@smartretail.com' AND is_deleted = FALSE;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan | Index lookup |
| Rows Examined | ~N (all users) | 1 |
| Time Complexity | O(n) | O(log n) |
| Estimated Time (10K users) | ~15ms | <1ms |

**EXPLAIN Analysis:**

- `type`: `const` (single row lookup via unique index)
- `key`: `idx_users_email`
- `rows`: 1
- `Extra`: `Using index condition`

---

### Index 2: `idx_users_role_status` (Composite)

```sql
CREATE INDEX idx_users_role_status ON users(role_id, status);
```

**Table:** `users`  
**Columns:** `role_id`, `status`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Admin panel: list active users by role
SELECT user_id, first_name, last_name, email, status
FROM users
WHERE role_id = 2 AND status = 'active' AND is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan | Index range scan |
| Rows Examined | ~N (all users) | ~matching rows only |
| Time Complexity | O(n) | O(log n + k) |

**Why this column order?**

- `role_id` has lower cardinality (4 roles) but is always used as equality filter
- `status` further narrows within a role
- Together they create efficient multi-condition filtering

---

### Index 7: `idx_products_status_deleted` (Composite)

```sql
CREATE INDEX idx_products_status_deleted ON products(status, is_deleted);
```

**Table:** `products`  
**Columns:** `status`, `is_deleted`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Product listing page: show only active, non-deleted products
SELECT p.*, c.category_name, b.brand_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
WHERE p.status = 'active' AND p.is_deleted = FALSE
ORDER BY p.product_name ASC
LIMIT 20 OFFSET 0;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan + filter | Index range scan |
| Rows Examined | ~N (all products) | ~active products only |
| Estimated Time (50K products) | ~45ms | ~5ms |

---

### Index 9: `idx_inventory_product_warehouse` (UNIQUE Composite)

```sql
CREATE UNIQUE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
```

**Table:** `inventory`  
**Columns:** `product_id`, `warehouse_id`  
**Index Type:** UNIQUE Composite B-Tree

**Query Optimized:**

```sql
-- Check stock for a specific product at a specific warehouse
SELECT quantity_on_hand, quantity_reserved, quantity_available
FROM inventory
WHERE product_id = 42 AND warehouse_id = 1;

-- Also used when receiving PO goods (update stock)
UPDATE inventory
SET quantity_on_hand = quantity_on_hand + 100,
    last_restock_date = NOW()
WHERE product_id = 42 AND warehouse_id = 1;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan | Unique index lookup |
| Rows Examined | ~N (all inventory) | 1 |
| Time Complexity | O(n) | O(log n) |

**Why UNIQUE:** Enforces the business rule that each product can have only one inventory record per warehouse, preventing duplicate stock tracking.

---

### Index 11: `idx_inventory_low_stock` (Composite)

```sql
CREATE INDEX idx_inventory_low_stock ON inventory(quantity_on_hand, minimum_stock);
```

**Table:** `inventory`  
**Columns:** `quantity_on_hand`, `minimum_stock`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Low stock alert dashboard query
SELECT i.*, p.product_name, p.sku, p.reorder_level, w.warehouse_name
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity_on_hand <= i.minimum_stock
  AND i.minimum_stock > 0
ORDER BY (i.quantity_on_hand / i.minimum_stock) ASC;
```

**Performance Impact:**

- Enables efficient range scanning for items below their individual stock thresholds
- The index allows MySQL to quickly find all rows where `quantity_on_hand` is below various `minimum_stock` values

---

### Index 14: `idx_po_date_status` (Composite)

```sql
CREATE INDEX idx_po_date_status ON purchase_orders(order_date, status);
```

**Table:** `purchase_orders`  
**Columns:** `order_date`, `status`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Purchase report: POs in a date range with specific status
SELECT po_id, po_number, supplier_id, total_amount, status
FROM purchase_orders
WHERE order_date BETWEEN '2026-01-01' AND '2026-06-30'
  AND status IN ('received', 'closed')
ORDER BY order_date DESC;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan | Index range scan |
| Rows Examined | ~N (all POs) | ~matching date range |
| Estimated Time (100K POs) | ~80ms | ~8ms |

**Column Order Rationale:** `order_date` comes first because date-range queries (`BETWEEN`) are the primary access pattern. `status` is secondary filtering within that range.

---

### Index 20: `idx_so_date_status` (Composite)

```sql
CREATE INDEX idx_so_date_status ON sales_orders(order_date, status);
```

**Table:** `sales_orders`  
**Columns:** `order_date`, `status`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Sales report: revenue by date range
SELECT DATE(order_date) as sale_date,
       COUNT(*) as order_count,
       SUM(total_amount) as total_revenue
FROM sales_orders
WHERE order_date BETWEEN '2026-01-01' AND '2026-06-30'
  AND status = 'delivered'
GROUP BY DATE(order_date)
ORDER BY sale_date;
```

---

### Index 27: `idx_audit_table_record` (Composite)

```sql
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
```

**Table:** `audit_logs`  
**Columns:** `table_name`, `record_id`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- View full change history for a specific product
SELECT action, old_values, new_values, user_id, created_at
FROM audit_logs
WHERE table_name = 'products' AND record_id = 42
ORDER BY created_at DESC;
```

**Performance Impact:**
| Metric | Without Index | With Index |
|--------|:------------:|:----------:|
| Scan Type | Full table scan (millions of rows) | Index lookup |
| Rows Examined | ~N (all audit logs) | ~changes for this record only |
| Time Complexity | O(n) | O(log n + k) |

**Why this matters:** The audit_logs table grows unboundedly. Without this index, querying the change history for a single record would require scanning potentially millions of rows.

---

### Index 30: `idx_notifications_user_read` (Composite)

```sql
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

**Table:** `notifications`  
**Columns:** `user_id`, `is_read`  
**Index Type:** Composite B-Tree

**Query Optimized:**

```sql
-- Get unread notification count for the logged-in user (called on every page load)
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = 5 AND is_read = FALSE;

-- Get unread notifications for dropdown
SELECT notification_id, title, message, type, created_at
FROM notifications
WHERE user_id = 5 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 10;
```

**Performance Impact:**

- This query runs on **every page load** for the notification badge
- Without index: scans all notifications (high-frequency full table scan)
- With index: instant lookup of a user's unread notifications

---

## Composite Index Ordering Rationale

### The Leftmost Prefix Rule

MySQL can use a composite index for queries that filter on the **leftmost prefix** of the index columns. Understanding this rule is critical for effective index design.

**Example:** Index `(A, B, C)`

| Query Filter                      | Uses Index? | Explanation                      |
| --------------------------------- | :---------: | -------------------------------- |
| `WHERE A = ?`                     |   ✅ Yes    | Uses first column                |
| `WHERE A = ? AND B = ?`           |   ✅ Yes    | Uses first two columns           |
| `WHERE A = ? AND B = ? AND C = ?` |   ✅ Yes    | Uses all three columns           |
| `WHERE B = ?`                     |    ❌ No    | Skips first column               |
| `WHERE B = ? AND C = ?`           |    ❌ No    | Skips first column               |
| `WHERE A = ? AND C = ?`           | ⚠️ Partial  | Uses only A, cannot skip B for C |

### Our Composite Index Decisions

#### `idx_po_date_status(order_date, status)`

```
Query patterns:
  1. WHERE order_date BETWEEN ? AND ?                    → Uses index ✅
  2. WHERE order_date BETWEEN ? AND ? AND status = ?     → Uses both columns ✅
  3. WHERE status = ?                                     → Cannot use index ❌
```

**Decision:** `order_date` first because:

- Date-range filtering is the most common access pattern for reports
- Pattern #1 alone (date range without status) is frequent
- Pattern #3 alone (status without date) also has its own index `idx_po_status`

#### `idx_audit_table_record(table_name, record_id)`

```
Query patterns:
  1. WHERE table_name = ?                                → Uses index ✅
  2. WHERE table_name = ? AND record_id = ?              → Uses both columns ✅
  3. WHERE record_id = ?                                  → Cannot use index ❌
```

**Decision:** `table_name` first because:

- `table_name` is always known when querying audit history
- We never query "all changes to record 42 across all tables" (pattern #3)
- `table_name` has moderate cardinality (~20 values), and combined with `record_id`, it's highly selective

#### `idx_notifications_user_read(user_id, is_read)`

```
Query patterns:
  1. WHERE user_id = ?                                   → Uses index ✅
  2. WHERE user_id = ? AND is_read = FALSE               → Uses both columns ✅
  3. WHERE is_read = FALSE                               → Cannot use index ❌
```

**Decision:** `user_id` first because:

- We always query notifications for a specific user
- `is_read` has only 2 values (TRUE/FALSE) — low cardinality alone
- Combined, it efficiently finds "user 5's unread notifications"

---

## Covering Index Examples

A **covering index** contains all columns needed by a query, allowing MySQL to answer entirely from the index without accessing the table data pages. This is indicated by `Using index` in EXPLAIN output.

### Example 1: Notification Badge Count

```sql
-- Query
SELECT COUNT(*) FROM notifications WHERE user_id = 5 AND is_read = FALSE;

-- Covered by: idx_notifications_user_read(user_id, is_read)
-- EXPLAIN Extra: Using index
-- Why: Only needs user_id and is_read, both in the index. COUNT(*) doesn't need other columns.
```

### Example 2: Product Existence Check

```sql
-- Query
SELECT product_id FROM products WHERE sku = 'SKU-001';

-- Covered by: idx_products_sku(sku) + PK (InnoDB always includes PK in secondary indexes)
-- EXPLAIN Extra: Using index
-- Why: InnoDB secondary indexes store the PK value, so product_id is available in the index.
```

### Example 3: PO Item Lookup

```sql
-- Query
SELECT po_item_id, quantity_ordered, unit_price
FROM purchase_order_items
WHERE po_id = 15;

-- Index: idx_po_items_po(po_id)
-- Not a covering index — needs to fetch quantity_ordered, unit_price from table
-- To make it covering, we would need:
CREATE INDEX idx_po_items_covering ON purchase_order_items(po_id, quantity_ordered, unit_price);
-- But this is not worth it — the extra index storage cost outweighs the benefit for this low-frequency query.
```

### InnoDB Implicit Covering

In InnoDB, every secondary index automatically includes the primary key columns. This means:

```
idx_products_category(category_id)
  → actually stores: (category_id, product_id)

idx_po_status(status)
  → actually stores: (status, po_id)
```

This makes queries like `SELECT product_id FROM products WHERE category_id = 5` automatically covered by the secondary index without needing to access the table.

---

## Time Complexity Analysis

### B-Tree Index Operations

| Operation                           | Without Index | With B-Tree Index  |          Improvement          |
| ----------------------------------- | :-----------: | :----------------: | :---------------------------: |
| **Point Lookup** (WHERE id = ?)     |     O(n)      |      O(log n)      |       1000x for 1M rows       |
| **Range Scan** (WHERE date BETWEEN) |     O(n)      |    O(log n + k)    | Dramatic for selective ranges |
| **Full Table Scan** (no WHERE)      |     O(n)      |        O(n)        |   No improvement (expected)   |
| **INSERT**                          |     O(1)      | O(log n) per index |        Slight overhead        |
| **UPDATE** (indexed column)         |     O(1)      | O(log n) per index |        Slight overhead        |
| **DELETE**                          |     O(1)      | O(log n) per index |        Slight overhead        |

### Real-World Performance Estimates

Given the expected data volumes for this system:

| Table             | Expected Rows | Point Query (No Index) | Point Query (With Index) |
| ----------------- | :-----------: | :--------------------: | :----------------------: |
| `products`        |    50,000     |         ~25ms          |           <1ms           |
| `inventory`       |    200,000    |         ~80ms          |           <1ms           |
| `purchase_orders` |    100,000    |         ~50ms          |           <1ms           |
| `sales_orders`    |    500,000    |         ~200ms         |           <1ms           |
| `audit_logs`      |   5,000,000   |        ~2000ms         |           <1ms           |
| `notifications`   |   1,000,000   |         ~500ms         |           <1ms           |

### B-Tree Depth Analysis

For a typical B-Tree with branching factor ~500:

|     Rows      | Tree Depth | Disk Pages Read |
| :-----------: | :--------: | :-------------: |
|     1,000     |     2      |        2        |
|    100,000    |     3      |        3        |
|  10,000,000   |     4      |        4        |
| 1,000,000,000 |     5      |        5        |

Even for 10 million audit log records, a B-Tree index only needs **4 disk page reads** to find any record — compared to potentially reading thousands of pages in a full table scan.

---

## Index Maintenance Considerations

### Storage Overhead

Each index adds storage overhead. Estimated impact for this schema:

| Table             | Base Size (est.) | Index Count | Index Overhead |  Total  |
| ----------------- | :--------------: | :---------: | :------------: | :-----: |
| `products`        |      15 MB       |      6      |     ~8 MB      | ~23 MB  |
| `inventory`       |       8 MB       |      3      |     ~4 MB      | ~12 MB  |
| `purchase_orders` |      20 MB       |      5      |     ~10 MB     | ~30 MB  |
| `sales_orders`    |      50 MB       |      5      |     ~15 MB     | ~65 MB  |
| `audit_logs`      |      500 MB      |      3      |    ~100 MB     | ~600 MB |

**Total estimated index overhead:** ~150 MB for the entire system — well within acceptable limits.

### Write Performance Impact

Each INSERT/UPDATE/DELETE must update all affected indexes:

```
INSERT into products (6 indexes):
  Base cost:     ~0.5ms
  Index updates: ~0.3ms × 6 indexes = ~1.8ms
  Total cost:    ~2.3ms per insert

INSERT into audit_logs (3 indexes):
  Base cost:     ~0.5ms
  Index updates: ~0.3ms × 3 indexes = ~0.9ms
  Total cost:    ~1.4ms per insert
```

This overhead is acceptable because:

1. The system is **read-heavy** (dashboards, listings, reports consume 80%+ of queries)
2. Write operations (creating orders, receiving goods) are infrequent compared to reads
3. The write overhead per index is minimal (< 1ms each)

### Index Rebuild Strategy

```sql
-- Periodically analyze tables to update index statistics
ANALYZE TABLE products;
ANALYZE TABLE inventory;
ANALYZE TABLE purchase_orders;
ANALYZE TABLE sales_orders;
ANALYZE TABLE audit_logs;

-- Optimize fragmented tables (rarely needed, use during maintenance windows)
OPTIMIZE TABLE audit_logs;
```

---

## When NOT to Add Indexes

### 1. Low-Cardinality Boolean Columns (Alone)

```sql
-- ❌ BAD: Indexing is_deleted alone
CREATE INDEX idx_products_deleted ON products(is_deleted);
-- Only 2 values (TRUE/FALSE). Index won't provide significant filtering.
-- MySQL optimizer may prefer full table scan anyway.

-- ✅ GOOD: Include it in a composite index
CREATE INDEX idx_products_status_deleted ON products(status, is_deleted);
-- Combined with status, the composite provides meaningful filtering.
```

### 2. Frequently Updated Columns on Write-Heavy Tables

```sql
-- ❌ BAD: Indexing quantity_on_hand for sorting
CREATE INDEX idx_inv_qty ON inventory(quantity_on_hand);
-- quantity_on_hand changes with every stock movement.
-- High write frequency makes index maintenance costly.
-- Use: query, sort in application layer, or accept occasional full scan.
```

### 3. Small Tables (< 1,000 rows)

```sql
-- ❌ UNNECESSARY: Indexing the roles table
CREATE INDEX idx_roles_name ON roles(role_name);
-- With only 4 rows, a full table scan is faster than index lookup.
-- The overhead of maintaining the index exceeds any read benefit.
```

Tables that DON'T need additional indexes in our schema:

- `roles` (4 rows)
- `permissions` (~30 rows)
- `role_permissions` (~60 rows)
- `categories` (~50 rows)
- `brands` (~30 rows)
- `warehouses` (~10 rows)

### 4. Columns Used Only in SELECT (Not WHERE/JOIN/ORDER BY)

```sql
-- ❌ BAD: Indexing description columns
CREATE INDEX idx_products_desc ON products(description);
-- description is only used in SELECT output, never for filtering.
-- TEXT columns are especially expensive to index.
```

### 5. Duplicate/Redundant Indexes

```sql
-- ❌ BAD: These two indexes are redundant
CREATE INDEX idx_a ON products(category_id);
CREATE INDEX idx_b ON products(category_id, brand_id);
-- idx_b can handle all queries that idx_a handles (leftmost prefix rule).
-- idx_a is unnecessary storage overhead.
-- Keep only idx_b.
```

---

## EXPLAIN Query Examples

### Example 1: Product Listing with Category Filter

```sql
EXPLAIN SELECT p.product_id, p.sku, p.product_name, p.unit_price,
               c.category_name, b.brand_name
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        WHERE p.status = 'active' AND p.is_deleted = FALSE
          AND p.category_id = 5
        ORDER BY p.product_name ASC
        LIMIT 20;
```

**Expected EXPLAIN Output:**

| id  | select_type | table | type   | possible_keys                                      | key                   | rows | Extra                       |
| --- | ----------- | ----- | ------ | -------------------------------------------------- | --------------------- | ---- | --------------------------- |
| 1   | SIMPLE      | p     | ref    | idx_products_category, idx_products_status_deleted | idx_products_category | 45   | Using where; Using filesort |
| 1   | SIMPLE      | c     | eq_ref | PRIMARY                                            | PRIMARY               | 1    | NULL                        |
| 1   | SIMPLE      | b     | eq_ref | PRIMARY                                            | PRIMARY               | 1    | NULL                        |

**Analysis:**

- MySQL chooses `idx_products_category` because it's more selective than `idx_products_status_deleted` for this query.
- `type: ref` means index lookup with non-unique values (multiple products per category).
- `type: eq_ref` for the JOINs means exactly one row per join (PK lookup).
- `Using filesort` for ORDER BY because the index doesn't cover the sort column — acceptable for 45 rows.
- **Rows examined: ~45** (vs. ~50,000 without index).

---

### Example 2: Low Stock Alert Query

```sql
EXPLAIN SELECT i.inventory_id, p.sku, p.product_name,
               w.warehouse_name, i.quantity_on_hand, i.minimum_stock
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        JOIN warehouses w ON i.warehouse_id = w.warehouse_id
        WHERE i.quantity_on_hand <= i.minimum_stock
          AND i.minimum_stock > 0;
```

**Expected EXPLAIN Output:**

| id  | select_type | table | type   | possible_keys           | key                     | rows | Extra                              |
| --- | ----------- | ----- | ------ | ----------------------- | ----------------------- | ---- | ---------------------------------- |
| 1   | SIMPLE      | i     | range  | idx_inventory_low_stock | idx_inventory_low_stock | 120  | Using where; Using index condition |
| 1   | SIMPLE      | p     | eq_ref | PRIMARY                 | PRIMARY                 | 1    | NULL                               |
| 1   | SIMPLE      | w     | eq_ref | PRIMARY                 | PRIMARY                 | 1    | NULL                               |

**Analysis:**

- `type: range` using `idx_inventory_low_stock` — efficient range scan.
- `Using index condition` means MySQL pushes the comparison condition to the storage engine level (ICP - Index Condition Pushdown).
- Only examines ~120 rows (items below threshold) out of potentially 200,000 inventory records.

---

### Example 3: Sales Revenue Report

```sql
EXPLAIN SELECT DATE(order_date) as sale_date,
               COUNT(*) as order_count,
               SUM(total_amount) as revenue
        FROM sales_orders
        WHERE order_date BETWEEN '2026-01-01' AND '2026-06-30'
          AND status = 'delivered'
        GROUP BY DATE(order_date)
        ORDER BY sale_date;
```

**Expected EXPLAIN Output:**

| id  | select_type | table        | type  | possible_keys                     | key                | rows | Extra                                                               |
| --- | ----------- | ------------ | ----- | --------------------------------- | ------------------ | ---- | ------------------------------------------------------------------- |
| 1   | SIMPLE      | sales_orders | range | idx_so_date_status, idx_so_status | idx_so_date_status | 2500 | Using where; Using index condition; Using temporary; Using filesort |

**Analysis:**

- `type: range` on `idx_so_date_status` — date range scan with status filtering.
- `Using temporary; Using filesort` for GROUP BY + ORDER BY — expected for aggregation queries.
- Examines ~2,500 rows (6 months of delivered orders) vs. ~500,000 total sales orders.
- **10x-100x improvement** over full table scan.

---

### Example 4: Audit Log History for a Record

```sql
EXPLAIN SELECT action, old_values, new_values, created_at
        FROM audit_logs
        WHERE table_name = 'products' AND record_id = 42
        ORDER BY created_at DESC
        LIMIT 20;
```

**Expected EXPLAIN Output:**

| id  | select_type | table      | type | possible_keys          | key                    | rows | Extra                       |
| --- | ----------- | ---------- | ---- | ---------------------- | ---------------------- | ---- | --------------------------- |
| 1   | SIMPLE      | audit_logs | ref  | idx_audit_table_record | idx_audit_table_record | 8    | Using where; Using filesort |

**Analysis:**

- `type: ref` — extremely efficient lookup using composite index.
- Only **8 rows examined** out of potentially 5,000,000 audit log records.
- `Using filesort` for ORDER BY on `created_at` — negligible for 8 rows.
- Without this index: full table scan of 5M rows (~2+ seconds). With index: <1ms.

---

### Example 5: User Login Lookup

```sql
EXPLAIN SELECT user_id, email, password_hash, role_id, status
        FROM users
        WHERE email = 'admin@smartretail.com' AND is_deleted = FALSE;
```

**Expected EXPLAIN Output:**

| id  | select_type | table | type  | possible_keys   | key             | rows | Extra |
| --- | ----------- | ----- | ----- | --------------- | --------------- | ---- | ----- |
| 1   | SIMPLE      | users | const | idx_users_email | idx_users_email | 1    | NULL  |

**Analysis:**

- `type: const` — the best possible join type. MySQL reads this row once and treats it as a constant.
- UNIQUE index guarantees exactly **1 row**.
- This query runs on every login attempt — sub-millisecond response is critical.

---

### Example 6: Unread Notification Count

```sql
EXPLAIN SELECT COUNT(*) as unread_count
        FROM notifications
        WHERE user_id = 5 AND is_read = FALSE;
```

**Expected EXPLAIN Output:**

| id  | select_type | table         | type | possible_keys               | key                         | rows | Extra       |
| --- | ----------- | ------------- | ---- | --------------------------- | --------------------------- | ---- | ----------- |
| 1   | SIMPLE      | notifications | ref  | idx_notifications_user_read | idx_notifications_user_read | 15   | Using index |

**Analysis:**

- `type: ref` — index lookup for user_id = 5, is_read = FALSE.
- `Using index` — **covering index!** MySQL answers entirely from the index without accessing table data.
- This query executes on **every page load** for the notification badge — must be <1ms.
- Only 15 rows examined vs. potentially 1,000,000 notifications.

---

## Interview Talking Points

### 1. Why not use ORM-generated indexes?

> "I prefer designing indexes manually because ORMs generate generic indexes based on model definitions, not query patterns. For example, an ORM would index every foreign key, but it wouldn't know to create the composite `(order_date, status)` index that our date-range report queries actually need. Manual index design starts from the queries and works backward to the index."

### 2. How do you decide the column order in a composite index?

> "I follow the **Equality-Sort-Range (ESR)** rule. Equality conditions (`=`) come first because they pin to a specific point in the B-Tree. Sort columns (`ORDER BY`) come next to avoid filesort. Range conditions (`BETWEEN`, `>`, `<`) come last because they break the sort ordering. I also consider the leftmost prefix rule — putting the most commonly used filter first ensures the index is usable by the widest variety of queries."

### 3. What's the difference between a covering index and a regular index?

> "A covering index contains all columns needed by a query, allowing MySQL to answer entirely from the index without a secondary lookup to the table data. In InnoDB, secondary indexes store the primary key, so many queries are 'accidentally' covered. I explicitly designed the `idx_notifications_user_read` index as a covering index because the notification count query runs on every page load and only needs `user_id` and `is_read`."

### 4. How do you identify missing indexes?

> "I use three approaches: (1) Run `EXPLAIN` on all major queries and look for `type: ALL` (full table scan), (2) Enable MySQL's slow query log and analyze queries exceeding the threshold, and (3) Use `SHOW STATUS LIKE 'Handler_read%'` to monitor table scan vs. index scan ratios. The key is profiling actual workload, not guessing."

### 5. When would you remove an index?

> "I'd remove an index if (1) no query benefits from it based on EXPLAIN analysis, (2) it's a duplicate/redundant index covered by a wider composite index, or (3) the write overhead exceeds the read benefit on a write-heavy table. In our system, the `audit_logs` table is append-only (write-heavy), so I limited it to just 3 essential indexes."
