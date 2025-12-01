"use client";

import ProtectedRoute from "@/components/(sheared)/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute role="Admin">
      <div className="p-10 text-center font-semibold text-gray-700 text-xl space-y-6">

        {/* Dashboard Section */}
        <div x-show="activeSection === 'dashboard'" className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)]">
              <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)]">
              <h2 className="text-lg font-semibold text-gray-700">Pending Orders</h2>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)]">
              <h2 className="text-lg font-semibold text-gray-700">Total Spent</h2>
              <p className="text-2xl font-bold text-blue-600">$500.00</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)]">
              <h2 className="text-lg font-semibold text-gray-700">Total Spent</h2>
              <p className="text-2xl font-bold text-blue-600">$500.00</p>
            </div>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
