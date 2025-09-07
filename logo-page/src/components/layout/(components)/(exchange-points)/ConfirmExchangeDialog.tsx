import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Coins, Loader2 } from "lucide-react";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";

interface ConfirmExchangeDialogProps {
  isOpen: boolean;
  voucher: PhieuGiamGia | null;
  currentPoints: number;
  isExchanging: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formatDate: (dateString: string) => string;
  getDiscountText: (voucher: PhieuGiamGia) => string;
}

export const ConfirmExchangeDialog: React.FC<ConfirmExchangeDialogProps> = ({
  isOpen,
  voucher,
  currentPoints,
  isExchanging,
  onClose,
  onConfirm,
  formatDate,
  getDiscountText,
}) => {
  if (!isOpen || !voucher) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Xác nhận đổi phiếu</h3>
              <p className="text-orange-100 text-sm">Bạn có chắc chắn muốn đổi phiếu này?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Thông tin phiếu */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-lg text-gray-800">{voucher.tenPhieu}</h4>
              <Badge className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Nổi bật
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã phiếu:</span>
                <span className="font-mono bg-white px-2 py-1 rounded text-gray-800">{voucher.maPhieu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giá trị:</span>
                <span className="font-bold text-orange-600">{getDiscountText(voucher)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đơn tối thiểu:</span>
                <span className="font-medium">{voucher.giaTriToiThieu.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hạn sử dụng:</span>
                <span className="font-medium">{formatDate(voucher.ngayKetThuc)}</span>
              </div>
            </div>
          </div>

          {/* Điểm cần trả */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Điểm cần trả</div>
                  <div className="text-2xl font-bold text-yellow-600">{voucher.diemDoi} điểm</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Điểm hiện tại</div>
                <div className="text-lg font-bold text-gray-800">{currentPoints}</div>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-medium"
              size="lg"
            >
              Hủy
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isExchanging}
              className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
              size="lg"
            >
              {isExchanging ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang đổi...
                </>
              ) : (
                <>
                  <Gift className="h-5 w-5 mr-2" />
                  Xác nhận đổi
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
