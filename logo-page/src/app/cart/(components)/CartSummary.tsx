"use client";
import React, { useState } from "react";
import { ShoppingCart, Gift } from "lucide-react";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { useGetViPhieuGiamGiaTheoUser } from "@/hooks/useViPhieuGiamGia";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { Input } from "@/components/ui/input";
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
  // const [voucherInput, setVoucherInput] = useState("");
  const [selectedVoucher, setSelectedVoucher] =
    useState<PhieuGiamGiaResponse | null>(null);
  // const [voucherMessage, setVoucherMessage] = useState("");
  // const [dialogOpen, setDialogOpen] = useState(false);

  // const { data: vouchers, isLoading } = useGetViPhieuGiamGiaTheoUser(
  //   userId,
  //   "active"
  // );

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

  // const handleApplyVoucher = () => {
  //   if (!voucherInput.trim()) {
  //     setVoucherMessage("Vui lòng nhập mã giảm giá");
  //     return;
  //   }
  //   const voucher = vouchers?.find(
  //     (v) =>
  //       v.maPhieu.trim().toLowerCase() === voucherInput.trim().toLowerCase()
  //   );

  //   if (!voucher) {
  //     setVoucherMessage("Không tìm thấy mã giảm giá này");
  //     return;
  //   }

  //   const [year, month, day] = voucher.ngayKetThuc;
  //   const expireDate = new Date(year, month - 1, day);
  //   const currentDate = new Date();

  //   if (expireDate < currentDate) {
  //     setVoucherMessage("Mã giảm giá đã hết hạn");
  //     return;
  //   }

  //   if (voucher.trangThaiThucTe !== "active") {
  //     setVoucherMessage("Mã giảm giá không khả dụng");
  //     return;
  //   }

  //   if (subtotal < voucher.giaTriToiThieu) {
  //     setVoucherMessage(
  //       `Đơn hàng phải đạt tối thiểu ${formatCurrency(
  //         voucher.giaTriToiThieu
  //       )} để sử dụng voucher này`
  //     );
  //     return;
  //   }

  //   setSelectedVoucher(voucher);
  //   setVoucherMessage("Áp dụng mã giảm giá thành công");
  // };

  // const handleSelectVoucher = (voucher: PhieuGiamGiaResponse) => {
  //   setVoucherInput(voucher.maPhieu);
  //   setSelectedVoucher(null);
  //   setVoucherMessage("");
  //   setDialogOpen(false);
  // };

  // const clearVoucher = () => {
  //   setSelectedVoucher(null);
  //   setVoucherInput("");
  //   setVoucherMessage("");
  // };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Tóm tắt đơn hàng
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          Kiểm tra thông tin thanh toán
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              Tạm tính ({selectedItems.length} sản phẩm):
            </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-emerald-600">Giảm giá:</span>
              <span className="font-semibold text-emerald-600">
                -{formatCurrency(discount)}
              </span>
            </div>
          )} */}
        </div>

        {/* <hr className="border-gray-200" /> */}

        {/* Voucher Section */}
        {/* <div className="space-y-4"> */}
        {/* <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Gift className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
            <p className="text-sm text-gray-500">Nhập hoặc chọn voucher</p>
          </div>
        </div> */}

        {/* <div className="flex gap-2">
          <Input
            placeholder="Nhập mã giảm giá"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            className="flex-1 border-gray-300 text-black   focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            onClick={handleApplyVoucher}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Áp dụng
          </Button>
        </div> */}
        {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Xem voucher của tôi
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-lg max-w-md bg-white p-0 overflow-hidden">
            <DialogHeader className="border-b border-gray-200 px-6 py-4 bg-indigo-300">
              <DialogTitle className="flex items-center gap-2  text-indigo-600">
                <Gift className="h-5 w-5" />
                Voucher khả dụng ({vouchers?.length || 0})
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[80vh]">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                </div>
              ) : vouchers?.length ? (
                <div className="space-y-3 px-6 pb-6">
                  {vouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="p-4 border border-gray-200 rounded-lg  hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectVoucher(voucher)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">
                          {voucher.tenPhieu}
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                          {voucher.maPhieu}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600 mt-2">
                        {voucher.loaiPhieuGiam === "theo_so_tien"
                          ? `Giảm ${formatCurrency(voucher.giaTriGiam)}`
                          : `Giảm ${voucher.giaTriGiam}%`}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>
                          HSD: {formatDateFlexible(voucher.ngayKetThuc)}
                        </span>
                        <span>
                          Tối thiểu: {formatCurrency(voucher.giaTriToiThieu)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 px-6">
                  <p>Không có voucher khả dụng</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog> */}
        {/* Messages */}
        {/* <div className="space-y-3">
          {voucherMessage && (
            <div
              className={`p-3 rounded-lg ${
                voucherMessage.includes("thành công")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <p className="text-sm font-medium">
                {voucherMessage.includes("thành công") ? (
                  <span className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    {voucherMessage}
                  </span>
                ) : (
                  voucherMessage
                )}
              </p>
            </div>
          )}

          {selectedVoucher && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedVoucher.tenPhieu}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    <span className="font-medium">Tiết kiệm:</span>{" "}
                    {formatCurrency(calculateDiscount(selectedVoucher))}
                  </p>
                </div>
                <Button
                  onClick={clearVoucher}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}
        </div> */}
        {/* </div> */}

        <hr className="border-gray-200" />

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">Tổng cộng:</span>
            <span className="text-xl font-bold text-indigo-600">
              {formatCurrency(totalAfterDiscount)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          disabled={selectedItems.length === 0}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Thanh toán ({selectedItems.length} sản phẩm)
        </Button>
      </div>
    </div>
  );
}
