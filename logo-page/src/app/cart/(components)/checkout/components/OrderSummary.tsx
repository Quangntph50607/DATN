import { CartItemType } from "@/components/types/cart";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
interface OrderItemsProps {
  checkoutItems: CartItemType[];
}
interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}
// Components
export default function OrderItems({ checkoutItems }: OrderItemsProps) {
  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {checkoutItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200"
        >
          <Image
            src={item.image || "/images/placeholder-product.png"}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg"
            width={100}
            height={100}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
              {item.name}
            </h4>
            <p className="text-sm text-gray-600">
              {formatCurrency(item.price)} x {item.quantity}
            </p>
          </div>
          <span className="font-semibold text-gray-800 text-sm">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OrderSummary({
  subtotal,
  discount,
  shippingFee,
  total,
}: OrderSummaryProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <div className="flex justify-between text-gray-600">
        <span>Tạm tính:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Phí vận chuyển:</span>
        <span>{formatCurrency(shippingFee)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-orange-600">Giảm giá:</span>
          <span className="font-semibold text-orange-600">
            -{formatCurrency(discount)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
        <span>Tổng cộng:</span>
        <span className="text-orange-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
