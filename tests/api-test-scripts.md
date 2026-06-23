# API Test Scripts

## Smart Retail Inventory - Manual Testing Guide

Use these curl commands to test all API endpoints. Replace `YOUR_TOKEN` with the JWT from login.

---

## 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## 2. Authentication

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!","first_name":"Test","last_name":"User"}'
```

### Login (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartretail.com","password":"Password123!"}'
```

### Get Profile

```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Products

### List Products

```bash
curl "http://localhost:3000/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Product

```bash
curl http://localhost:3000/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sku":"TEST-001","name":"Test Product","category_id":1,"brand_id":1,"unit_price":99.99,"cost_price":50.00,"reorder_level":10,"reorder_quantity":25}'
```

### Update Product

```bash
curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Updated Product Name","unit_price":109.99}'
```

## 4. Suppliers

### List Suppliers

```bash
curl "http://localhost:3000/api/v1/suppliers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Customers

### List Customers

```bash
curl "http://localhost:3000/api/v1/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Inventory

### Stock Levels

```bash
curl "http://localhost:3000/api/v1/inventory/stock?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Movements

```bash
curl "http://localhost:3000/api/v1/inventory/movements?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reorder Suggestions

```bash
curl http://localhost:3000/api/v1/inventory/reorder-suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. Purchase Orders

### List POs

```bash
curl "http://localhost:3000/api/v1/purchase-orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create PO

```bash
curl -X POST http://localhost:3000/api/v1/purchase-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_id": 1,
    "warehouse_id": 1,
    "expected_delivery_date": "2026-07-15",
    "notes": "Test order",
    "items": [
      {"product_id": 1, "quantity_ordered": 10, "unit_cost": 620.00}
    ]
  }'
```

### Approve PO

```bash
curl -X PATCH http://localhost:3000/api/v1/purchase-orders/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 8. Sales Orders

### List SOs

```bash
curl "http://localhost:3000/api/v1/sales-orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Status

```bash
curl -X PATCH http://localhost:3000/api/v1/sales-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"confirmed"}'
```

## 9. Reports

### Sales Report

```bash
curl "http://localhost:3000/api/v1/reports/sales?start_date=2026-01-01&end_date=2026-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Inventory Valuation

```bash
curl http://localhost:3000/api/v1/reports/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Supplier Performance

```bash
curl http://localhost:3000/api/v1/reports/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Product Profitability

```bash
curl http://localhost:3000/api/v1/reports/profitability \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 10. Analytics Dashboard

```bash
curl http://localhost:3000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 11. Notifications

```bash
curl http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 12. Audit Logs

```bash
curl "http://localhost:3000/api/v1/audit-logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
