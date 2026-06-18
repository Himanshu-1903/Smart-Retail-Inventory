-- Quick fix: Just update the admin password to Admin@1234
-- Run this in MySQL Workbench if you already ran the reset script

UPDATE users 
SET password_hash = '$2b$12$h6FFKImUMbOgIPCLYou1Fe5gFz/.y70Az8rCc5hTc9evpGJZWsGQK'
WHERE email = 'admin@smartretail.com';

-- Check it worked (should show 1 row)
SELECT user_id, email, username, is_active FROM users WHERE email = 'admin@smartretail.com';
