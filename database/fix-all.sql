-- ============================================================================
-- FIX-ALL.sql — Run this in MySQL Workbench to fix all permission issues
-- Run after clear-and-reset.sql
-- ============================================================================

-- Make sure roles exist
INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Full system access'),
(2, 'Manager', 'Manages products, orders, suppliers, customers'),
(3, 'Warehouse Staff', 'Manages inventory and shipments');

-- Make sure all 25 permissions exist
INSERT IGNORE INTO permissions (permission_id, permission_name, module, description) VALUES
(1, 'products:create', 'products', 'Create new products'),
(2, 'products:read', 'products', 'View products'),
(3, 'products:update', 'products', 'Update products'),
(4, 'products:delete', 'products', 'Delete products'),
(5, 'suppliers:create', 'suppliers', 'Create suppliers'),
(6, 'suppliers:read', 'suppliers', 'View suppliers'),
(7, 'suppliers:update', 'suppliers', 'Update suppliers'),
(8, 'suppliers:delete', 'suppliers', 'Delete suppliers'),
(9, 'customers:create', 'customers', 'Create customers'),
(10, 'customers:read', 'customers', 'View customers'),
(11, 'customers:update', 'customers', 'Update customers'),
(12, 'customers:delete', 'customers', 'Delete customers'),
(13, 'orders:create', 'orders', 'Create orders'),
(14, 'orders:read', 'orders', 'View orders'),
(15, 'orders:update', 'orders', 'Update orders'),
(16, 'orders:approve', 'orders', 'Approve orders'),
(17, 'inventory:read', 'inventory', 'View inventory'),
(18, 'inventory:adjust', 'inventory', 'Adjust inventory'),
(19, 'inventory:receive', 'inventory', 'Receive shipments'),
(20, 'inventory:reorder', 'inventory', 'Create reorder requests'),
(21, 'payments:create', 'payments', 'Record payments'),
(22, 'payments:read', 'payments', 'View payments'),
(23, 'reports:view', 'reports', 'View reports'),
(24, 'admin:audit', 'admin', 'View audit logs'),
(25, 'admin:users', 'admin', 'Manage users');

-- Give Admin role ALL permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- Make sure our admin user has the Admin role
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Fix admin password to Admin@1234
UPDATE users
SET password_hash = '$2b$12$h6FFKImUMbOgIPCLYou1Fe5gFz/.y70Az8rCc5hTc9evpGJZWsGQK'
WHERE user_id = 1;

-- Verify: show the admin user and their permissions count
SELECT u.user_id, u.username, u.email, u.is_active,
       r.role_name,
       COUNT(rp.permission_id) AS permission_count
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
JOIN role_permissions rp ON r.role_id = rp.role_id
WHERE u.user_id = 1
GROUP BY u.user_id, u.username, u.email, u.is_active, r.role_name;

-- ============================================================================
-- Expected result: permission_count = 25 (all permissions)
-- Email: admin@smartretail.com | Password: Admin@1234
-- ============================================================================
