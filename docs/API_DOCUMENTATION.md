# API Documentation

## Smart Retail Inventory Management System — REST API v1

**Base URL:** `http://localhost:3000/api/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Authentication

### POST `/auth/register`

Create a new user account. Default role: Warehouse Staff.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+91-9876543210"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": 6, "email": "user@example.com", "first_name": "John", "last_name": "Doe" }
}
```

### POST `/auth/login`

Authenticate and receive JWT token.

**Request Body:**

```json
{ "email": "admin@smartretail.com", "password": "Password123!" }
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@smartretail.com",
      "first_name": "Rajesh",
      "last_name": "Kumar",
      "roles": ["Admin"]
    }
  }
}
```

### GET `/auth/profile`

Get current user's profile, roles, and permissions. **Requires Auth.**

---

## Products

All product endpoints require authentication. Most require `products:read`, `products:create`, `products:update`, or `products:delete` permissions.

### GET `/products`

List all products with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| limit | int | Items per page (default: 20) |
| search | string | Search by name or SKU |
| category_id | int | Filter by category |
| brand_id | int | Filter by brand |
| is_active | boolean | Filter by active status |
| min_price | decimal | Minimum price filter |
| max_price | decimal | Maximum price filter |

### GET `/products/:id`

Get single product by ID.

### POST `/products`

Create new product. Requires `products:create`.

**Request Body:**

```json
{
  "sku": "NEW-SKU-001",
  "name": "New Product",
  "description": "Product description",
  "category_id": 1,
  "brand_id": 1,
  "unit_price": 99.99,
  "cost_price": 50.0,
  "reorder_level": 10,
  "reorder_quantity": 25,
  "unit_of_measure": "unit",
  "weight": 0.5
}
```

### PUT `/products/:id`

Update product. Requires `products:update`.

### DELETE `/products/:id`

Soft-delete product. Requires `products:delete`.

---

## Categories

### GET `/categories` — List all active categories

### GET `/categories/:id` — Get category by ID

### POST `/categories` — Create category

### PUT `/categories/:id` — Update category

### DELETE `/categories/:id` — Soft-delete category

---

## Brands

### GET `/brands` — List all active brands

### GET `/brands/:id` — Get brand by ID

### POST `/brands` — Create brand

### PUT `/brands/:id` — Update brand

### DELETE `/brands/:id` — Soft-delete brand

---

## Suppliers

### GET `/suppliers` — List suppliers (paginated)

### GET `/suppliers/:id` — Get supplier details

### POST `/suppliers` — Create supplier (requires `suppliers:create`)

### PUT `/suppliers/:id` — Update supplier (requires `suppliers:update`)

### DELETE `/suppliers/:id` — Soft-delete supplier (requires `suppliers:delete`)

---

## Customers

### GET `/customers` — List customers (filterable by type, searchable)

### GET `/customers/:id` — Get customer details

### POST `/customers` — Create customer

### PUT `/customers/:id` — Update customer

### DELETE `/customers/:id` — Soft-delete customer

---

## Warehouses

### GET `/warehouses` — List all active warehouses

### GET `/warehouses/:id` — Get warehouse details (includes manager info)

### POST `/warehouses` — Create warehouse (requires `admin:users`)

### PUT `/warehouses/:id` — Update warehouse

### DELETE `/warehouses/:id` — Soft-delete warehouse

---

## Inventory

### GET `/inventory/stock`

List inventory stock levels across warehouses.

**Query Parameters:** `warehouse_id`, `product_id`, `low_stock` (boolean), `search`, `page`, `limit`

### GET `/inventory/movements`

List inventory movement history.

**Query Parameters:** `product_id`, `warehouse_id`, `movement_type`, `start_date`, `end_date`, `page`, `limit`

### GET `/inventory/reorder-suggestions`

Get products below reorder level.

### POST `/inventory/adjust`

Manual stock adjustment. Requires `inventory:adjust`.

```json
{ "product_id": 1, "warehouse_id": 1, "quantity": -5, "reason": "Damaged units write-off" }
```

### POST `/inventory/reorder`

Create stock reorder request. Requires `inventory:reorder`.

---

## Purchase Orders

### GET `/purchase-orders` — List POs (filterable by status, supplier)

### GET `/purchase-orders/:id` — Get PO with line items

### POST `/purchase-orders` — Create PO with items (requires `orders:create`)

```json
{
  "supplier_id": 1,
  "warehouse_id": 1,
  "expected_delivery_date": "2026-07-15",
  "notes": "Q3 electronics restock",
  "items": [
    { "product_id": 1, "quantity_ordered": 20, "unit_cost": 620.0 },
    { "product_id": 2, "quantity_ordered": 15, "unit_cost": 480.0 }
  ]
}
```

### PATCH `/purchase-orders/:id/approve` — Approve PO (requires `orders:approve`)

### PATCH `/purchase-orders/:id/receive` — Receive inventory (requires `inventory:receive`)

```json
{
  "items": [
    { "purchase_order_item_id": 1, "quantity_received": 20 },
    { "purchase_order_item_id": 2, "quantity_received": 10 }
  ]
}
```

---

## Sales Orders

### GET `/sales-orders` — List SOs (filterable by status, customer)

### GET `/sales-orders/:id` — Get SO with line items

### POST `/sales-orders` — Create SO (validates stock with SELECT FOR UPDATE)

```json
{
  "customer_id": 1,
  "discount_amount": 0,
  "notes": "Standard order",
  "items": [{ "product_id": 1, "quantity": 2, "unit_price": 899.99, "discount_percent": 0 }]
}
```

### PATCH `/sales-orders/:id/status` — Update status (enforces state machine)

Valid transitions: `pending → confirmed → processing → shipped → delivered`

### POST `/sales-orders/:id/invoice` — Generate invoice

---

## Payments

### GET `/payments` — List payments (filterable by reference_type, status, method)

### GET `/payments/:id` — Get payment details

### POST `/payments` — Record payment

```json
{
  "reference_type": "sales_order",
  "reference_id": 1,
  "amount": 1356.97,
  "payment_method": "credit_card",
  "transaction_reference": "TXN-CC-00001"
}
```

---

## Reports

### GET `/reports/sales?start_date=2026-01-01&end_date=2026-12-31` — Daily sales aggregation

### GET `/reports/inventory` — Inventory valuation (uses `vw_inventory_valuation` view)

### GET `/reports/suppliers` — Supplier performance scoring (uses `vw_supplier_performance` view)

### GET `/reports/profitability` — Product profitability analysis (uses `vw_product_profitability` view)

---

## Analytics

### GET `/analytics/dashboard`

Aggregated dashboard metrics including:

- Monthly revenue
- Total orders (sales + purchase)
- Inventory value
- Low stock count
- Monthly trend (12 months)
- Top 10 products by revenue
- Top 10 customers by spend
- Supplier performance scores

---

## Notifications

### GET `/notifications` — Get user's notifications with unread count

### PATCH `/notifications/:id/read` — Mark single notification as read

### PATCH `/notifications/read-all` — Mark all as read

---

## Audit Logs

### GET `/audit-logs` — List audit logs (requires `admin:audit`)

**Query Parameters:** `table_name`, `action`, `user_id`, `start_date`, `end_date`, `page`, `limit`

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

## HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 204  | No Content (successful delete)       |
| 400  | Bad Request / Validation Error       |
| 401  | Unauthorized                         |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 409  | Conflict (duplicate resource)        |
| 500  | Internal Server Error                |
