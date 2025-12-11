# 🧪 Testing Delhivery Integration

## ✅ Setup Complete

Your Delhivery API token has been configured in **TEST MODE**:
```
API Token: 01f9c0dc1b34a02b830fdc5b232c7ca7d41466ad
Environment: staging
Status: Ready to test ✅
```

---

## 🚀 Quick Start Testing Guide

### Prerequisites

1. **Laravel Server Running**
   ```bash
   cd d:\zelton\e-commerce\laravel-api
   php artisan serve
   # Server running at: http://localhost:8000
   ```

2. **Admin Account**
   - You need an admin account to test shipment creation
   - If you don't have one, create via your app or directly in database

3. **Test Order**
   - Create a test order in your system
   - Note the order ID (e.g., 1, 2, 3...)

---

## 📝 Test Scenarios

### Test 1: Verify API Token Works

**Purpose**: Confirm Delhivery recognizes your token

#### Using cURL (Windows PowerShell):
```powershell
# Test getting warehouses
Invoke-WebRequest -Uri "https://track.delhivery.com/api/backend/clientwarehouse/all/" -Headers @{
    "Authorization" = "Token 01f9c0dc1b34a02b830fdc5b232c7ca7d41466ad"
    "Content-Type" = "application/json"
} -Method GET
```

#### Using Your API Endpoint:
```bash
# In PowerShell or terminal
curl http://localhost:8000/api/delhivery/warehouses -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result**:
- ✅ Status 200
- ✅ JSON response with warehouse list (might be empty)
- ❌ If 401: Token invalid
- ❌ If 500: Check Laravel logs

---

### Test 2: Check Pincode Serviceability

**Purpose**: Verify if Delhivery delivers to a pincode

#### Using Postman/Insomnia:
```
POST http://localhost:8000/api/delhivery/check-serviceability
Content-Type: application/json

Body:
{
  "pincode": "110001"
}
```

#### Using cURL:
```bash
curl -X POST http://localhost:8000/api/delhivery/check-serviceability \
  -H "Content-Type: application/json" \
  -d "{\"pincode\": \"110001\"}"
```

#### Using PowerShell:
```powershell
$body = @{
    pincode = "110001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/delhivery/check-serviceability" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Expected Result**:
```json
{
  "serviceable": true,
  "delivery_codes": {
    "D": "Delivery",
    "E": "Express"
  },
  "cod_available": true,
  "prepaid_available": true,
  "estimated_delivery_days": "3-4"
}
```

**Test Multiple Pincodes**:
- ✅ Valid: 110001 (Delhi), 400001 (Mumbai), 560001 (Bangalore)
- ❌ Invalid: 999999, 111111 (should show not serviceable)

---

### Test 3: Create Shipment from Order

**Purpose**: Main functionality - create Delhivery shipment

#### Step 1: Create Test Order

First, create an order in your system through your app or directly:

```sql
-- Example order (adjust based on your actual order structure)
INSERT INTO orders (
    order_number, 
    user_id, 
    status, 
    payment_method,
    payment_status,
    subtotal,
    total,
    shipping_address,
    created_at,
    updated_at
) VALUES (
    'TEST-001',
    1,  -- Your user ID
    'pending',
    'prepaid',
    'completed',
    500.00,
    550.00,
    '{"name": "Test Customer", "phone": "9876543210", "address": "123 Test Street", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}',
    NOW(),
    NOW()
);

-- Note the order ID (e.g., 101)
```

#### Step 2: Get Admin Token

Login as admin through your API and get the Bearer token.

#### Step 3: Create Shipment

**Using Postman/Insomnia:**
```
POST http://localhost:8000/api/delhivery/orders/101/create-shipment
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Using cURL:**
```bash
curl -X POST "http://localhost:8000/api/delhivery/orders/101/create-shipment" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Using PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ADMIN_TOKEN"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/delhivery/orders/101/create-shipment" `
  -Method POST `
  -Headers $headers
```

**Expected Success Response**:
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "waybill": "DEL2025121012345",
  "order": {
    "id": 101,
    "order_number": "TEST-001",
    "delhivery_waybill": "DEL2025121012345",
    "delhivery_status": "Pending Pickup",
    "status": "processing"
  },
  "tracking_data": {
    "waybill": "DEL2025121012345",
    "current_status": "Pending Pickup",
    "last_location": "",
    "scan_history": []
  }
}
```

**Verify in Database**:
```sql
SELECT id, order_number, delhivery_waybill, delhivery_status, status 
FROM orders 
WHERE id = 101;

-- Should show:
-- delhivery_waybill: DEL2025121012345
-- delhivery_status: Pending Pickup
-- status: processing
```

**Possible Errors**:

❌ **"Order not found"**
- Check order ID exists
- Verify order belongs to your database

❌ **"Shipment already exists"**
- Order already has a waybill
- Check: `SELECT delhivery_waybill FROM orders WHERE id = 101;`

❌ **"Missing shipping address"**
- Order doesn't have complete address
- Add address to order's shipping_address JSON field

❌ **"Pincode not serviceable"**
- Delhivery doesn't deliver to that pincode
- Test with: 110001, 400001, 560001

---

### Test 4: Track Shipment (User View)

**Purpose**: Customer tracking their order

#### Using Order ID (Authenticated User):
```
GET http://localhost:8000/api/orders/101/delhivery-tracking
Authorization: Bearer USER_TOKEN
```

**Expected Response**:
```json
{
  "success": true,
  "order_id": 101,
  "waybill": "DEL2025121012345",
  "tracking_data": {
    "waybill": "DEL2025121012345",
    "current_status": "Pending Pickup",
    "last_location": "",
    "last_updated": "2025-12-10 14:30:00",
    "expected_delivery_date": "2025-12-13",
    "scan_history": [
      {
        "status": "Pending Pickup",
        "location": "Mumbai Warehouse",
        "datetime": "2025-12-10 14:30:00",
        "instructions": "Shipment created"
      }
    ]
  }
}
```

---

### Test 5: Track by Waybill (Public)

**Purpose**: Anyone can track using waybill number

```
POST http://localhost:8000/api/delhivery/track-waybill
Content-Type: application/json

Body:
{
  "waybill": "DEL2025121012345"
}
```

**PowerShell:**
```powershell
$body = @{
    waybill = "DEL2025121012345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/delhivery/track-waybill" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Expected**: Same tracking data as Test 4

---

### Test 6: Sync Tracking Data

**Purpose**: Manually refresh tracking from Delhivery

```
GET http://localhost:8000/api/delhivery/orders/101/sync-tracking
Authorization: Bearer ADMIN_TOKEN
```

**When to Use**:
- After Delhivery updates status
- To check for new scan events
- Troubleshooting tracking issues

**Expected**:
```json
{
  "success": true,
  "message": "Tracking data synced successfully",
  "tracking_data": { ... },
  "order_status_updated": true
}
```

---

### Test 7: Cancel Shipment

**Purpose**: Cancel before pickup

**⚠️ Warning**: Can only cancel before "Picked Up" status

```
POST http://localhost:8000/api/delhivery/orders/101/cancel-shipment
Authorization: Bearer ADMIN_TOKEN
```

**Expected Success**:
```json
{
  "success": true,
  "message": "Shipment cancelled successfully",
  "order": {
    "id": 101,
    "status": "cancelled",
    "delhivery_status": "Cancelled"
  }
}
```

**Expected Error (if already picked up)**:
```json
{
  "error": "Cannot cancel shipment after pickup",
  "current_status": "Picked Up"
}
```

---

## 🔍 Checking Logs

### Laravel Application Logs

```bash
# View recent logs
Get-Content d:\zelton\e-commerce\laravel-api\storage\logs\laravel.log -Tail 50

# Watch logs in real-time
Get-Content d:\zelton\e-commerce\laravel-api\storage\logs\laravel.log -Wait
```

**Look For**:
- `Delhivery API Call` - All API requests
- `Delhivery Response` - API responses
- `Error` - Any failures
- `Shipment Created` - Successful shipment

### Enable Debug Mode

Already enabled in your `.env`:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

---

## 📊 Complete Test Flow

### End-to-End Test Scenario

**Scenario**: Customer orders iPhone case, track until delivery

#### Step 1: Create Order
```sql
-- Create test order
INSERT INTO orders (...) VALUES (...);
-- Get order ID: 101
```

#### Step 2: Check Serviceability
```bash
POST /api/delhivery/check-serviceability
Body: {"pincode": "400001"}
# Result: ✅ Serviceable
```

#### Step 3: Create Shipment (Admin)
```bash
POST /api/delhivery/orders/101/create-shipment
# Result: Waybill "DEL2025121012345" created
```

#### Step 4: Verify Database
```sql
SELECT delhivery_waybill, delhivery_status FROM orders WHERE id = 101;
# delhivery_waybill: DEL2025121012345
# delhivery_status: Pending Pickup
```

#### Step 5: Customer Tracks (Immediately)
```bash
GET /api/orders/101/delhivery-tracking
# Shows: Pending Pickup
```

#### Step 6: Simulate Status Change
```
(In real scenario, Delhivery updates when picked up)
In test mode, status might not change automatically
```

#### Step 7: Manual Sync (Admin)
```bash
GET /api/delhivery/orders/101/sync-tracking
# Fetches latest from Delhivery
```

#### Step 8: Customer Tracks Again
```bash
GET /api/orders/101/delhivery-tracking
# Shows updated status with scan history
```

---

## 🧰 Testing Tools

### Option 1: Postman Collection

**Import this collection:**

```json
{
  "info": {
    "name": "Delhivery Integration Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Check Serviceability",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/api/delhivery/check-serviceability",
        "body": {
          "mode": "raw",
          "raw": "{\"pincode\": \"110001\"}"
        }
      }
    },
    {
      "name": "Create Shipment",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{admin_token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{base_url}}/api/delhivery/orders/{{order_id}}/create-shipment"
      }
    },
    {
      "name": "Track Order",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{user_token}}"}
        ],
        "url": "{{base_url}}/api/orders/{{order_id}}/delhivery-tracking"
      }
    },
    {
      "name": "Track by Waybill",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/api/delhivery/track-waybill",
        "body": {
          "mode": "raw",
          "raw": "{\"waybill\": \"{{waybill}}\"}"
        }
      }
    },
    {
      "name": "Sync Tracking",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "url": "{{base_url}}/api/delhivery/orders/{{order_id}}/sync-tracking"
      }
    },
    {
      "name": "Cancel Shipment",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "url": "{{base_url}}/api/delhivery/orders/{{order_id}}/cancel-shipment"
      }
    },
    {
      "name": "Get Warehouses",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{admin_token}}"}
        ],
        "url": "{{base_url}}/api/delhivery/warehouses"
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:8000"},
    {"key": "admin_token", "value": "your_admin_token_here"},
    {"key": "user_token", "value": "your_user_token_here"},
    {"key": "order_id", "value": "101"},
    {"key": "waybill", "value": ""}
  ]
}
```

**Save as**: `Delhivery_Tests.postman_collection.json`

### Option 2: PowerShell Test Script

```powershell
# Save as: test-delhivery.ps1

$baseUrl = "http://localhost:8000"
$adminToken = "YOUR_ADMIN_TOKEN"
$orderId = 101

Write-Host "🧪 Testing Delhivery Integration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Serviceability
Write-Host "`n1️⃣ Testing Serviceability..." -ForegroundColor Yellow
$body = @{ pincode = "110001" } | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/delhivery/check-serviceability" `
        -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Pincode is serviceable: $($response.serviceable)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Create Shipment
Write-Host "`n2️⃣ Creating Shipment..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/delhivery/orders/$orderId/create-shipment" `
        -Method POST -Headers $headers
    Write-Host "✅ Shipment created: $($response.waybill)" -ForegroundColor Green
    $waybill = $response.waybill
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Track Shipment
Write-Host "`n3️⃣ Tracking Shipment..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/delhivery-tracking" `
        -Method GET -Headers $headers
    Write-Host "✅ Current Status: $($response.tracking_data.current_status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
```

**Run:**
```bash
.\test-delhivery.ps1
```

### Option 3: Browser Testing

For public endpoints, test directly in browser:

**Serviceability** (GET request):
```
http://localhost:8000/api/delhivery/check-serviceability?pincode=110001
```

---

## ✅ Test Checklist

### Basic Tests
- [ ] API token verified (Test 1)
- [ ] Serviceability check works (Test 2)
- [ ] Can create shipment (Test 3)
- [ ] Waybill saved in database
- [ ] Order status updated to "processing"
- [ ] Can track by order ID (Test 4)
- [ ] Can track by waybill (Test 5)
- [ ] Can sync tracking data (Test 6)
- [ ] Can cancel shipment (Test 7)

### Edge Cases
- [ ] Test with invalid order ID (should error)
- [ ] Test with already shipped order (should error)
- [ ] Test with non-serviceable pincode (should error)
- [ ] Test tracking non-existent waybill (should error)
- [ ] Test creating duplicate shipment (should error)
- [ ] Test cancelling already picked up order (should error)

### Integration Tests
- [ ] Create order → Create shipment → Track (full flow)
- [ ] Multiple orders with shipments
- [ ] COD order shipment
- [ ] Prepaid order shipment
- [ ] Check logs for all operations
- [ ] Verify all database fields populated

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"

**Cause**: API token invalid or expired

**Fix**:
1. Regenerate token from Delhivery dashboard
2. Update `.env` file
3. Run: `php artisan config:clear`

### Issue: "Order not found"

**Cause**: Order ID doesn't exist

**Fix**:
```sql
-- Check existing orders
SELECT id, order_number FROM orders LIMIT 10;

-- Use an existing order ID
```

### Issue: "Shipment already exists"

**Cause**: Order already has a waybill

**Fix**:
```sql
-- Check waybill
SELECT id, delhivery_waybill FROM orders WHERE id = 101;

-- If you want to test again, clear it:
UPDATE orders SET delhivery_waybill = NULL, delhivery_status = NULL WHERE id = 101;
```

### Issue: "Address incomplete"

**Cause**: Order missing shipping address

**Fix**:
```sql
-- Update order with complete address
UPDATE orders 
SET shipping_address = '{"name": "Test User", "phone": "9876543210", "address": "123 Test St", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'
WHERE id = 101;
```

### Issue: No tracking data

**Cause**: Too early or Delhivery hasn't updated

**Solution**:
- Wait 1-2 hours after shipment creation
- In test mode, tracking might be limited
- Manual sync: `GET /api/delhivery/orders/{id}/sync-tracking`

---

## 📈 Success Metrics

After testing, you should see:

✅ **In Database**:
```sql
SELECT 
    id,
    order_number,
    delhivery_waybill,
    delhivery_status,
    status,
    delhivery_status_updated_at
FROM orders 
WHERE delhivery_waybill IS NOT NULL;
```

✅ **In Logs**:
```
[2025-12-10 14:30:00] Delhivery API Call: createShipment
[2025-12-10 14:30:01] Delhivery Response: Success
[2025-12-10 14:30:01] Shipment Created: DEL2025121012345
```

✅ **API Responses**: All return success with proper data

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Configure Warehouse** (if not done):
   - Login to https://one.delhivery.com/
   - Settings → Pickup Locations → Add warehouse
   
2. **Frontend Integration**:
   - Create tracking page UI
   - Add "Track Order" button
   - Display scan history timeline
   
3. **Automation**:
   - Auto-create shipment when order confirmed
   - Daily cron to sync all tracking data
   - Email notifications on status change

4. **Production Preparation**:
   - Complete KYC for live credentials
   - Replace test token with live token
   - Update environment to "production"

---

## 📞 Support

**If tests fail**:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify API token is correct
3. Confirm order has complete address
4. Test with known serviceable pincode

**Need help?**
- Delhivery Support: api.support@delhivery.com
- Dashboard: https://one.delhivery.com/support

---

## 🎉 You're All Set!

Your Delhivery integration is configured and ready for testing. Start with Test 1 (Verify Token) and work through all scenarios systematically.

**Quick Start Command**:
```powershell
# Start Laravel server
cd d:\zelton\e-commerce\laravel-api
php artisan serve

# In another terminal, test serviceability
curl -X POST http://localhost:8000/api/delhivery/check-serviceability -H "Content-Type: application/json" -d "{\"pincode\": \"110001\"}"
```

Good luck! 🚀
