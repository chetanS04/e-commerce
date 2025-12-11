<?php
$waybill = $argv[1] ?? "46754510000044";
$apiKey = "01f9c0dc1b34a02b830fdc5b232c7ca7d41466ad";
$baseUrl = "https://track.delhivery.com/api";

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
