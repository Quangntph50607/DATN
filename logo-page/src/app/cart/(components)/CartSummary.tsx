import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";

interface CartSummaryProps {
  selectedItems: any[];
  discount: number;
  selectedVoucher: PhieuGiamGia | null;
  voucherInput: string;
  voucherMessage: string;
  onVoucherInputChange: (value: string) => void;
  onApplyVoucher: () => void;
  onShowVoucherModal: () => void;
  onCheckout: () => void;
  formatCurrency: (amount: number) => string;
}

export const CartSummary = ({
  selectedItems,
  discount,
  selectedVoucher,
  voucherInput,
  voucherMessage,
  onVoucherInputChange,
  onApplyVoucher,
  onShowVoucherModal,
  onCheckout,
  formatCurrency,
}: CartSummaryProps) => {
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalAfterDiscount = Math.max(0, subtotal - discount);

  return (
    <Card className="w-80 bg-white border-gray-200 shadow-sm">
      <CardHeader className="bg-white border-b border-gray-100">
        <CardTitle className="text-gray-900">Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 bg-white p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
            <span className="text-gray-900 font-medium">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {/* <div className="flex justify-between text-gray-700">
            <span>Phí vận chuyển:</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div> */}
          {discount >= 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-gray-200" />

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã giảm giá"
              value={voucherInput}
              onChange={(e) => onVoucherInputChange(e.target.value)}
              className="border border-gray-400 text-gray-900 placeholder:text-gray-500 focus:border-blue-500"
            />
            <Button variant="secondary" onClick={onApplyVoucher}>
              Áp dụng
            </Button>
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600 hover:text-blue-700"
            onClick={onShowVoucherModal}
          >
            Chọn voucher khả dụng
          </Button>
          {voucherMessage && (
            <p
              className={`text-sm ${
                voucherMessage.includes("thành công")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {voucherMessage}
            </p>
          )}
          {selectedVoucher && (
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800">
                Đã áp dụng: {selectedVoucher.tenPhieu}
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-gray-200" />

        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-900">Tổng cộng:</span>
          <span className="text-red-600">
            {formatCurrency(totalAfterDiscount)}
          </span>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={onCheckout}
          disabled={selectedItems.length === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Thanh toán ({selectedItems.length})
        </Button>
      </CardContent>
    </Card>
  );
};
