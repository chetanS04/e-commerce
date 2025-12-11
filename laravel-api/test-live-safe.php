<?php

echo "Testing Delhivery API in PRODUCTION/LIVE MODE\n";
echo "=============================================\n";
echo "⚠️  WARNING: This creates REAL shipments!\n";
echo "=============================================\n\n";

$apiKey = '01f9c0dc1b34a02b830fdc5b232c7ca7d41466ad';
$baseUrl = 'https://track.delhivery.com/api';

echo "Environment: PRODUCTION/LIVE\n";
echo "API Key: " . substr($apiKey, 0, 10) . "...\n";
echo "Base URL: $baseUrl\n\n";

// SAFE TEST: Use your own address as both pickup and delivery
// This way you can test without sending to real customers
$shipmentData = [
    'shipments' => [
        [
            // Delivery to YOUR OWN ADDRESS (for safe testing)
            'name' => 'Rahul Singh (TEST)',
            'add' => '#129 naib colony Village kanwla',
            'pin' => '134003',
            'city' => 'Ambala',
            'state' => 'Haryana',
            'country' => 'India',
            'phone' => '9729310456',
            'order' => 'LIVE-TEST-' . time(),
            'payment_mode' => 'Prepaid',
            
            // Return address (same as your warehouse)
            'return_pin' => '134003',
            'return_city' => 'Ambala',
            'return_phone' => '9729310456',
            'return_add' => '#129 naib colony Village kanwla',
            'return_state' => 'Haryana',
            'return_country' => 'India',
            'return_name' => 'Zelton',
            
            // Low-value test item
            'products_desc' => 'Test Product - DO NOT SHIP',
            'hsn_code' => '999999',
            'cod_amount' => '0',
            'order_date' => date('Y-m-d H:i:s'),
            'total_amount' => '10', // Very low value for safety
            'seller_add' => '#129 naib colony Village kanwla',
            'seller_name' => 'Zelton',
            'seller_inv' => 'TEST-INV-' . time(),
            'quantity' => '1',
            'waybill' => '',
            'shipment_width' => '10',
            'shipment_height' => '10',
            'weight' => '100', // Very light package
            'seller_gst_tin' => '',
            'shipping_mode' => 'Surface',
            'address_type' => 'home'
        ]
    ]
];

echo "🔍 TEST SHIPMENT DETAILS:\n";
echo "From: Zelton, Ambala (Your warehouse)\n";
echo "To: Rahul Singh (TEST), Ambala (YOUR OWN ADDRESS)\n";
echo "Value: Rs. 10 (Low value for safety)\n";
echo "Mode: Prepaid (No COD complications)\n";
echo "Weight: 100g (Minimal)\n\n";

echo "⚠️  IMPORTANT: This will create a REAL shipment in Delhivery!\n";
echo "You can CANCEL it immediately after getting the waybill.\n\n";

echo "Creating test shipment...\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/cmu/create.json');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'format=json&data=' . json_encode($shipmentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Token ' . $apiKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n\n";

if ($httpCode == 200) {
    $result = json_decode($response, true);
    
    echo "Response:\n";
    print_r($result);
    
    echo "\n=============================================\n";
    
    if (isset($result['packages'][0])) {
        $package = $result['packages'][0];
        
        if (!empty($package['waybill'])) {
            echo "🎉 SUCCESS! Integration is WORKING!\n\n";
            echo "Waybill Number: " . $package['waybill'] . "\n";
            echo "Status: " . ($package['status'] ?? 'N/A') . "\n";
            echo "Payment Mode: " . ($package['payment'] ?? 'N/A') . "\n\n";
            
            echo "✅ NEXT STEPS:\n";
            echo "1. Go to Delhivery Dashboard → Forward Orders\n";
            echo "2. Search for waybill: " . $package['waybill'] . "\n";
            echo "3. You should see your test shipment\n";
            echo "4. CANCEL this shipment immediately (it's just for testing)\n\n";
            
            echo "🔧 TO CANCEL THIS TEST SHIPMENT:\n";
            echo "Run: php cancel-test-shipment.php " . $package['waybill'] . "\n\n";
            
            // Create cancel script
            $cancelScript = '<?php
$waybill = $argv[1] ?? "' . $package['waybill'] . '";
$apiKey = "' . $apiKey . '";
$baseUrl = "' . $baseUrl . '";

echo "Cancelling test shipment: $waybill\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . "/cmu/push/json/?wbn=" . $waybill . "&cancellation=true");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Token " . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode == 200) {
    echo "\n✓ Shipment cancelled successfully!\n";
} else {
    echo "\n✗ Cancel failed. Cancel manually from dashboard.\n";
}
';
            file_put_contents('cancel-test-shipment.php', $cancelScript);
            
            echo "==> YOUR INTEGRATION IS WORKING PERFECTLY! 🚀\n";
            
        } else {
            echo "❌ FAILED: No waybill generated\n\n";
            
            if (isset($package['err_code'])) {
                echo "Error Code: " . $package['err_code'] . "\n";
                echo "Status: " . ($package['status'] ?? 'N/A') . "\n";
                
                if (isset($package['remarks'])) {
                    echo "Remarks:\n";
                    foreach ($package['remarks'] as $remark) {
                        echo "  - $remark\n";
                    }
                }
                
                echo "\n📧 ACTION REQUIRED:\n";
                echo "The ER0005 error means Delhivery needs to verify your account.\n";
                echo "Wait for response from Nilanshu Singh (nilanshu.singh@delhivery.com)\n";
                echo "They should enable API access within 24-48 hours.\n";
            }
        }
    }
} else {
    echo "❌ HTTP Error: $httpCode\n";
    echo "Response: " . substr($response, 0, 500) . "\n";
}

echo "\n=============================================\n";
echo "Test complete.\n";
