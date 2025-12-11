<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class DelhiveryService
{
    protected $apiKey;
    protected $baseUrl;
    protected $clientName;

    public function __construct()
    {
        $this->apiKey = config('delhivery.api_key');
        $this->baseUrl = config('delhivery.base_url');
        $this->clientName = config('delhivery.client_name');
    }

    /**
     * Create a new shipment with Delhivery
     * 
     * @param array $orderData
     * @return array
     */
    public function createShipment(array $orderData)
    {
        try {
            $shipmentData = $this->formatShipmentData($orderData);
            
            Log::info('Sending to Delhivery', [
                'url' => $this->baseUrl . '/cmu/create.json',
                'data' => $shipmentData
            ]);
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Token ' . $this->apiKey,
            ])->post($this->baseUrl . '/cmu/create.json', [
                'format' => 'json',
                'data' => json_encode($shipmentData)
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Delhivery API Response', [
                    'order_id' => $orderData['order_id'],
                    'status_code' => $response->status(),
                    'full_response' => $data,
                    'waybill' => $data['waybill'] ?? null
                ]);

                return [
                    'success' => true,
                    'waybill' => $data['waybill'] ?? null,
                    'message' => 'Shipment created successfully',
                    'data' => $data
                ];
            }

            Log::error('Delhivery shipment creation failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'request_data' => $shipmentData
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create shipment',
                'error' => $response->body()
            ];
        } catch (Exception $e) {
            Log::error('Delhivery shipment creation error', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Error creating shipment',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Track a shipment using waybill number
     * 
     * @param string $waybill
     * @return array
     */
    public function trackShipment(string $waybill)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Token ' . $this->apiKey,
            ])->get($this->baseUrl . '/v1/packages/json/', [
                'waybill' => $waybill
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'tracking_data' => $this->parseTrackingData($data),
                    'raw_data' => $data
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to track shipment',
                'error' => $response->body()
            ];
        } catch (Exception $e) {
            Log::error('Delhivery tracking error', [
                'waybill' => $waybill,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Error tracking shipment',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get serviceability for a pincode
     * 
     * @param string $pincode
     * @return array
     */
    public function checkServiceability(string $pincode)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Token ' . $this->apiKey,
            ])->get($this->baseUrl . '/c/api/pin-codes/json/', [
                'filter_codes' => $pincode
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'serviceable' => !empty($data['delivery_codes']),
                    'data' => $data
                ];
            }

            return [
                'success' => false,
                'serviceable' => false,
                'message' => 'Failed to check serviceability'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'serviceable' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Cancel a shipment
     * 
     * @param string $waybill
     * @return array
     */
    public function cancelShipment(string $waybill)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Token ' . $this->apiKey,
            ])->post($this->baseUrl . '/cmu/cancel.json', [
                'waybill' => $waybill
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Shipment cancelled successfully'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to cancel shipment',
                'error' => $response->body()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error cancelling shipment',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format order data for Delhivery shipment creation
     * 
     * @param array $orderData
     * @return array
     */
    protected function formatShipmentData(array $orderData)
    {
        // Get warehouse/return address from config or use defaults
        $returnAddress = env('DELHIVERY_RETURN_ADDRESS', 'Warehouse Address');
        $returnCity = env('DELHIVERY_RETURN_CITY', 'Mumbai');
        $returnState = env('DELHIVERY_RETURN_STATE', 'Maharashtra');
        $returnPin = env('DELHIVERY_RETURN_PIN', '400001');
        $returnPhone = env('DELHIVERY_RETURN_PHONE', '9999999999');

        return [
            'shipments' => [[
                'name' => $orderData['customer_name'],
                'add' => $orderData['address'],
                'pin' => $orderData['postal_code'],
                'city' => $orderData['city'],
                'state' => $orderData['state'],
                'country' => $orderData['country'] ?? 'India',
                'phone' => $orderData['phone'],
                'order' => $orderData['order_number'],
                'payment_mode' => $orderData['payment_method'] === 'cash_on_delivery' ? 'COD' : 'Prepaid',
                'return_pin' => $returnPin,
                'return_city' => $returnCity,
                'return_phone' => $returnPhone,
                'return_add' => $returnAddress,
                'return_state' => $returnState,
                'return_country' => 'India',
                'products_desc' => $orderData['products_description'] ?? 'General Items',
                'hsn_code' => '',
                'cod_amount' => $orderData['payment_method'] === 'cash_on_delivery' ? (string)$orderData['total'] : '0',
                'order_date' => $orderData['order_date'] ?? now()->format('Y-m-d H:i:s'),
                'total_amount' => (string)$orderData['total'],
                'seller_add' => $returnAddress,
                'seller_name' => $this->clientName,
                'seller_inv' => $orderData['order_number'],
                'quantity' => $orderData['total_items'] ?? 1,
                'waybill' => '',
                'shipment_width' => $orderData['width'] ?? 10,
                'shipment_height' => $orderData['height'] ?? 10,
                'weight' => $orderData['weight'] ?? 0.5,
                'seller_gst_tin' => '',
                'shipping_mode' => 'Surface',
                'address_type' => 'home'
            ]]
        ];
    }

    /**
     * Parse tracking data from Delhivery response
     * 
     * @param array $data
     * @return array
     */
    protected function parseTrackingData(array $data)
    {
        if (empty($data['ShipmentData'])) {
            return [];
        }

        $shipment = $data['ShipmentData'][0] ?? [];
        $scans = $shipment['Scans'] ?? [];

        return [
            'waybill' => $shipment['Waybill'] ?? '',
            'status' => $shipment['Status']['Status'] ?? 'Unknown',
            'status_code' => $shipment['Status']['StatusCode'] ?? '',
            'status_date' => $shipment['Status']['StatusDateTime'] ?? '',
            'expected_delivery' => $shipment['ExpectedDeliveryDate'] ?? '',
            'current_location' => $shipment['Status']['Instructions'] ?? '',
            'scans' => collect($scans)->map(function ($scan) {
                return [
                    'scan_date' => $scan['ScanDateTime'] ?? '',
                    'scan_type' => $scan['ScanType'] ?? '',
                    'scan_detail' => $scan['Scan'] ?? '',
                    'location' => $scan['ScannedLocation'] ?? '',
                    'instructions' => $scan['Instructions'] ?? ''
                ];
            })->toArray()
        ];
    }

    /**
     * Get warehouse/pickup locations
     * 
     * @return array
     */
    public function getWarehouses()
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Token ' . $this->apiKey,
            ])->get($this->baseUrl . '/backend/clientwarehouse/all/');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'warehouses' => $response->json()
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch warehouses'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
