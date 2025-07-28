import React from 'react';
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";

interface OrderSummaryProps {
  products: any[];
  imageUrls: Record<number, string | null>;
  total: number;
  discount: number;
  shippingFee: number;
  totalAfterDiscount: number;
  selectedVoucher: PhieuGiamGia | null;
  onShowVoucherModal: () => void;
  onOrder: () => void;
  isLoadingOrder: boolean;
  orderError: string;
  onGoBack: () => void;
}

export default function OrderSummary({
  products,
  imageUrls,
  total,
  discount,
  shippingFee,
  totalAfterDiscount,
  selectedVoucher,
  onShowVoucherModal,
  onOrder,
  isLoadingOrder,
  orderError,
  onGoBack,
}: OrderSummaryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-500">🛒</span>
        <h2 className="text-lg font-semibold text-black">Đơn hàng của bạn</h2>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 p-2 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {imageUrls[product.id] && (
                <img
                  src={imageUrls[product.id]!}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black truncate">{product.name}</div>
              <div className="text-xs text-gray-600">SL: {product.quantity}</div>
            </div>
            <div className="text-sm font-medium text-black">
              {(product.price * product.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}
      </div>

      {/* Voucher section */}
      <div className="mb-4">
        <button
          onClick={onShowVoucherModal}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm">
            {selectedVoucher ? `Voucher: ${selectedVoucher.tenPhieu}` : "Chọn voucher"}
          </span>
          <span className="text-orange-500">→</span>
        </button>
      </div>

      {/* Tóm tắt giá */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-black">Tạm tính</span>
          <span className="text-black">{total.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black">Giảm giá</span>
          <span className="text-green-600">
            -{selectedVoucher
              ? discount < 1
                ? (total * discount).toLocaleString()
                : discount.toLocaleString()
              : 0}đ
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black">Phí ship</span>
          <span className="text-black">{shippingFee.toLocaleString()}đ</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-bold">
            <span className="text-black">Tổng cộng</span>
            <span className="text-orange-500 text-lg">{totalAfterDiscount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-6 space-y-3">
        {orderError && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{orderError}</div>
        )}

        <button
          onClick={onOrder}
          disabled={isLoadingOrder}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingOrder ? "Đang xử lý..." : "Đặt hàng ngay"}
        </button>

        <button
          onClick={onGoBack}
          className="w-full border border-gray-300 text-black py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Quay lại giỏ hàng
        </button>

        <div className="text-center">
          <span className="text-xs text-gray-500">🔒 Thanh toán được bảo mật 100%</span>
        </div>
      </div>
    </div>
  );
}