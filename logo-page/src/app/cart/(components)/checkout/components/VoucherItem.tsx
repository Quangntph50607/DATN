import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { useMemo } from "react";
import { Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { calculateDiscount, formatCurrency } from "./SanPhamCheckout";
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

// Constants
export const VOUCHER_MESSAGES = {
  EMPTY_CODE: "Vui lòng nhập mã giảm giá",
  NOT_FOUND: "Không tìm thấy mã giảm giá này",
  EXPIRED: "Mã giảm giá đã hết hạn",
  INACTIVE: "Mã giảm giá không khả dụng",
  MINIMUM_NOT_MET:
    "Đơn hàng phải đạt tối thiểu {amount} để sử dụng voucher này",
  SUCCESS: "Áp dụng mã giảm giá thành công",
  NO_VOUCHERS: "Không có voucher khả dụng",
} as const;
export function isVoucherExpired(voucher: PhieuGiamGiaResponse): boolean {
  const [year, month, day] = voucher.ngayKetThuc;
  const expireDate = new Date(year, month - 1, day);
  return expireDate < new Date();
}

export function VoucherItem({
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

export default function VoucherSection({
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
          <Button className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-300 underline font-medium flex items-center gap-1 bg-white shadow-2xl border-2 border-orange-300">
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
              size="sm"
              className="text-sm text-red-500 border-red-300 border hover:text-red-700 font-medium"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
