"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Shield, Gift, AlertCircle } from "lucide-react";
import { CartItemType } from "@/components/types/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { useGetViPhieuGiamGiaTheoUser } from "@/hooks/useViPhieuGiamGia";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";

// Constants
const VOUCHER_MESSAGES = {
  EMPTY_CODE: "Vui lòng nhập mã giảm giá",
  NOT_FOUND: "Không tìm thấy mã giảm giá này",
  EXPIRED: "Mã giảm giá đã hết hạn",
  INACTIVE: "Mã giảm giá không khả dụng",
  MINIMUM_NOT_MET:
    "Đơn hàng phải đạt tối thiểu {amount} để sử dụng voucher này",
  SUCCESS: "Áp dụng mã giảm giá thành công",
  NO_VOUCHERS: "Không có voucher khả dụng",
} as const;

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function calculateDiscount(
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

function isVoucherExpired(voucher: PhieuGiamGiaResponse): boolean {
  const [year, month, day] = voucher.ngayKetThuc;
  const expireDate = new Date(year, month - 1, day);
  return expireDate < new Date();
}

// Types
interface VoucherValidationResult {
  isValid: boolean;
  message: string;
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

interface VoucherSectionProps {
  voucherInput: string;
  setVoucherInput: (value: string) => void;
  handleApplyVoucher: () => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  vouchers: PhieuGiamGiaResponse[];
  isLoading: boolean;
  handleSelectVoucher: (voucher: PhieuGiamGiaResponse) => void;
  voucherMessage: string | null;
  selectedVoucher: PhieuGiamGiaResponse | null;
  clearVoucher: () => void;
  subtotal: number;
}

interface SanPhamCheckoutProps {
  readonly userId?: number;
  readonly shippingFee?: number;
  readonly onPlaceOrder?: () => void;
}

// Components
function OrderItems({ checkoutItems }: OrderItemsProps) {
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
          <img
            src={item.image || "/images/placeholder-product.png"}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg"
            // onError={(e) => {
            //   e.currentTarget.src = "/images/placeholder-product.png";
            // }}
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

function OrderSummary({
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

function VoucherItem({
  voucher,
  onClick,
  isExpired,
}: {
  voucher: PhieuGiamGiaResponse;
  onClick: () => void;
  isExpired: boolean;
}) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isExpired
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
      }`}
      onClick={isExpired ? undefined : onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-800">{voucher.tenPhieu}</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isExpired
              ? "bg-gray-100 text-gray-500"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {voucher.maPhieu}
        </span>
      </div>
      <p
        className={`text-sm mt-2 ${
          isExpired ? "text-gray-400" : "text-orange-600"
        }`}
      >
        {voucher.loaiPhieuGiam === "theo_so_tien"
          ? `Giảm ${formatCurrency(voucher.giaTriGiam)}`
          : `Giảm ${voucher.giaTriGiam}%`}
      </p>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span className={isExpired ? "text-red-500" : ""}>
          HSD: {formatDateFlexible(voucher.ngayKetThuc)}
        </span>
        <span>Tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}</span>
      </div>
      {isExpired && (
        <div className="mt-2">
          <span className="text-xs text-red-500 font-medium">Đã hết hạn</span>
        </div>
      )}
    </div>
  );
}

function VoucherSection({
  voucherInput,
  setVoucherInput,
  handleApplyVoucher,
  dialogOpen,
  setDialogOpen,
  vouchers,
  isLoading,
  handleSelectVoucher,
  voucherMessage,
  selectedVoucher,
  clearVoucher,
  subtotal,
}: VoucherSectionProps) {
  const availableVouchers = useMemo(
    () =>
      vouchers.filter(
        (v) => !isVoucherExpired(v) && v.trangThaiThucTe === "active"
      ),
    [vouchers]
  );

  const expiredVouchers = useMemo(
    () =>
      vouchers.filter(
        (v) => isVoucherExpired(v) || v.trangThaiThucTe !== "active"
      ),
    [vouchers]
  );

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Gift className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
          <p className="text-sm text-gray-500">Nhập hoặc chọn voucher</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nhập mã giảm giá"
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
          className="flex-1 border-gray-300 text-black focus:border-orange-500 focus:ring-orange-500"
          onKeyPress={(e) => e.key === "Enter" && handleApplyVoucher()}
        />
        <Button
          onClick={handleApplyVoucher}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={!voucherInput.trim()}
        >
          Áp dụng
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-300 underline font-medium flex items-center gap-1 bg-none">
            <Gift className="h-4 w-4" />
            Xem voucher của tôi ({availableVouchers.length} khả dụng)
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-lg max-w-md bg-white p-0 overflow-hidden border border-gray-200">
          <DialogHeader className="border-b border-gray-200 px-6 py-4 bg-orange-50">
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Gift className="h-5 w-5" />
              Voucher của tôi ({vouchers?.length || 0})
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[80vh]">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : vouchers?.length ? (
              <div className="space-y-3 px-6 pb-6">
                {availableVouchers.length > 0 && (
                  <>
                    <h5 className="font-medium text-gray-700 mt-4 mb-2">
                      Khả dụng
                    </h5>
                    {availableVouchers.map((voucher) => (
                      <VoucherItem
                        key={voucher.id}
                        voucher={voucher}
                        onClick={() => handleSelectVoucher(voucher)}
                        isExpired={false}
                      />
                    ))}
                  </>
                )}
                {expiredVouchers.length > 0 && (
                  <>
                    <h5 className="font-medium text-gray-500 mt-6 mb-2">
                      Đã hết hạn
                    </h5>
                    {expiredVouchers.map((voucher) => (
                      <VoucherItem
                        key={voucher.id}
                        voucher={voucher}
                        onClick={() => {}}
                        isExpired={true}
                      />
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 px-6">
                <p>{VOUCHER_MESSAGES.NO_VOUCHERS}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {voucherMessage && (
        <div
          className={`p-3 rounded-lg ${
            voucherMessage.includes("thành công")
              ? "bg-orange-50 text-orange-700 border border-orange-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <p className="text-sm font-medium">{voucherMessage}</p>
        </div>
      )}

      {selectedVoucher && (
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">
                {selectedVoucher.tenPhieu}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                <span className="font-medium">Tiết kiệm:</span>
                {" " +
                  formatCurrency(calculateDiscount(subtotal, selectedVoucher))}
              </p>
            </div>
            <Button
              onClick={clearVoucher}
              variant="ghost"
              size="sm"
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SanPhamCheckout({
  userId,
  shippingFee = 0,
  onPlaceOrder,
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
    }

    setVoucherMessage(validation.message);
  }, [voucherInput, validateVoucher, vouchers]);

  const handleSelectVoucher = useCallback((voucher: PhieuGiamGiaResponse) => {
    setVoucherInput(voucher.maPhieu);
    setSelectedVoucher(null);
    setVoucherMessage("");
    setDialogOpen(false);
  }, []);

  const clearVoucher = useCallback(() => {
    setSelectedVoucher(null);
    setVoucherInput("");
    setVoucherMessage("");
  }, []);

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
