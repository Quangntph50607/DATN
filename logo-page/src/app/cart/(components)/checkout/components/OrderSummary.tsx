import React, { useState } from "react";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

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
  const [openAlert, setOpenAlert] = useState(false);

  return (
    <Card className="p-6 sticky top-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">🛒</span>
          <h2 className="text-lg font-semibold">Đơn hàng của bạn</h2>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 border-b border-gray-100"
            >
              <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0 border border-gray-200">
                {imageUrls[product.id] && (
                  <Image
                    src={imageUrls[product.id]!}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {product.name}
                </div>
                <div className="text-xs">SL: {product.quantity}</div>
              </div>
              <div className="text-sm font-medium">
                {(product.price * product.quantity).toLocaleString()}đ
              </div>
            </div>
          ))}
        </div>

        {/* Voucher section */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-3 text-black bg-white border-gray-300"
            onClick={onShowVoucherModal}
            type="button"
          >
            <span className="text-sm">
              {selectedVoucher
                ? `Voucher: ${selectedVoucher.tenPhieu}`
                : "Chọn voucher"}
            </span>
            <span className="text-orange-500">→</span>
          </Button>
        </div>

        {/* Tóm tắt giá */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{total.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Giảm giá</span>
            <span className="text-green-600">
              -
              {selectedVoucher
                ? discount < 1
                  ? (total * discount).toLocaleString()
                  : discount.toLocaleString()
                : 0}
              đ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Phí ship</span>
            <span>{shippingFee.toLocaleString()}đ</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span className="text-orange-500 text-lg">
                {totalAfterDiscount.toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-6 space-y-3">
          {orderError && (
            <div className="text-red-500 text-sm p-2 bg-white border border-red-200 rounded">
              {orderError}
            </div>
          )}

          <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoadingOrder}
                type="button"
              >
                {isLoadingOrder ? "Đang xử lý..." : "Đặt hàng ngay"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white text-black">
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận đặt hàng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn chắc chắn muốn đặt đơn hàng này chứ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white text-black border border-gray-300 hover:bg-gray-100">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={() => {
                    setOpenAlert(false);
                    onOrder();
                  }}
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            className="w-full border border-gray-300 text-black py-2 rounded-lg hover:bg-gray-100 transition-colors bg-white"
            onClick={onGoBack}
            type="button"
          >
            ← Quay lại giỏ hàng
          </Button>

          <div className="text-center">
            <span className="text-xs text-black/60">
              🔒 Thanh toán được bảo mật 100%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
