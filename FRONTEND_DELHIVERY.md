# 🎨 Delhivery Frontend Integration Guide

## 📁 Files Created

### 1. **API Layer** (`utils/delhiveryApi.ts`)
Complete TypeScript API client for all Delhivery endpoints:
- `createDelhiveryShipment()` - Create shipment
- `trackOrderDelhivery()` - Track by order ID
- `trackByWaybill()` - Public tracking
- `checkServiceability()` - Check pincode
- `cancelDelhiveryShipment()` - Cancel shipment  
- `syncDelhiveryTracking()` - Sync tracking data
- `getDelhiveryWarehouses()` - Get warehouses

### 2. **Components** (`src/components/`)

#### `TrackingTimeline.tsx`
Beautiful timeline component showing shipment journey:
- ✅ Visual timeline with icons
- ✅ Status-based colors (green=delivered, blue=transit, etc.)
- ✅ Scan history with locations & timestamps
- ✅ Expected delivery date display
- ✅ Waybill information
- ✅ Responsive design

**Usage:**
```tsx
import TrackingTimeline from '@/components/TrackingTimeline';

<TrackingTimeline trackingData={trackingData} />
```

#### `CreateShipmentModal.tsx`
Modal for admins to create Delhivery shipments:
- ✅ Pre-flight checklist display
- ✅ Loading states
- ✅ Success/Error messages
- ✅ Auto-closes after success
- ✅ Waybill display

**Usage:**
```tsx
import CreateShipmentModal from '@/components/CreateShipmentModal';

<CreateShipmentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  orderId={123}
  orderNumber="ORD-001"
  onSuccess={() => {
    // Refresh orders list
  }}
/>
```

#### `ServiceabilityChecker.tsx`
Inline component to check delivery availability:
- ✅ Auto-checks when pincode is 6 digits
- ✅ Shows delivery availability
- ✅ Displays COD/Prepaid support
- ✅ Estimated delivery time
- ✅ Beautiful success/error states

**Usage:**
```tsx
import ServiceabilityChecker from '@/components/ServiceabilityChecker';

<ServiceabilityChecker
  pincode="110001"
  onServiceabilityCheck={(isServiceable) => {
    console.log('Serviceable:', isServiceable);
  }}
/>
```

### 3. **Pages**

#### `app/(dashboards)/dashboard/orders/[orderId]/track/page.tsx`
Full-page tracking for authenticated users:
- ✅ Order details summary
- ✅ Tracking timeline
- ✅ Refresh/sync button
- ✅ Copy waybill number
- ✅ Help section

**Route:** `/dashboard/orders/123/track`

#### `app/(marketing)/track-shipment/page.tsx`
**Public tracking page** - no login required:
- ✅ Search by waybill number
- ✅ Beautiful landing page design
- ✅ Info cards
- ✅ Error handling
- ✅ Responsive layout

**Route:** `/track-shipment`

### 4. **Admin Orders Integration**
Modified `app/(dashboards)/dashboard/orders/page.tsx`:
- ✅ "Create Shipment" button (for orders without waybill)
- ✅ "Track Shipment" button (for orders with waybill)
- ✅ Shows buttons only for confirmed/processing orders
- ✅ Modal integration
- ✅ Success toast messages

---

## 🚀 Quick Setup

### Step 1: Install Dependencies (if not already)
```bash
cd next-app
npm install lucide-react
```

### Step 2: Verify Environment
Ensure your `.env.local` or `.env` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Test Components

#### Test 1: Public Tracking Page
```bash
# Navigate to:
http://localhost:3000/track-shipment

# Enter waybill: DEL2025121012345
```

#### Test 2: Admin Create Shipment
```bash
# Login as admin
# Go to: http://localhost:3000/dashboard/orders
# Find order with status "confirmed" or "processing"
# Click "Create Shipment" button
```

#### Test 3: Track from Dashboard
```bash
# After creating shipment
# Click "Track Shipment" button
# Or go to: http://localhost:3000/dashboard/orders/123/track
```

---

## 🎨 UI Components Showcase

### TrackingTimeline Display

```
┌─────────────────────────────────────────┐
│  Shipment Tracking                      │
│  Status: In Transit             🚚      │
├─────────────────────────────────────────┤
│  Waybill: DEL123456789                  │
│  📍 Last Location: Mumbai Hub           │
│  🕐 Expected: Dec 12, 2025              │
├─────────────────────────────────────────┤
│                                         │
│  Timeline:                              │
│  ✅ Picked Up                           │
│     📍 Mumbai Warehouse                 │
│     🕐 Dec 10, 10:00 AM                 │
│                                         │
│  📦 In Transit                          │
│     📍 Mumbai Hub                       │
│     🕐 Dec 10, 2:30 PM                  │
│                                         │
│  ⏳ Out for Delivery                    │
│     Expected                            │
│                                         │
└─────────────────────────────────────────┘
```

### Admin Orders Page - New Buttons

```
Order List:
┌──────┬────────────┬────────┬─────────────────────────────┐
│ #    │ Order      │ Status │ Actions                     │
├──────┼────────────┼────────┼─────────────────────────────┤
│ 101  │ ORD-001    │ ✓ Conf │ [View] [Update] [Create]    │
│      │            │        │                  Shipment   │
├──────┼────────────┼────────┼─────────────────────────────┤
│ 102  │ ORD-002    │ 🚚 Ship│ [View] [Update] [Track]     │
│      │            │  DEL...│                  Shipment   │
└──────┴────────────┴────────┴─────────────────────────────┘
```

---

## 📦 Component Props Reference

### TrackingTimeline
```typescript
type TrackingTimelineProps = {
  trackingData: {
    waybill: string;
    current_status: string;
    last_location: string;
    last_updated: string;
    expected_delivery_date?: string;
    scan_history: Array<{
      status: string;
      location: string;
      datetime: string;
      instructions?: string;
    }>;
  };
};
```

### CreateShipmentModal
```typescript
type CreateShipmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
  onSuccess: () => void;
};
```

### ServiceabilityChecker
```typescript
type ServiceabilityCheckerProps = {
  pincode: string;
  onServiceabilityCheck?: (isServiceable: boolean) => void;
};
```

---

## 🔌 Integration Examples

### Example 1: Add to Checkout Page

```tsx
// app/checkout/page.tsx
import ServiceabilityChecker from '@/components/ServiceabilityChecker';

const CheckoutPage = () => {
  const [pincode, setPincode] = useState('');
  const [canDeliver, setCanDeliver] = useState(false);

  return (
    <div>
      <input
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Enter pincode"
      />
      
      <ServiceabilityChecker
        pincode={pincode}
        onServiceabilityCheck={setCanDeliver}
      />
      
      <button disabled={!canDeliver}>
        Place Order
      </button>
    </div>
  );
};
```

### Example 2: User Order History

```tsx
// app/profile/orders/page.tsx
const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Order #{order.order_number}</h3>
          
          {order.delhivery_waybill && (
            <a href={`/dashboard/orders/${order.id}/track`}>
              Track Order
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Email Template Link

```html
<!-- In your email template -->
<a href="https://yoursite.com/track-shipment">
  Track your order: {{waybill}}
</a>
```

---

## 🎯 Testing Checklist

### ✅ Component Tests

- [ ] **TrackingTimeline**
  - [ ] Displays waybill correctly
  - [ ] Shows all scan history
  - [ ] Icons match status
  - [ ] Dates formatted properly
  - [ ] Responsive on mobile

- [ ] **CreateShipmentModal**
  - [ ] Opens/closes correctly
  - [ ] Shows loading state
  - [ ] Displays success message
  - [ ] Shows error messages
  - [ ] Calls onSuccess callback

- [ ] **ServiceabilityChecker**
  - [ ] Auto-checks at 6 digits
  - [ ] Shows serviceable message
  - [ ] Shows non-serviceable message
  - [ ] Displays delivery options
  - [ ] Calls callback function

### ✅ Page Tests

- [ ] **Public Tracking Page**
  - [ ] Search form works
  - [ ] Shows timeline for valid waybill
  - [ ] Shows error for invalid waybill
  - [ ] Responsive design
  - [ ] Info cards display

- [ ] **Dashboard Track Page**
  - [ ] Loads order details
  - [ ] Displays tracking timeline
  - [ ] Refresh button works
  - [ ] Copy waybill works
  - [ ] Back button navigates correctly

- [ ] **Admin Orders Page**
  - [ ] Create Shipment button appears
  - [ ] Button only shows for eligible orders
  - [ ] Track button shows after shipment created
  - [ ] Modal opens correctly
  - [ ] Success updates order list

### ✅ Integration Tests

- [ ] Create shipment from admin
- [ ] Verify waybill saved in database
- [ ] Track from admin dashboard
- [ ] Track from public page
- [ ] Check serviceability at checkout
- [ ] Sync tracking data
- [ ] Error handling for all flows

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found: lucide-react"
```bash
npm install lucide-react
```

### Issue 2: API calls failing (CORS)
Check Laravel `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### Issue 3: 401 Unauthorized
- Ensure user is logged in
- Check token in localStorage
- Verify Sanctum middleware on routes

### Issue 4: Tracking shows "No data"
- Wait 1-2 hours after shipment creation
- Delhivery might not have updated yet
- Try manual sync

### Issue 5: Buttons not showing
- Check order status (must be confirmed/processing)
- Verify `delhivery_waybill` field in database
- Check component imports

---

## 🎨 Customization Guide

### Change Colors

```tsx
// In TrackingTimeline.tsx
const getStatusColor = (status: string) => {
  if (status.includes('delivered')) {
    return 'border-green-500 bg-green-50'; // Change to your brand color
  }
  // ... customize other statuses
};
```

### Modify Timeline Layout

```tsx
// TrackingTimeline.tsx - Change timeline position
<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
  {/* Change 'left-4' to adjust position */}
</div>
```

### Custom Success Messages

```tsx
// CreateShipmentModal.tsx
setSuccess(`🎉 Shipment created! Track it: ${response.waybill}`);
```

### Add SMS Notifications

```tsx
// After successful shipment creation
const sendSMS = async (phone: string, message: string) => {
  // Your SMS API integration
};

onSuccess={() => {
  sendSMS(customer.phone, `Your order shipped! Track: ${waybill}`);
});
```

---

## 📱 Mobile Responsiveness

All components are fully responsive:
- ✅ Timeline: Stacks vertically on mobile
- ✅ Modals: Full-width on small screens
- ✅ Buttons: Touch-friendly sizes
- ✅ Forms: Proper mobile inputs
- ✅ Tables: Horizontal scroll on mobile

### Mobile Breakpoints Used:
```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
```

---

## 🚀 Performance Optimization

### 1. Lazy Load Components
```tsx
import dynamic from 'next/dynamic';

const TrackingTimeline = dynamic(() => import('@/components/TrackingTimeline'), {
  loading: () => <p>Loading...</p>
});
```

### 2. Cache Tracking Data
```tsx
const [cache, setCache] = useState<Map<string, any>>(new Map());

const fetchTracking = async (waybill: string) => {
  if (cache.has(waybill)) {
    return cache.get(waybill);
  }
  
  const data = await trackByWaybill(waybill);
  cache.set(waybill, data);
  return data;
};
```

### 3. Debounce Serviceability Checks
```tsx
import { useDebounce } from 'use-debounce';

const [debouncedPincode] = useDebounce(pincode, 500);

useEffect(() => {
  if (debouncedPincode.length === 6) {
    checkServiceability(debouncedPincode);
  }
}, [debouncedPincode]);
```

---

## 📊 Analytics Integration

### Track User Actions

```tsx
// Add to components
import { analytics } from '@/lib/analytics';

// In CreateShipmentModal
const handleCreateShipment = async () => {
  analytics.track('Shipment Created', {
    orderId,
    orderNumber,
    timestamp: new Date()
  });
  
  // ... rest of code
};

// In TrackingTimeline
analytics.track('Tracking Viewed', {
  waybill: trackingData.waybill,
  status: trackingData.current_status
});
```

---

## 🔒 Security Considerations

### 1. Admin-Only Actions
```tsx
// Ensure only admins can create shipments
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();

{user?.role === 'admin' && (
  <button onClick={createShipment}>
    Create Shipment
  </button>
)}
```

### 2. Sanitize Inputs
```tsx
// In ServiceabilityChecker
const sanitizedPincode = pincode.replace(/[^0-9]/g, '');
```

### 3. Rate Limiting
```tsx
// Prevent spam tracking requests
const [lastCheck, setLastCheck] = useState(0);

const handleTrack = () => {
  const now = Date.now();
  if (now - lastCheck < 5000) {
    alert('Please wait before checking again');
    return;
  }
  setLastCheck(now);
  // ... proceed with tracking
};
```

---

## 📚 Additional Resources

### Delhivery API Docs
- https://docs.delhivery.com/

### Next.js Documentation
- https://nextjs.org/docs

### Tailwind CSS
- https://tailwindcss.com/docs

### Lucide Icons
- https://lucide.dev/icons

---

## 🎉 You're All Set!

Your frontend is now fully integrated with Delhivery:

✅ **Admin can create shipments** from orders page
✅ **Users can track orders** from dashboard
✅ **Public tracking page** for anyone with waybill
✅ **Serviceability checker** for checkout
✅ **Beautiful UI** with loading states and errors

### Next Steps:

1. **Test all flows** with real data
2. **Customize colors** to match your brand
3. **Add email notifications** on status changes
4. **Integrate SMS** for tracking updates
5. **Add analytics** to track user behavior
6. **Monitor performance** and optimize

### Need Help?

- Check the troubleshooting section above
- Review component props reference
- Test with the provided examples
- Refer to `TESTING_DELHIVERY.md` for backend testing

---

**Happy Coding! 🚀**
