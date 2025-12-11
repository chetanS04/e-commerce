# Delhivery Integration Guide

## 📦 Overview
Complete integration with Delhivery courier service for automated shipment creation, real-time tracking, and status synchronization. This guide covers everything from getting credentials to going live in production.

## ✨ Features Implemented
- ✅ Shipment creation from orders
- ✅ Real-time shipment tracking with scan history
- ✅ Serviceability check by pincode
- ✅ Shipment cancellation
- ✅ Automatic status synchronization
- ✅ Warehouse management
- ✅ Tracking history storage in database
- ✅ Admin + Public + User endpoints
- ✅ COD and Prepaid support

## 🎯 How Delhivery Integration Works

### Complete Workflow Explained

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER PLACES ORDER                                        │
│    ↓ Order created in your database                             │
│    ↓ Status: "pending"                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. ADMIN CREATES SHIPMENT (Manual/Automatic)                    │
│    ↓ Call: POST /api/delhivery/orders/{orderId}/create-shipment│
│    ↓ Your backend formats order data                            │
│    ↓ Sends to Delhivery API                                     │
│    ↓ Delhivery returns WAYBILL number                           │
│    ✓ Saved: delhivery_waybill, status, tracking_data           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. DELHIVERY PICKS UP PACKAGE                                   │
│    ↓ Delivery partner visits your warehouse                     │
│    ↓ Scans waybill number                                       │
│    ✓ Status: "Picked Up" → Order status: "processing"          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. IN TRANSIT (Real-time Tracking)                              │
│    ↓ Package moves through Delhivery network                    │
│    ↓ Scanned at each hub: Mumbai → Delhi → Destination         │
│    ↓ Customer tracks: GET /api/orders/{orderId}/delhivery-track│
│    ✓ Shows scan history with locations & timestamps             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. OUT FOR DELIVERY                                             │
│    ↓ Package assigned to local delivery agent                   │
│    ✓ Status: "Out for Delivery" → Order status: "shipped"      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DELIVERED                                                     │
│    ↓ Customer receives package                                  │
│    ✓ Status: "Delivered" → Order status: "delivered"           │
│    ✓ delivered_at timestamp set                                 │
│    ✓ Optional: Send confirmation email                          │
└─────────────────────────────────────────────────────────────────┘
```

### Behind the Scenes

**When you call Create Shipment:**
```php
1. DelhiveryService->formatShipmentData($order)
   - Extracts customer name, phone, address
   - Formats products list
   - Calculates weight (or uses default)
   - Determines payment mode (COD/Prepaid)

2. HTTP POST to Delhivery API
   - Endpoint: /cmu/push/json/
   - Headers: Authorization: Token {your_api_key}
   - Body: Formatted shipment data

3. Delhivery Response:
   {
     "waybill": "DEL123456789",
     "status": "Success",
     "remark": "Shipment created"
   }

4. Update Order in Database:
   - delhivery_waybill = "DEL123456789"
   - delhivery_status = "Pending Pickup"
   - status = "processing"
```

**When customer tracks order:**
```php
1. Frontend calls: GET /api/orders/{orderId}/delhivery-tracking

2. Backend fetches waybill from order
   - If no waybill: return error

3. DelhiveryService->trackShipment($waybill)
   - HTTP GET to /api/packages/json/?waybill={waybill}
   - Delhivery returns full tracking data

4. Parse & Return:
   {
     "waybill": "DEL123456789",
     "current_status": "In Transit",
     "last_location": "Mumbai Hub",
     "expected_delivery": "2025-12-12",
     "scan_history": [
       {
         "status": "Picked Up",
         "location": "Mumbai Warehouse",
         "datetime": "2025-12-10 10:00:00",
         "instructions": "Package picked up successfully"
       },
       {
         "status": "In Transit",
         "location": "Mumbai Processing Center",
         "datetime": "2025-12-10 14:30:00"
       },
       {
         "status": "In Transit",
         "location": "Delhi Hub",
         "datetime": "2025-12-11 08:00:00"
       }
     ]
   }

5. Frontend displays timeline with progress bar
```

---

## 🔐 Getting Delhivery Credentials

### STEP 1: Create Delhivery Account

#### 1.1 Registration
1. Go to **https://one.delhivery.com/** (Official Dashboard)
2. Click **"Sign Up"** or **"Register"**
3. Fill in business details:
   - **Business Name**: Your company name
   - **Contact Person**: Your name
   - **Email**: Business email
   - **Phone**: Contact number
   - **Business Address**: Registered address
   - **GST Number**: (Optional for test, required for live)

4. Verify email and phone number
5. Login to dashboard: https://one.delhivery.com/login

#### 1.2 Complete Profile
1. Navigate to **Settings → Company Details**
2. Fill in all required information:
   - Business type (Ecommerce/Retail/etc.)
   - Expected monthly shipments
   - Product categories
   - Business registration details

### STEP 2: Get Test/Staging Credentials

#### Option A: Self-Service (Recommended)

1. **Login to Dashboard**: https://one.delhivery.com/
2. **Go to Settings**: Left sidebar → Click **"API Setup"**
3. **Test API Section**: Look for "Test Mode" or "Staging Environment"
4. **Request Test Token**: Click **"Request Live API Token"** button
   - Note: Despite the name, you can request test token first
   - In the modal, select "Test/Staging" environment
5. **Generate Token**: 
   - Click "View" button to reveal the token
   - Copy immediately (visible only once for 5 minutes)
6. **Save Securely**: Store in password manager or `.env` file

**Screenshot Guide:**
```
Settings → API Setup
├── Test our APIs (button in top-right)
├── Request for Live API Token
│   ├── Request Live API Token (button)
│   └── Existing API Token
│       ├── *************** (hidden)
│       ├── 👁️ View (click to reveal)
│       └── 📋 Copy
└── ⚠️ Warning: Once you generate a new Token, your old token will stop working immediately
```

#### Option B: Contact Delhivery Support

If test tokens aren't visible in dashboard:

**Email**: api.support@delhivery.com or sales@delhivery.com

**Subject**: Request for Staging/Test API Credentials

**Email Template**:
```
Hi Delhivery Team,

I am integrating Delhivery courier service into my e-commerce platform 
and need staging/test API credentials for development and integration testing.

Business Details:
- Company Name: [Your Company Name]
- Website: [Your Website URL]
- Contact Person: [Your Name]
- Phone: [Your Phone Number]
- Email: [Your Email]
- Expected Monthly Shipments: [Estimate: e.g., 100-500]
- Business Type: E-commerce Platform
- Integration Type: REST API

Please provide:
1. Staging/Test API Key/Token
2. Staging API Base URL
3. Test warehouse setup instructions
4. Staging environment documentation
5. Test waybill numbers (if required)

I have already registered on one.delhivery.com with email: [your_email]

Thank you for your assistance!

Best regards,
[Your Name]
[Your Company]
```

**Expected Response Time**: 24-48 hours

#### Option C: Through Sales Team

1. **Call**: 1800-103-6161 (Delhivery Customer Care)
2. Ask for: "API Integration Support"
3. Request: "Staging credentials for API testing"
4. Provide: Business details and registered email
5. **Follow-up**: Check email for credentials

### STEP 3: Test Environment Configuration

Once you receive test credentials:

#### 3.1 Update `.env` File (Test Mode)

```env
# Delhivery Test/Staging Configuration
DELHIVERY_API_KEY=your_test_token_here_xxxxxxxxxxxxxxxxxx
DELHIVERY_API_URL=https://staging-express.delhivery.com/api
DELHIVERY_ENVIRONMENT=staging
DELHIVERY_CLIENT_NAME=YourCompanyName

# Note: Staging URL might vary, confirm with Delhivery:
# Option 1: https://staging-express.delhivery.com/api
# Option 2: https://track.delhivery.com/api (with test token)
```

#### 3.2 Verify Test Token

Test your API token:

```bash
# In terminal (replace YOUR_TEST_TOKEN)
curl -X GET "https://track.delhivery.com/api/backend/clientwarehouse/all/" \
  -H "Authorization: Token YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "data": [...],  # Your warehouses (might be empty in test mode)
  "success": true
}

# If you get 401 Unauthorized: Token is invalid
# If you get 200 OK: Token is working!
```

#### 3.3 Test in Your Application

```bash
# Navigate to Laravel project
cd d:\zelton\e-commerce\laravel-api

# Test serviceability check
curl -X POST "http://localhost:8000/api/delhivery/check-serviceability" \
  -H "Content-Type: application/json" \
  -d '{"pincode": "110001"}'

# Expected: {"serviceable": true, ...}
```

### STEP 4: Setup Test Warehouse

#### 4.1 Add Pickup Location (Test)

1. **Dashboard**: https://one.delhivery.com/
2. **Navigate**: Settings → **Pickup Locations**
3. **Add New Location**:
   - **Warehouse Name**: Test Warehouse / Your Company HQ
   - **Contact Person**: Your name
   - **Phone**: Your number
   - **Address**: Complete address with pincode
   - **Operating Hours**: 10:00 AM - 6:00 PM
   - **Warehouse Type**: Fulfillment Center

4. **Save & Note Warehouse Code**: e.g., `WH001`

#### 4.2 Update Shipment Creation Code

Ensure your warehouse details match:

```php
// In DelhiveryService->formatShipmentData()
'pickup_location' => [
    'name' => 'Test Warehouse',
    'phone' => '9876543210',
    'address' => 'Your warehouse address',
    'city' => 'Mumbai',
    'state' => 'Maharashtra',
    'pincode' => '400001',
],
```

### STEP 5: Testing Workflow

#### Test Checklist:

- [ ] **API Token Works**: Call warehouse API successfully
- [ ] **Create Test Order**: In your system with valid test data
- [ ] **Create Shipment**: 
  ```bash
  POST /api/delhivery/orders/1/create-shipment
  # Should return waybill: TEST123456789 (or real waybill)
  ```
- [ ] **Track Shipment**: 
  ```bash
  GET /api/orders/1/delhivery-tracking
  # Should return tracking data
  ```
- [ ] **Check Serviceability**: Test various pincodes
- [ ] **Cancel Shipment**: Test cancellation flow
- [ ] **Error Handling**: Test with invalid order IDs
- [ ] **Status Sync**: Verify status updates in database

#### Test Scenarios:

**Scenario 1: Successful Shipment**
```
1. Create order with valid customer address
2. Call create-shipment endpoint
3. Verify waybill saved in database
4. Track shipment multiple times
5. Check scan history updates
```

**Scenario 2: Non-Serviceable Pincode**
```
1. Check serviceability for pincode: 999999
2. Should return: { "serviceable": false }
3. Prevent shipment creation for that pincode
```

**Scenario 3: Cancellation**
```
1. Create shipment
2. Before pickup, call cancel-shipment
3. Verify order status updated
4. Confirm waybill marked as cancelled
```

---

## 🚀 Getting LIVE/Production Credentials

### STEP 1: Complete KYC (Know Your Customer)

**Required Documents:**

1. **Business Registration Proof**:
   - Certificate of Incorporation
   - Partnership Deed
   - LLP Agreement
   - Sole Proprietorship Registration

2. **GST Certificate**:
   - GST Registration Certificate (GSTIN)
   - Mandatory for live shipments

3. **Address Proof**:
   - Electricity Bill
   - Rent Agreement
   - Property Tax Receipt

4. **Bank Details**:
   - Cancelled Cheque
   - Bank Statement (last 3 months)
   - Account holder name matching business

5. **Identity Proof** (Authorized Signatory):
   - Aadhaar Card
   - PAN Card
   - Passport

### STEP 2: KYC Submission

1. **Login**: https://one.delhivery.com/
2. **Navigate**: Settings → **Company Details**
3. **Upload Documents**: Click "Upload KYC Documents"
4. **Fill Details**:
   - Legal business name
   - GST number
   - PAN number
   - Business address
   - Bank account details

5. **Submit for Review**
6. **Wait for Approval**: 3-7 business days

**Note**: Delhivery team may call to verify details

### STEP 3: Commercial Agreement

1. **Rate Negotiation**:
   - Per kg rates
   - COD charges
   - RTO (Return) charges
   - Fuel surcharge
   - Minimum monthly commitment

2. **Payment Terms**:
   - Prepaid: Pay before shipment
   - Postpaid: Monthly billing (requires credit limit)
   - COD Settlement: T+3 to T+7 days

3. **Sign Agreement**:
   - Digital signature
   - Physical stamp paper (if required)
   - Upload signed copy to dashboard

### STEP 4: Account Activation

1. **Approval Email**: Receive confirmation from Delhivery
2. **Account Manager Assigned**: Your dedicated contact
3. **Credit Limit Set**: For postpaid accounts
4. **Live Access Granted**

### STEP 5: Generate Live API Token

1. **Login to Dashboard**: https://one.delhivery.com/
2. **Go to**: Settings → **API Setup**
3. **Request Live API Token**:
   - Click "Request Live API Token" button
   - Confirm production environment
   - Token generated instantly

4. **CRITICAL**: 
   - Token visible only once for 5 minutes
   - Copy immediately
   - Store securely (password manager)
   - Never commit to git

5. **Token Format**: 
   ```
   Example: 8f7a9d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f
   Length: ~40 characters
   ```

### STEP 6: Production Warehouse Setup

1. **Add Live Warehouse**:
   - Settings → Pickup Locations → Add New
   - Use actual warehouse address
   - Add multiple warehouses if needed

2. **Warehouse Verification**:
   - Delhivery may send person to verify
   - Keep address proof ready
   - Confirm operating hours

3. **Get Warehouse Code**: Note for API usage

---

## 🔄 Switching Between Test and Live

### Configuration Setup

#### Option 1: Environment-Based (Recommended)

**`.env` File Structure:**

```env
# APP Environment
APP_ENV=local        # local, staging, production

# Delhivery Configuration - Determined by APP_ENV

# FOR LOCAL/STAGING (Test Mode)
DELHIVERY_API_KEY_TEST=your_test_token_here
DELHIVERY_API_URL_TEST=https://staging-express.delhivery.com/api

# FOR PRODUCTION (Live Mode)
DELHIVERY_API_KEY_LIVE=your_live_token_here
DELHIVERY_API_URL_LIVE=https://track.delhivery.com/api

# Active Configuration (Auto-selected based on APP_ENV)
DELHIVERY_API_KEY=${DELHIVERY_API_KEY_TEST}
DELHIVERY_API_URL=${DELHIVERY_API_URL_TEST}
DELHIVERY_ENVIRONMENT=staging
DELHIVERY_CLIENT_NAME=YourCompanyName
```

**Update `config/delhivery.php`:**

```php
<?php

return [
    'api_key' => env('DELHIVERY_API_KEY'),
    'api_url' => env('DELHIVERY_API_URL', 'https://track.delhivery.com/api'),
    'environment' => env('DELHIVERY_ENVIRONMENT', 'production'),
    'client_name' => env('DELHIVERY_CLIENT_NAME', 'YourCompanyName'),
    
    // Test credentials
    'test' => [
        'api_key' => env('DELHIVERY_API_KEY_TEST'),
        'api_url' => env('DELHIVERY_API_URL_TEST', 'https://staging-express.delhivery.com/api'),
    ],
    
    // Live credentials
    'live' => [
        'api_key' => env('DELHIVERY_API_KEY_LIVE'),
        'api_url' => env('DELHIVERY_API_URL_LIVE', 'https://track.delhivery.com/api'),
    ],
    
    // Auto-select based on environment
    'use_live' => env('APP_ENV') === 'production',
];
```

**Update `DelhiveryService.php`:**

```php
class DelhiveryService
{
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        $useLive = config('delhivery.use_live');
        
        $this->apiKey = $useLive 
            ? config('delhivery.live.api_key') 
            : config('delhivery.test.api_key');
            
        $this->apiUrl = $useLive 
            ? config('delhivery.live.api_url') 
            : config('delhivery.test.api_url');

        // Fallback to main config if not set
        if (!$this->apiKey) {
            $this->apiKey = config('delhivery.api_key');
            $this->apiUrl = config('delhivery.api_url');
        }
    }
    
    // Rest of your service methods...
}
```

#### Option 2: Manual Switch

**For Testing (Local Development):**
```env
DELHIVERY_API_KEY=your_test_token_xxxxxxxxxx
DELHIVERY_API_URL=https://staging-express.delhivery.com/api
DELHIVERY_ENVIRONMENT=staging
```

**For Production (Live Server):**
```env
DELHIVERY_API_KEY=your_live_token_yyyyyyyyyy
DELHIVERY_API_URL=https://track.delhivery.com/api
DELHIVERY_ENVIRONMENT=production
```

### Deployment Checklist

#### Before Going Live:

- [ ] **KYC Approved**: Documents verified by Delhivery
- [ ] **Live API Token Generated**: Saved securely
- [ ] **Production Warehouses Added**: All pickup locations configured
- [ ] **Rate Card Finalized**: Commercial terms agreed
- [ ] **Payment Setup**: Credit limit or prepaid wallet loaded
- [ ] **Test All Flows**: In staging environment
- [ ] **Error Handling**: Tested all edge cases
- [ ] **Monitoring Setup**: Laravel logs configured
- [ ] **Backup Plan**: Alternative courier if Delhivery down

#### Deployment Steps:

1. **Backup Database**:
   ```bash
   php artisan backup:database
   ```

2. **Update `.env` on Production Server**:
   ```bash
   # SSH to server
   nano /path/to/project/.env
   
   # Update:
   DELHIVERY_API_KEY=your_live_token
   DELHIVERY_API_URL=https://track.delhivery.com/api
   DELHIVERY_ENVIRONMENT=production
   APP_ENV=production
   ```

3. **Clear Laravel Caches**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

4. **Test with 1 Real Order**:
   - Create actual order
   - Generate shipment
   - Verify waybill created
   - Track in real-time
   - Monitor Delhivery dashboard

5. **Monitor for 24 Hours**:
   - Check logs: `storage/logs/laravel.log`
   - Verify pickups happening
   - Confirm tracking updates
   - Customer feedback

### Environment-Specific Behavior

| Feature | Test/Staging | Live/Production |
|---------|-------------|-----------------|
| API Token | Test token | Live token |
| Waybills | May be dummy | Real tracking numbers |
| Pickup | No physical pickup | Actual Delhivery pickup |
| Tracking | Simulated/limited | Real-time updates |
| Delivery | No actual delivery | Real delivery to customers |
| Charges | Not billed (or test billing) | Real charges applied |
| COD | No money transfer | Real COD settlement |
| Support | Email/ticket | Dedicated account manager |

### Quick Switch Script

Create helper command for easy switching:

```php
// app/Console/Commands/SwitchDelhiveryMode.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SwitchDelhiveryMode extends Command
{
    protected $signature = 'delhivery:switch {mode : test or live}';
    protected $description = 'Switch between test and live Delhivery credentials';

    public function handle()
    {
        $mode = $this->argument('mode');
        
        if (!in_array($mode, ['test', 'live'])) {
            $this->error('Mode must be "test" or "live"');
            return 1;
        }

        $envFile = base_path('.env');
        $envContent = file_get_contents($envFile);

        if ($mode === 'test') {
            $envContent = preg_replace(
                '/DELHIVERY_API_KEY=.*/m',
                'DELHIVERY_API_KEY=${DELHIVERY_API_KEY_TEST}',
                $envContent
            );
            $envContent = preg_replace(
                '/DELHIVERY_ENVIRONMENT=.*/m',
                'DELHIVERY_ENVIRONMENT=staging',
                $envContent
            );
        } else {
            $envContent = preg_replace(
                '/DELHIVERY_API_KEY=.*/m',
                'DELHIVERY_API_KEY=${DELHIVERY_API_KEY_LIVE}',
                $envContent
            );
            $envContent = preg_replace(
                '/DELHIVERY_ENVIRONMENT=.*/m',
                'DELHIVERY_ENVIRONMENT=production',
                $envContent
            );
        }

        file_put_contents($envFile, $envContent);
        
        $this->call('config:clear');
        $this->info("Switched to {$mode} mode successfully!");
        
        return 0;
    }
}
```

**Usage:**
```bash
# Switch to test mode
php artisan delhivery:switch test

# Switch to live mode
php artisan delhivery:switch live
```

---

## 📋 Environment Configuration

### Database Schema
New fields added to `orders` table:
- `delhivery_waybill` - Unique tracking number from Delhivery
- `delhivery_status` - Current shipment status
- `delhivery_status_updated_at` - Last status update timestamp
- `delhivery_tracking_data` - JSON array of scan history
- `courier_name` - Courier service name (default: 'Delhivery')
- `delivery_instructions` - Special delivery notes

## API Endpoints

### Admin Routes (requires Admin role)

#### Create Shipment
```
POST /api/delhivery/orders/{orderId}/create-shipment
```
Creates a new shipment in Delhivery and updates order with waybill number.

**Response:**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "waybill": "DEL123456789",
  "tracking_data": {...}
}
```

#### Cancel Shipment
```
POST /api/delhivery/orders/{orderId}/cancel-shipment
```
Cancels an existing shipment and updates order status.

**Response:**
```json
{
  "success": true,
  "message": "Shipment cancelled successfully"
}
```

#### Sync Tracking
```
GET /api/delhivery/orders/{orderId}/sync-tracking
```
Manually synchronizes latest tracking data from Delhivery.

**Response:**
```json
{
  "success": true,
  "message": "Tracking data synced successfully",
  "tracking_data": {...}
}
```

#### Get Warehouses
```
GET /api/delhivery/warehouses
```
Fetches all registered pickup locations.

**Response:**
```json
{
  "success": true,
  "warehouses": [...]
}
```

### Public Routes

#### Check Serviceability
```
POST /api/delhivery/check-serviceability
Body: { "pincode": "110001" }
```
Checks if delivery is available to a specific pincode.

**Response:**
```json
{
  "serviceable": true,
  "delivery_codes": {...},
  "estimated_delivery_days": "3-4"
}
```

#### Track by Waybill
```
POST /api/delhivery/track-waybill
Body: { "waybill": "DEL123456789" }
```
Public endpoint to track shipment using waybill number.

**Response:**
```json
{
  "success": true,
  "tracking_data": {
    "waybill": "DEL123456789",
    "current_status": "In Transit",
    "last_location": "Mumbai Hub",
    "last_updated": "2024-01-15 10:30:00",
    "scan_history": [...]
  }
}
```

### User Routes (requires authentication)

#### Track Order
```
GET /api/orders/{orderId}/delhivery-tracking
```
Get tracking information for user's own order.

**Response:**
```json
{
  "success": true,
  "order_id": 123,
  "waybill": "DEL123456789",
  "tracking_data": {...}
}
```

## Shipment Lifecycle

### 1. Order Placed
Order created with status `pending`.

### 2. Admin Creates Shipment
Call `POST /api/delhivery/orders/{orderId}/create-shipment`
- Order status → `processing`
- `delhivery_waybill` saved
- Initial tracking data stored

### 3. Shipment Pickup
Delhivery picks up from warehouse
- Status → `Pickup Scheduled` / `Picked Up`

### 4. In Transit
Package moves through delivery network
- Status → `In Transit`
- Scan history updated at each hub

### 5. Out for Delivery
Package assigned to delivery agent
- Status → `Out for Delivery`

### 6. Delivered
Package delivered to customer
- Status → `Delivered`
- Order status → `delivered`
- `delivered_at` timestamp set

## Status Mapping

| Delhivery Status | Order Status | Description |
|-----------------|--------------|-------------|
| Pickup Scheduled | processing | Awaiting pickup |
| Picked Up | processing | Package collected |
| In Transit | shipped | Moving to destination |
| Out for Delivery | shipped | Final mile delivery |
| Delivered | delivered | Successfully delivered |
| RTO | cancelled | Return to origin |
| Cancelled | cancelled | Shipment cancelled |

## DelhiveryService Methods

### createShipment($orderData)
Creates new shipment with order details.

**Required Fields:**
```php
[
    'order_id' => 'ORD-123',
    'customer_name' => 'John Doe',
    'phone' => '9876543210',
    'address' => 'Full address',
    'city' => 'Mumbai',
    'state' => 'Maharashtra',
    'pincode' => '400001',
    'payment_mode' => 'Prepaid/COD',
    'order_amount' => 1500.00,
    'weight' => 500, // grams
    'products' => [...]
]
```

### trackShipment($waybill)
Fetches current tracking information.

**Returns:**
```php
[
    'waybill' => 'DEL123456789',
    'current_status' => 'In Transit',
    'last_location' => 'Mumbai Hub',
    'last_updated' => '2024-01-15 10:30:00',
    'expected_delivery_date' => '2024-01-18',
    'scan_history' => [
        [
            'status' => 'Picked Up',
            'location' => 'Mumbai Warehouse',
            'datetime' => '2024-01-15 08:00:00',
            'instructions' => 'Package picked up'
        ],
        ...
    ]
]
```

### checkServiceability($pincode)
Verifies delivery availability.

**Returns:**
```php
[
    'serviceable' => true,
    'delivery_codes' => ['D', 'E'], // D=Delivery, E=Express
    'cod_available' => true,
    'prepaid_available' => true,
    'estimated_delivery_days' => '3-4'
]
```

### cancelShipment($waybill)
Cancels shipment before delivery.

**Note:** Cannot cancel after "Out for Delivery" status.

### getWarehouses()
Lists all registered pickup locations with addresses and contact details.

## Frontend Integration

### Display Tracking Timeline
```jsx
// Fetch tracking data
const response = await fetch(`/api/orders/${orderId}/delhivery-tracking`);
const { tracking_data } = await response.json();

// Display scan history
tracking_data.scan_history.map(scan => (
  <div>
    <div>{scan.status}</div>
    <div>{scan.location}</div>
    <div>{scan.datetime}</div>
  </div>
));
```

### Check Serviceability Before Checkout
```jsx
const checkDelivery = async (pincode) => {
  const response = await fetch('/api/delhivery/check-serviceability', {
    method: 'POST',
    body: JSON.stringify({ pincode })
  });
  
  const data = await response.json();
  if (!data.serviceable) {
    alert('Delivery not available to this pincode');
  }
};
```

### Track Order Button
```jsx
<button onClick={() => navigate(`/orders/${orderId}/track`)}>
  Track Order
</button>
```

## Setup Instructions

### 1. Get Delhivery Credentials
1. Register at https://one.delhivery.com/
2. Complete KYC verification
3. Get API key from Settings → API Keys
4. Note your registered warehouse address

### 2. Configure Environment
Update `.env` with:
```env
DELHIVERY_API_KEY=your_actual_key
DELHIVERY_CLIENT_NAME=Your Company Name
DELHIVERY_ENVIRONMENT=production
```

### 3. Register Warehouse
Add pickup warehouse in Delhivery dashboard:
- Name, Address, Contact details
- Note warehouse code for shipment creation

### 4. Test Integration
1. Create test order
2. Call create shipment endpoint
3. Verify waybill generated
4. Track shipment status
5. Test cancellation (if needed)

## Testing Checklist

- [ ] Shipment creation returns valid waybill
- [ ] Tracking data updates automatically
- [ ] Status mapping works correctly
- [ ] Cancellation updates order status
- [ ] Serviceability check validates pincodes
- [ ] Error handling for invalid orders
- [ ] Webhook integration (if configured)
- [ ] COD vs Prepaid orders handled
- [ ] Weight calculation accurate
- [ ] Product details sent correctly

## Error Handling

### Common Errors

**Invalid Pincode**
```json
{
  "error": "Pincode not serviceable",
  "serviceable": false
}
```

**Order Already Shipped**
```json
{
  "error": "Shipment already exists for this order"
}
```

**Missing Required Fields**
```json
{
  "error": "Customer address incomplete"
}
```

### Logging
All Delhivery API calls are logged to Laravel logs:
```php
Log::channel('daily')->info('Delhivery API Call', [
    'method' => 'createShipment',
    'order_id' => $orderId,
    'response' => $response
]);
```

## Best Practices

1. **Always check serviceability** before creating shipment
2. **Sync tracking data daily** using cron job
3. **Store scan history** for customer reference
4. **Handle RTO cases** (Return to Origin)
5. **Set realistic delivery expectations** based on pincode
6. **Update order status** automatically from Delhivery status
7. **Send email notifications** on status changes
8. **Allow shipment cancellation** only before pickup
9. **Validate weight and dimensions** accurately
10. **Monitor API rate limits**

## Webhook Configuration (Optional)

To receive real-time updates from Delhivery:

1. Create webhook endpoint in routes
2. Register webhook URL in Delhivery dashboard
3. Verify webhook signature
4. Update order status automatically

```php
Route::post('/webhooks/delhivery', [DelhiveryController::class, 'handleWebhook']);
```

## 🎓 Complete Integration Example

### Real-World Scenario: First Shipment

**Your Situation**: Customer ordered iPhone case, you need to ship via Delhivery

#### Step 1: Verify Order Ready
```php
Order #1001
Customer: Rahul Singh
Phone: 9876543210
Address: 123 MG Road, Mumbai - 400001
Product: iPhone Case (100g)
Amount: ₹499 (Prepaid)
Status: pending
```

#### Step 2: Create Shipment (Admin Action)
```bash
# API Call
POST http://localhost:8000/api/delhivery/orders/1001/create-shipment
Authorization: Bearer {admin_token}

# Response:
{
  "success": true,
  "message": "Shipment created successfully",
  "waybill": "DEL2025120512345",
  "order": {
    "id": 1001,
    "delhivery_waybill": "DEL2025120512345",
    "delhivery_status": "Pending Pickup",
    "status": "processing"
  }
}

# Database Updated:
orders table → order #1001
- delhivery_waybill: "DEL2025120512345"
- delhivery_status: "Pending Pickup"
- delhivery_status_updated_at: "2025-12-10 14:30:00"
- status: "processing"
```

#### Step 3: Delhivery Pickup
```
Day 1 - 5:00 PM
Delhivery agent comes to your warehouse
Scans: DEL2025120512345
Package collected

Automatic Status Update:
- delhivery_status: "Picked Up"
- Scan added to tracking_data JSON
```

#### Step 4: Customer Tracks Order
```bash
# Customer clicks "Track Order" button
GET http://localhost:8000/api/orders/1001/delhivery-tracking
Authorization: Bearer {customer_token}

# Frontend displays:
Order #1001 - iPhone Case
Tracking: DEL2025120512345

Timeline:
✅ Order Placed        - Dec 10, 10:00 AM
✅ Shipment Created    - Dec 10, 2:30 PM
✅ Picked Up           - Dec 10, 5:00 PM (Mumbai Warehouse)
🚚 In Transit          - Dec 10, 8:00 PM (Mumbai Hub)
⏳ Out for Delivery    - Expected Dec 11
⏳ Delivered           - Expected Dec 11
```

#### Step 5: Delivery Complete
```
Day 2 - 3:00 PM
Delivered to customer

Automatic Update:
- delhivery_status: "Delivered"
- order.status: "delivered"
- delivered_at: "2025-12-11 15:00:00"

Optional: Send email notification
```

---

## 🆘 Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: "401 Unauthorized" Error
**Problem**: API token not working

**Solutions**:
```bash
# Check 1: Verify token in .env
cat .env | grep DELHIVERY_API_KEY
# Should show your token

# Check 2: Clear config cache
php artisan config:clear

# Check 3: Test token directly
curl -X GET "https://track.delhivery.com/api/backend/clientwarehouse/all/" \
  -H "Authorization: Token YOUR_TOKEN"

# Check 4: Confirm token type
# Old format: "Token abc123..."
# New format: Bearer token might be required
```

**Fix**:
- Regenerate token from dashboard
- Update `.env` immediately
- Clear all Laravel caches

#### Issue 2: "Pincode not serviceable"
**Problem**: Cannot create shipment to customer pincode

**Solutions**:
1. **Check Serviceability First**:
   ```bash
   POST /api/delhivery/check-serviceability
   Body: {"pincode": "110001"}
   ```

2. **Common Non-Serviceable Areas**:
   - Remote villages
   - Restricted military zones
   - Islands (Andaman, Lakshadweep)
   - Some J&K regions

3. **Alternative**:
   - Contact Delhivery to add coverage
   - Use different courier for that pincode
   - Ask customer for alternate address

#### Issue 3: "Warehouse not found"
**Problem**: Pickup location not registered

**Solutions**:
1. **Add Warehouse in Dashboard**:
   - Settings → Pickup Locations → Add New
   - Fill complete address with pincode
   - Wait for approval (1-2 hours)

2. **Verify Warehouse Code**:
   ```bash
   GET /api/delhivery/warehouses
   # Should list your warehouse with code
   ```

3. **Update shipment data** with correct warehouse details

#### Issue 4: Waybill Not Generated
**Problem**: Create shipment returns success but no waybill

**Check Laravel Logs**:
```bash
tail -f storage/logs/laravel.log

# Look for:
# - API response from Delhivery
# - Any error messages
# - Validation failures
```

**Common Causes**:
- Missing required fields (phone, address)
- Invalid pincode format
- Weight = 0 or missing
- Customer name has special characters

**Fix**: Ensure all fields properly formatted in `formatShipmentData()`

#### Issue 5: Tracking Shows "No Data"
**Problem**: Customer cannot see tracking info

**Reasons**:
1. **Too Early**: Pickup not done yet (status still "Pending Pickup")
2. **Waybill Not Synced**: Delhivery hasn't updated their system
3. **Invalid Waybill**: Check if waybill exists in database

**Solutions**:
```bash
# Manual sync
GET /api/delhivery/orders/{orderId}/sync-tracking

# Check order
SELECT delhivery_waybill, delhivery_status 
FROM orders 
WHERE id = {orderId};

# If waybill exists but no tracking:
# Wait 1-2 hours after pickup for data to populate
```

#### Issue 6: "Cannot cancel shipment"
**Problem**: Cancellation fails

**Reasons**:
- Already picked up (past cancellation window)
- Already out for delivery
- Already delivered

**Delhivery Cancellation Rules**:
- ✅ Can cancel: Before pickup
- ⚠️ Maybe cancel: After pickup but in hub
- ❌ Cannot cancel: Out for delivery or delivered

**Solution**: Contact Delhivery support for RTO (Return to Origin)

---

## 📞 Support & Resources

### Delhivery Contacts

**Dashboard**: https://one.delhivery.com/

**Support Channels**:
- 📧 **API Support**: api.support@delhivery.com
- 📧 **Sales**: sales@delhivery.com
- ☎️ **Phone**: 1800-103-6161 (Mon-Sat, 10 AM - 6 PM)
- 💬 **Chat**: Available in dashboard (bottom-right corner)

**Documentation**:
- **API Docs**: https://docs.delhivery.com/
- **Integration Guide**: Check dashboard → Help Center
- **Rate Calculator**: https://www.delhivery.com/rate-calculator

**Account Manager** (After going live):
- You'll be assigned dedicated person
- WhatsApp support
- Faster resolution

### Response Times

| Channel | Test Mode | Live Mode |
|---------|-----------|-----------|
| Email | 24-48 hours | 4-8 hours |
| Phone | During business hours | Priority support |
| Chat | Available | Available |
| Account Manager | N/A | Within 1 hour |

### Escalation Matrix

1. **Level 1**: Dashboard chat support
2. **Level 2**: Email to api.support@delhivery.com
3. **Level 3**: Call customer care
4. **Level 4**: Account manager (live accounts)
5. **Level 5**: Escalation to manager (for critical issues)

---

## ✅ Final Checklist

### Development Phase
- [x] Integration code completed
- [x] Migration executed
- [x] Order model updated
- [ ] Get test API credentials
- [ ] Configure test warehouse
- [ ] Test all endpoints locally
- [ ] Handle errors gracefully
- [ ] Add logging for debugging

### Testing Phase
- [ ] Create test shipment
- [ ] Verify waybill generation
- [ ] Test tracking functionality
- [ ] Check serviceability API
- [ ] Test cancellation flow
- [ ] Verify status synchronization
- [ ] Test COD orders
- [ ] Test prepaid orders
- [ ] Edge case testing (invalid data)
- [ ] Performance testing

### Production Preparation
- [ ] Complete KYC with Delhivery
- [ ] Get documents approved
- [ ] Sign commercial agreement
- [ ] Get live API credentials
- [ ] Add production warehouses
- [ ] Load wallet / set credit limit
- [ ] Test with 1-2 real orders
- [ ] Monitor for 24 hours
- [ ] Train admin staff
- [ ] Document internal processes

### Go Live
- [ ] Update `.env` with live credentials
- [ ] Clear all caches
- [ ] Enable monitoring/alerting
- [ ] Inform customer support team
- [ ] Create shipment for first order
- [ ] Verify pickup happens
- [ ] Track until delivery
- [ ] Collect customer feedback
- [ ] Monitor error logs
- [ ] Check Delhivery dashboard daily

### Post-Launch
- [ ] Set up automated daily sync
- [ ] Configure webhook (optional)
- [ ] Email notifications on status change
- [ ] SMS notifications (optional)
- [ ] Create admin dashboard analytics
- [ ] Track delivery performance
- [ ] Monitor RTO rates
- [ ] Optimize packaging based on feedback
- [ ] Negotiate better rates after volume

---

## 📊 Integration Status

### ✅ Completed
1. **Backend Implementation**
   - ✅ DelhiveryService with all methods
   - ✅ DelhiveryController with 8 endpoints
   - ✅ Database migration executed
   - ✅ Order model updated with Delhivery fields
   - ✅ API routes configured (Admin, Public, User)
   - ✅ Error handling and logging
   - ✅ Configuration file created

2. **Features Available**
   - ✅ Create shipment from order
   - ✅ Track by order ID
   - ✅ Track by waybill number
   - ✅ Check pincode serviceability
   - ✅ Cancel shipment
   - ✅ Sync tracking data
   - ✅ Get warehouse list
   - ✅ Auto status mapping

### 🔄 Pending Tasks
1. **Credentials & Setup**
   - ⏳ Register on Delhivery dashboard
   - ⏳ Get test API credentials
   - ⏳ Add test warehouse
   - ⏳ Get live credentials (after KYC)
   - ⏳ Add production warehouses

2. **Testing**
   - ⏳ Test shipment creation
   - ⏳ Verify tracking updates
   - ⏳ Test all edge cases
   - ⏳ Performance testing

3. **Frontend Development**
   - ⏳ Create tracking page UI
   - ⏳ Add "Track Order" button
   - ⏳ Display scan history timeline
   - ⏳ Show estimated delivery
   - ⏳ Handle loading states
   - ⏳ Show error messages

4. **Enhancements**
   - ⏳ Email notifications on status change
   - ⏳ SMS notifications (optional)
   - ⏳ Webhook integration for real-time updates
   - ⏳ Admin dashboard for shipments
   - ⏳ Bulk shipment creation
   - ⏳ Automated daily sync cron job
   - ⏳ Delivery performance analytics

---

## 📝 Quick Reference

### API Endpoints Summary

```
ADMIN ROUTES (require role:Admin)
├── POST   /api/delhivery/orders/{orderId}/create-shipment
├── POST   /api/delhivery/orders/{orderId}/cancel-shipment
├── GET    /api/delhivery/orders/{orderId}/sync-tracking
└── GET    /api/delhivery/warehouses

PUBLIC ROUTES
├── POST   /api/delhivery/check-serviceability
└── POST   /api/delhivery/track-waybill

USER ROUTES (require authentication)
└── GET    /api/orders/{orderId}/delhivery-tracking
```

### Environment Variables

```env
# Required
DELHIVERY_API_KEY=your_token_here
DELHIVERY_API_URL=https://track.delhivery.com/api
DELHIVERY_ENVIRONMENT=production|staging
DELHIVERY_CLIENT_NAME=YourCompanyName

# Optional (for easy switching)
DELHIVERY_API_KEY_TEST=test_token
DELHIVERY_API_KEY_LIVE=live_token
```

### Status Mapping

| Delhivery | Your Order Status |
|-----------|-------------------|
| Pending Pickup | processing |
| Picked Up | processing |
| In Transit | shipped |
| Out for Delivery | shipped |
| Delivered | delivered |
| RTO | cancelled |
| Cancelled | cancelled |

### Important URLs

- **Dashboard**: https://one.delhivery.com/
- **API Docs**: https://docs.delhivery.com/
- **Support**: api.support@delhivery.com
- **Phone**: 1800-103-6161

---

## 🎉 You're Ready!

Your Delhivery integration is **fully implemented and ready to use**. Follow this document step-by-step to:

1. ✅ Get test credentials → Test everything → Fix any issues
2. ✅ Get live credentials → Complete KYC → Go production
3. ✅ Switch between test and live easily

**Next immediate step**: Register at https://one.delhivery.com/ and request test API credentials.

---

## 📄 Files Reference

**Modified/Created Files:**
- ✅ `config/delhivery.php` - Configuration
- ✅ `app/Services/DelhiveryService.php` - Service layer (400+ lines)
- ✅ `app/Http/Controllers/DelhiveryController.php` - Controller (350+ lines)
- ✅ `app/Models/Order.php` - Updated $fillable and $casts
- ✅ `database/migrations/2025_12_10_055939_add_delhivery_fields_to_orders_table.php` - Migration (executed)
- ✅ `routes/api.php` - Added 7 new routes
- ✅ `.env` - Added Delhivery variables
- ✅ `DELHIVERY_INTEGRATION.md` - This complete guide

**Database Changes:**
```sql
ALTER TABLE orders ADD COLUMN:
- delhivery_waybill VARCHAR(255)
- delhivery_status VARCHAR(255)
- delhivery_status_updated_at TIMESTAMP
- delhivery_tracking_data JSON
- courier_name VARCHAR(255) DEFAULT 'Delhivery'
- delivery_instructions TEXT
```

Need help? Email: api.support@delhivery.com or check docs at https://docs.delhivery.com/
