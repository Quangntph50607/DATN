"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Shield, Gift, AlertCircle } from "lucide-react";
import { CartItemType } from "@/components/types/cart";
import { Button } from "@/components/ui/button";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { useGetViPhieuGiamGiaTheoUser } from "@/hooks/useViPhieuGiamGia";

import OrderItems, { OrderSummary } from "./OrderSummary";
import VoucherSection, {
  isVoucherExpired,
  VOUCHER_MESSAGES,
} from "./VoucherItem";

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function calculateDiscount(
  subtotal: number,
  voucher: PhieuGiamGiaResponse | null
): number {
  if (!voucher || subtotal < voucher.giaTriToiThieu) return 0;

  if (voucher.loaiPhieuGiam === "theo_so_tien") {
    return Math.min(voucher.giaTriGiam, subtotal);
  }

  if (voucher.loaiPhieuGiam === "theo_phan_tram") {
    const discount = (subtotal * voucher.giaTriGiam) / 100;
    return Math.min(discount, voucher.giamToiDa || discount);
  }

  return 0;
}

// Types
interface VoucherValidationResult {
  isValid: boolean;
  message: string;
}

interface SanPhamCheckoutProps {
  readonly userId?: number;
  readonly shippingFee?: number;
  readonly onPlaceOrder?: () => void;
  readonly onDataChange?: (total: number, discount: number) => void;
  readonly onVoucherChange?: (voucher: PhieuGiamGiaResponse | null) => void;
}

export function SanPhamCheckout({
  userId,
  shippingFee = 0,
  onPlaceOrder,
  onDataChange,
  onVoucherChange,
}: SanPhamCheckoutProps) {
  const [checkoutItems, setCheckoutItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherInput, setVoucherInput] = useState("");
  const [selectedVoucher, setSelectedVoucher] =
    useState<PhieuGiamGiaResponse | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: vouchers = [], isLoading } = useGetViPhieuGiamGiaTheoUser(
    userId,
    "active"
  );

  // Load checkout items from localStorage
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
      setCheckoutItems(items);
    } catch (error) {
      console.error("Error loading checkout data:", error);
      setCheckoutItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculations with useMemo for performance
  const subtotal = useMemo(
    () =>
      checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );

  const discount = useMemo(
    () => calculateDiscount(subtotal, selectedVoucher),
    [subtotal, selectedVoucher]
  );

  const total = useMemo(() => {
    const sum = subtotal - discount + shippingFee;
    return Math.max(0, sum); // Ensure total is never negative
  }, [subtotal, discount, shippingFee]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(total, discount);
    }
  }, [total, discount, onDataChange]);

  // Voucher validation function
  const validateVoucher = useCallback(
    (voucherCode: string): VoucherValidationResult => {
      if (!voucherCode.trim()) {
        return { isValid: false, message: VOUCHER_MESSAGES.EMPTY_CODE };
      }

      const voucher = vouchers.find(
        (v) =>
          v.maPhieu.trim().toLowerCase() === voucherCode.trim().toLowerCase()
      );

      if (!voucher) {
        return { isValid: false, message: VOUCHER_MESSAGES.NOT_FOUND };
      }

      if (isVoucherExpired(voucher)) {
        return { isValid: false, message: VOUCHER_MESSAGES.EXPIRED };
      }

      if (voucher.trangThaiThucTe !== "active") {
        return { isValid: false, message: VOUCHER_MESSAGES.INACTIVE };
      }

      if (subtotal < voucher.giaTriToiThieu) {
        return {
          isValid: false,
          message: VOUCHER_MESSAGES.MINIMUM_NOT_MET.replace(
            "{amount}",
            formatCurrency(voucher.giaTriToiThieu)
          ),
        };
      }

      return { isValid: true, message: VOUCHER_MESSAGES.SUCCESS };
    },
    [vouchers, subtotal]
  );

  // Event handlers
  const handleApplyVoucher = useCallback(() => {
    const validation = validateVoucher(voucherInput);

    if (validation.isValid) {
      const voucher = vouchers.find(
        (v) =>
          v.maPhieu.trim().toLowerCase() === voucherInput.trim().toLowerCase()
      );
      setSelectedVoucher(voucher || null);

      if (onVoucherChange) {
        onVoucherChange(voucher || null);
      }
    }

    setVoucherMessage(validation.message);
  }, [voucherInput, validateVoucher, vouchers, onVoucherChange]);

  const handleSelectVoucher = useCallback(
    (voucher: PhieuGiamGiaResponse) => {
      setVoucherInput(voucher.maPhieu);
      setSelectedVoucher(voucher); // 👈 cập nhật local luôn
      setVoucherMessage("");
      setDialogOpen(false);

      if (onVoucherChange) {
        onVoucherChange(voucher);
      }
    },
    [onVoucherChange]
  );

  const clearVoucher = useCallback(() => {
    setSelectedVoucher(null);
    setVoucherInput("");
    setVoucherMessage("");
    if (onVoucherChange) {
      onVoucherChange(null);
    }
  }, [onVoucherChange]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Empty cart state
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-4">
            Không có sản phẩm nào để thanh toán
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-orange-50">
      <div className="mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-500" />
            Chi tiết đơn hàng
          </h2>

          <OrderItems checkoutItems={checkoutItems} />
          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            shippingFee={shippingFee}
            total={total}
          />
          <VoucherSection
            voucherInput={voucherInput}
            setVoucherInput={setVoucherInput}
            handleApplyVoucher={handleApplyVoucher}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            vouchers={vouchers}
            isLoading={isLoading}
            handleSelectVoucher={handleSelectVoucher}
            voucherMessage={voucherMessage}
            selectedVoucher={selectedVoucher}
            clearVoucher={clearVoucher}
            subtotal={subtotal}
          />
          <Button
            onClick={onPlaceOrder}
            disabled={checkoutItems.length === 0}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-400"
          >
            Đặt hàng ({formatCurrency(total)})
          </Button>
        </div>
      </div>
    </div>
  );
}
