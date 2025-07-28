import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface PaymentMethodSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export default function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSectionProps) {
  return (
    <Card className="p-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">💳</span>
          <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="payment-cod"
            className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors ${paymentMethod === "COD" ? "ring-2 ring-orange-500 border-orange-400" : ""
              }`}
          >
            <input
              type="radio"
              name="payment"
              id="payment-cod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="accent-orange-500"
            />
            <div className="flex-1">
              <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
              <div className="text-sm text-black/70">Bạn chỉ phải thanh toán khi nhận được hàng</div>
            </div>
            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">Miễn phí</span>
          </label>

          <label
            htmlFor="payment-chuyenkhoan"
            className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors ${paymentMethod === "Chuyển khoản" ? "ring-2 ring-orange-500 border-orange-400" : ""
              }`}
          >
            <input
              type="radio"
              name="payment"
              id="payment-chuyenkhoan"
              value="Chuyển khoản"
              checked={paymentMethod === "Chuyển khoản"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="accent-orange-500"
            />
            <div className="flex-1">
              <div className="font-medium">Chuyển khoản ngân hàng</div>
              <div className="text-sm text-black/70">
                Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">ATM</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}