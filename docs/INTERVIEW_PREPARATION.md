# Interview Preparation Guide

## Smart Retail Inventory Management System

Use this guide to prepare for software engineering and DBMS interview discussions about this project.

---

## 1. Project Overview Questions

**Q: Walk me through this project.**  
A: "I built an Enterprise Inventory Management System — a full-stack web application that manages the entire supply chain lifecycle: procurement, inventory tracking, sales, and business analytics. It uses Node.js/Express on the backend with a MySQL 8 database featuring 20 normalized tables, 6 stored procedures, 5 triggers, 5 analytical views, and a role-based access control system. The frontend is a single-page application with a dark glassmorphism dashboard using vanilla JavaScript with canvas-based charts."

**Q: What problem does it solve?**  
A: "Retail businesses need to track stock across multiple warehouses, manage supplier relationships, process customer orders, and make data-driven decisions. This system automates reorder alerts (via triggers), provides real-time inventory valuation, scores supplier performance, and analyzes product profitability — all through a unified dashboard."

---

## 2. Database Design Questions

**Q: Explain your database normalization approach.**  
A: "The schema is in Third Normal Form (3NF). For example, product categories, brands, and suppliers are separate entities linked by foreign keys rather than storing names directly in the products table. This eliminates update anomalies — if a supplier changes their name, I update one row in `suppliers`, not thousands of product rows."

**Q: Why did you use 20 tables instead of fewer?**  
A: "Each table represents a single business entity or relationship. For example, `user_roles` is a junction table implementing the many-to-many relationship between users and roles. `role_permissions` maps roles to granular permissions. This separation enables flexible RBAC without hardcoding role logic."

**Q: Explain your indexing strategy.**  
A: "I created composite indexes based on query patterns. For example, `idx_inventory_product_warehouse` on `(product_id, warehouse_id)` supports the frequent inventory lookup query. I used covering indexes where possible to avoid table lookups, and created partial indexes for the most common filter patterns like `status` on orders tables."

**Q: How do you handle concurrent stock updates?**  
A: "Sales order creation uses `SELECT ... FOR UPDATE` to pessimistically lock inventory rows during the transaction. This prevents two concurrent orders from overselling the same stock. The connection obtains a lock, validates available quantity, reserves stock, and commits atomically."

---

## 3. Backend Architecture Questions

**Q: Explain your layered architecture.**  
A: "I follow the Repository Pattern with strict layer separation:

- **Routes** → Define endpoints and wire middleware
- **Controllers** → Parse request/response, delegate to services
- **Services** → Business logic, transaction management, validation
- **Repositories** → Data access, SQL queries, database interaction

Each layer only communicates with the layer directly below it. Controllers never access repositories directly."

**Q: How does your authentication work?**  
A: "Registration hashes the password with bcrypt (12 salt rounds). Login verifies credentials, then generates a JWT containing `userId`, `email`, and `roles`. The auth middleware extracts the Bearer token, verifies it with the secret, then queries the database to ensure the user still exists and is active. This prevents deleted users from using unexpired tokens."

**Q: How does RBAC work?**  
A: "The authorization middleware queries the permission chain: `users → user_roles → roles → role_permissions → permissions`. It caches the user's permissions as a Set on the request object for O(1) lookups within the same request. Each route specifies required permissions like `authorize('products:create')`."

**Q: How do you handle errors?**  
A: "I use a custom `ApiError` class with static factory methods (`badRequest()`, `notFound()`, `unauthorized()`). An `asyncHandler` wrapper catches promise rejections. A global error handler middleware formats all errors consistently and logs them."

---

## 4. Business Logic Questions

**Q: Walk me through the purchase order workflow.**  
A: "1) Manager creates a draft PO with supplier and line items. 2) Admin approves the PO (`status: approved`). 3) Warehouse staff receives goods, updating `quantity_received` on each item. 4) A MySQL trigger (`trg_purchase_item_received`) automatically increases inventory and logs the movement. 5) When all items are fully received, the PO status updates to `received`."

**Q: How do triggers work in your system?**  
A: "I have 5 trigger groups:

- `trg_purchase_item_received`: Auto-increases inventory on goods receipt
- `trg_sales_order_shipped`: Auto-decreases stock when orders ship
- `trg_low_stock_alert`: Creates reorder requests and notifications when stock drops below threshold
- `trg_audit_products_*`: Captures full before/after JSON snapshots for product changes
- `trg_payment_completed`: Updates order status based on payment coverage"

**Q: How does the low stock alert system work?**  
A: "When inventory `quantity_on_hand` drops below the product's `reorder_level`, the `trg_low_stock_alert` trigger fires. It checks if a pending reorder request already exists (to avoid duplicates), creates one if not, and sends a notification to the warehouse manager. The urgency is classified as CRITICAL (zero stock), HIGH (below 50% of reorder level), or MEDIUM."

---

## 5. Frontend & API Design Questions

**Q: Why vanilla JavaScript instead of React?**  
A: "This demonstrates fundamental understanding of DOM manipulation, event handling, and state management without framework abstractions — skills that interviewers often want to verify. The SPA uses a module pattern (IIFE) for encapsulation, a centralized API client for HTTP calls, and canvas-based charts for data visualization."

**Q: How do your charts work without a library?**  
A: "The revenue chart uses Canvas 2D context to draw a line chart with gradient fill. It calculates coordinates from data values, draws grid lines, renders the area fill with a linear gradient, plots the line with dots, and adds axis labels. DPI scaling (`devicePixelRatio`) ensures crisp rendering on retina displays."

---

## 6. Performance & Scalability Questions

**Q: How would you scale this system?**  
A: "Short-term: Connection pooling (already implemented), query result caching with Redis, read replicas for report queries. Medium-term: Separate read/write databases, queue-based order processing with RabbitMQ. Long-term: Microservices decomposition (inventory service, order service, notification service)."

**Q: How does connection pooling work?**  
A: "mysql2's `createPool()` maintains a pool of persistent connections. When a query is needed, it borrows a connection from the pool, executes the query, and returns it. This avoids the overhead of establishing a new TCP connection and MySQL handshake for every request."

---

## 7. Security Questions

**Q: How do you prevent SQL injection?**  
A: "Every query uses prepared statements via `pool.execute()` with parameterized placeholders (`?`). User input is never concatenated into SQL strings."

**Q: What other security measures are in place?**  
A: "Helmet.js sets security headers, CORS is configured restrictively, bcrypt hashes passwords with 12 salt rounds, JWT tokens expire after configurable time, and express-validator validates all request bodies at the route level."

---

## 8. Key Metrics to Mention

- **20 normalized tables** in 3NF with FK constraints
- **6 stored procedures** for complex business operations
- **5 database triggers** for automated stock management
- **5 analytical views** for business reporting
- **25 granular permissions** mapped across 3 roles
- **60+ API endpoints** across 15 route modules
- **50 seed products** with realistic data across 10 categories
- **Transaction management** with rollback support
- **Pessimistic locking** for concurrent stock validation
