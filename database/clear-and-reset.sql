-- ============================================================================
-- SMART RETAIL — FULL RESET SCRIPT
-- Wipes ALL dummy data. Creates fresh admin account.
-- Run this ONCE in MySQL Workbench then restart your server.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear ALL business/transactional data
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE sales_order_items;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE stock_reorder_requests;
TRUNCATE TABLE inventory_movements;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE brands;
TRUNCATE TABLE categories;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;

-- ============================================================================
-- YOUR ADMIN ACCOUNT
-- Email:    admin@smartretail.com
-- Password: Admin@1234
-- ============================================================================
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone, is_active)
VALUES (
  1,
  'admin',
  'admin@smartretail.com',
  '$2b$12$h6FFKImUMbOgIPCLYou1Fe5gFz/.y70Az8rCc5hTc9evpGJZWsGQK',
  'Admin',
  '',
  '',
  TRUE
);

-- Give admin ALL permissions (role_id = 1 = Admin)
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- ============================================================================
-- DEFAULT WAREHOUSE (update warehouse_name, city, address to your actual shop)
-- ============================================================================
INSERT INTO warehouses (warehouse_id, warehouse_code, warehouse_name, address_line1, city, state, country, postal_code, is_active)
VALUES (1, 'WH-MAIN', 'Main Store', 'Your Shop Address', 'Your City', 'Your State', 'India', '000000', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Done! Login with:
--   Email:    admin@smartretail.com
--   Password: Admin@1234
-- ============================================================================
