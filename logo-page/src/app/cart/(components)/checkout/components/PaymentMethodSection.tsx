import React from 'react';

interface PaymentMethodSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export default function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-500">💳</span>
        <h2 className="text-lg font-semibold text-black">Phương thức thanh toán</h2>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="payment"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="text-orange-500"
          />
          <div className="flex-1">
            <div className="font-medium text-black">Thanh toán khi nhận hàng (COD)</div>
            <div className="text-sm text-gray-600">Bạn chỉ phải thanh toán khi nhận được hàng</div>
          </div>
          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">Miễn phí</span>
        </label>

        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="payment"
            value="Chuyển khoản"
            checked={paymentMethod === "Chuyển khoản"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="text-orange-500"
          />
          <div className="flex-1">
            <div className="font-medium text-black">Chuyển khoản ngân hàng</div>
            <div className="text-sm text-gray-600">Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi</div>
          </div>
          <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">ATM</span>
        </label>
      </div>
    </div>
  );
}