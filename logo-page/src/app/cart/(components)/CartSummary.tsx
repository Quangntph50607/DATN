"use client";
import React, { useState } from "react";
import { ShoppingCart, Gift } from "lucide-react";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartSummaryProps {
  selectedItems: { id: number; price: number; quantity: number }[];
  userId?: number;
  formatCurrency: (amount: number) => string;
  onCheckout: () => void;
}

export default function CartSummary({
  selectedItems,
  userId,
  formatCurrency,
  onCheckout,
}: CartSummaryProps) {
  const [selectedVoucher, setSelectedVoucher] =
    useState<PhieuGiamGiaResponse | null>(null);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const calculateDiscount = (voucher: PhieuGiamGiaResponse | null) => {
    if (!voucher || subtotal < voucher.giaTriToiThieu) return 0;
    if (voucher.loaiPhieuGiam === "theo_so_tien") {
      return Math.min(voucher.giaTriGiam, subtotal);
    }
    if (voucher.loaiPhieuGiam === "theo_phan_tram") {
      const discount = (subtotal * voucher.giaTriGiam) / 100;
      return Math.min(discount, voucher.giamToiDa || discount);
    }
    return 0;
  };

  const discount = calculateDiscount(selectedVoucher);
  const totalAfterDiscount = Math.max(0, subtotal - discount);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 p-5 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Tóm tắt đơn hàng
        </h2>
        <p className="text-gray-100 text-sm mt-1">
          Kiểm tra thông tin thanh toán
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Order Summary */}
        <div className="bg-yellow-100 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              Tạm tính ({selectedItems.length} sản phẩm):
            </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">Tổng cộng:</span>
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(totalAfterDiscount)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          disabled={selectedItems.length === 0}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Thanh toán ({selectedItems.length} sản phẩm)
        </Button>
      </div>
    </div>
  );
}
