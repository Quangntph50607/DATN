import React from 'react';

interface ShippingMethodSectionProps {
  shippingMethod: string;
  onShippingMethodChange: (method: string) => void;
}

export default function ShippingMethodSection({
  shippingMethod,
  onShippingMethodChange,
}: ShippingMethodSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-500">🚚</span>
        <h2 className="text-lg font-semibold text-black">Phương thức vận chuyển</h2>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shipping"
              value="Nhanh"
              checked={shippingMethod === "Nhanh"}
              onChange={(e) => onShippingMethodChange(e.target.value)}
              className="text-orange-500"
            />
            <div>
              <div className="font-medium text-black">Giao hàng nhanh</div>
              <div className="text-sm text-gray-600">Giao hàng trong 1 - 2 ngày làm việc</div>
            </div>
          </div>

        </label>

        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shipping"
              value="Chậm"
              checked={shippingMethod === "Chậm"}
              onChange={(e) => onShippingMethodChange(e.target.value)}
              className="text-orange-500"
            />
            <div>
              <div className="font-medium text-black">Giao hàng tiêu chuẩn </div>
              <div className="text-sm text-gray-600">Giao hàng trong 3 - 5 ngày làm việc</div>
            </div>
          </div>

        </label>
      </div>
    </div>
  );
}
