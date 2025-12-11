<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delhivery_waybill')->nullable()->after('transaction_id');
            $table->string('delhivery_status')->nullable()->after('delhivery_waybill');
            $table->timestamp('delhivery_status_updated_at')->nullable()->after('delhivery_status');
            $table->json('delhivery_tracking_data')->nullable()->after('delhivery_status_updated_at');
            $table->string('courier_name')->default('Delhivery')->after('delhivery_tracking_data');
            $table->text('delivery_instructions')->nullable()->after('courier_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delhivery_waybill',
                'delhivery_status',
                'delhivery_status_updated_at',
                'delhivery_tracking_data',
                'courier_name',
                'delivery_instructions'
            ]);
        });
    }
};
