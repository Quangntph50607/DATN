import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ShippingMethodSectionProps {
  shippingMethod: string;
  onShippingMethodChange: (method: string) => void;
}

export default function PhuongThucVanChuyen({
  shippingMethod,
  onShippingMethodChange,
}: ShippingMethodSectionProps) {
  return (
    <Card className="p-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">🚚</span>
          <h2 className="text-lg font-semibold">Phương thức vận chuyển</h2>
        </div>

        <div className="space-y-3">
          <label
            className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors ${
              shippingMethod === "Nhanh"
                ? "ring-2 ring-orange-500 border-orange-400"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="Nhanh"
                checked={shippingMethod === "Nhanh"}
                onChange={(e) => onShippingMethodChange(e.target.value)}
                className="accent-orange-500"
              />
              <div>
                <div className="font-medium">Giao hàng nhanh</div>
                <div className="text-sm text-black/70">
                  Giao hàng trong 1 - 2 ngày làm việc
                </div>
              </div>
            </div>
          </label>

          <label
            className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors ${
              shippingMethod === "Chậm"
                ? "ring-2 ring-orange-500 border-orange-400"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="Chậm"
                checked={shippingMethod === "Chậm"}
                onChange={(e) => onShippingMethodChange(e.target.value)}
                className="accent-orange-500"
              />
              <div>
                <div className="font-medium">Giao hàng tiêu chuẩn</div>
                <div className="text-sm text-black/70">
                  Giao hàng trong 3 - 5 ngày làm việc
                </div>
              </div>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
