/**
 * Test Setup - Common utilities and configuration for API testing
 */
const API_BASE = 'http://localhost:3000/api/v1';

// Default admin credentials from seed data
const ADMIN_CREDENTIALS = {
  email: 'admin@smartretail.com',
  password: 'Password123!'
};

const MANAGER_CREDENTIALS = {
  email: 'manager@smartretail.com',
  password: 'Password123!'
};

/**
 * Login and return JWT token
 */
async function getAuthToken(credentials = ADMIN_CREDENTIALS) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!data.success) throw new Error(`Login failed: ${data.message}`);
  return data.data.token;
}

/**
 * Make authenticated API request
 */
async function apiRequest(method, endpoint, body = null, token = null) {
  if (!token) token = await getAuthToken();
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return { status: response.status, data: await response.json().catch(() => null) };
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    return false;
  }
  console.log(`✅ PASS: ${message}`);
  return true;
}

/**
 * Run test suite
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Smart Retail Inventory - API Test Suite');
  console.log('='.repeat(60));
  let passed = 0,
    failed = 0;

  try {
    // ---- Auth Tests ----
    console.log('\n--- Authentication Tests ---');

    // Login with valid credentials
    let res = await apiRequest('POST', '/auth/login', ADMIN_CREDENTIALS, '');
    // Override: login doesn't need auth
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    const loginData = await loginRes.json();
    if (assert(loginRes.status === 200 && loginData.data?.token, 'Admin login returns 200 + token')) passed++;
    else failed++;

    const token = loginData.data.token;

    // Profile
    res = await apiRequest('GET', '/auth/profile', null, token);
    if (assert(res.status === 200, 'GET /auth/profile returns 200')) passed++;
    else failed++;

    // ---- Products Tests ----
    console.log('\n--- Products Tests ---');
    res = await apiRequest('GET', '/products', null, token);
    if (assert(res.status === 200 && Array.isArray(res.data?.data), 'GET /products returns array')) passed++;
    else failed++;

    res = await apiRequest('GET', '/products/1', null, token);
    if (assert(res.status === 200 && res.data?.data?.sku, 'GET /products/1 returns product with SKU')) passed++;
    else failed++;

    // ---- Categories Tests ----
    console.log('\n--- Categories Tests ---');
    res = await apiRequest('GET', '/categories', null, token);
    if (assert(res.status === 200, 'GET /categories returns 200')) passed++;
    else failed++;

    // ---- Suppliers Tests ----
    console.log('\n--- Suppliers Tests ---');
    res = await apiRequest('GET', '/suppliers', null, token);
    if (assert(res.status === 200, 'GET /suppliers returns 200')) passed++;
    else failed++;

    // ---- Inventory Tests ----
    console.log('\n--- Inventory Tests ---');
    res = await apiRequest('GET', '/inventory/stock', null, token);
    if (assert(res.status === 200, 'GET /inventory/stock returns 200')) passed++;
    else failed++;

    // ---- Purchase Orders Tests ----
    console.log('\n--- Purchase Orders Tests ---');
    res = await apiRequest('GET', '/purchase-orders', null, token);
    if (assert(res.status === 200, 'GET /purchase-orders returns 200')) passed++;
    else failed++;

    // ---- Sales Orders Tests ----
    console.log('\n--- Sales Orders Tests ---');
    res = await apiRequest('GET', '/sales-orders', null, token);
    if (assert(res.status === 200, 'GET /sales-orders returns 200')) passed++;
    else failed++;

    // ---- Reports Tests ----
    console.log('\n--- Reports Tests ---');
    res = await apiRequest('GET', '/reports/sales?start_date=2026-01-01&end_date=2026-12-31', null, token);
    if (assert(res.status === 200, 'GET /reports/sales returns 200')) passed++;
    else failed++;

    // ---- Analytics Tests ----
    console.log('\n--- Analytics Tests ---');
    res = await apiRequest('GET', '/analytics/dashboard', null, token);
    if (assert(res.status === 200, 'GET /analytics/dashboard returns 200')) passed++;
    else failed++;

    // ---- Health Check ----
    console.log('\n--- Health Check ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    if (assert(healthRes.status === 200, 'GET /health returns 200')) passed++;
    else failed++;
  } catch (err) {
    console.error(`\n💥 Test Error: ${err.message}`);
    failed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(60));
}

// Export for use
if (typeof module !== 'undefined') module.exports = { getAuthToken, apiRequest, assert, runTests };
