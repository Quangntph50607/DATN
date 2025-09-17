import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  Coins,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";

interface VoucherCardProps {
  voucher: PhieuGiamGia;
  affordable: boolean;
  onVoucherClick: (voucher: PhieuGiamGia) => void;
  formatDate: (dateString: string) => string;
  getDiscountText: (voucher: PhieuGiamGia) => string;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  affordable,
  onVoucherClick,
  formatDate,
  getDiscountText,
}) => {
  // Kiểm tra nếu là voucher PGG để áp dụng style đặc biệt
  const isPGGVoucher = voucher.tenPhieu === "PGG" || (voucher.maPhieu && voucher.maPhieu.includes("PGG"));
  
  return (
    <Card
      className={`relative transition-all duration-300 cursor-pointer border-0 shadow-md ${
        isPGGVoucher 
          ? "bg-gradient-to-br from-orange-40 via-amber-40 to-yellow-50 border-2 border-orange-200 hover:shadow-2xl hover:scale-105 hover:from-orange-80 hover:via-amber-80 hover:to-yellow-80 hover:border-orange-280"
          : "bg-white hover:shadow-xl hover:scale-102 hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50"
      } ${!affordable ? "opacity-70 bg-gray-50" : ""}`}
      onClick={() => {
        if (affordable) {
          onVoucherClick(voucher);
        }
      }}
    >
      <CardContent className="p-6">
        {/* Badge nổi bật */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-lg border-0">
            <Star className="h-3 w-3 mr-1" />
            Nổi bật
          </Badge>
        </div>

        {/* Thông tin phiếu */}
        <div className="mb-4">
          <h3 className={`font-bold text-xl mb-2 ${
            isPGGVoucher ? "text-emerald-800" : "text-gray-800"
          }`}>
            {voucher.tenPhieu}
          </h3>
          <p className={`text-sm mb-2 ${
            isPGGVoucher ? "text-emerald-700" : "text-gray-600"
          }`}>
            Mã: <span className={`font-mono px-2 py-1 rounded ${
              isPGGVoucher 
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                : "bg-gray-100 text-gray-800"
            }`}>{voucher.maPhieu}</span>
          </p>
        </div>

        {/* Giá trị giảm */}
        <div className="mb-4">
          <div className={`text-3xl font-bold ${
            isPGGVoucher 
              ? "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          }`}>
            {getDiscountText(voucher)}
          </div>
          {voucher.giamToiDa && (
            <div className={`text-sm font-medium ${
              isPGGVoucher ? "text-emerald-700" : "text-gray-600"
            }`}>
              Tối đa: {voucher.giamToiDa.toLocaleString()}₫
            </div>
          )}
        </div>

        {/* Điều kiện sử dụng */}
        <div className="mb-4 space-y-2">
          <div className={`text-sm flex items-center gap-2 font-medium ${
            isPGGVoucher ? "text-emerald-700" : "text-gray-700"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPGGVoucher 
                ? "bg-gradient-to-r from-emerald-400 to-green-500" 
                : "bg-gradient-to-r from-blue-400 to-blue-600"
            }`}></div>
            Đơn tối thiểu: {voucher.giaTriToiThieu.toLocaleString()}₫
          </div>
          <div className={`text-sm flex items-center gap-2 font-medium ${
            isPGGVoucher ? "text-emerald-600" : "text-gray-700"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPGGVoucher 
                ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                : "bg-gradient-to-r from-emerald-400 to-emerald-600"
            }`}></div>
            Còn lại: {voucher.soLuong} phiếu
          </div>
        </div>

        {/* Thời hạn */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Clock className={`h-4 w-4 ${
            isPGGVoucher ? "text-emerald-500" : "text-blue-500"
          }`} />
          <span className={`font-medium ${
            isPGGVoucher ? "text-emerald-700" : "text-gray-600"
          }`}>HSD: {formatDate(voucher.ngayKetThuc)}</span>
          <div className="ml-auto">
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
              isPGGVoucher 
                ? "bg-gradient-to-r from-emerald-200 to-green-200 text-emerald-800 border border-emerald-300"
                : "bg-green-100 text-green-700"
            }`}>
              Còn hạn
            </div>
          </div>
        </div>

        {/* Điểm cần thiết */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-full ${
              isPGGVoucher 
                ? "bg-gradient-to-r from-orange-400 to-amber-500"
                : "bg-gradient-to-r from-yellow-400 to-amber-500"
            }`}>
              <Coins className="h-4 w-4 text-white" />
            </div>
            <span className={`font-bold text-lg ${
              isPGGVoucher 
                ? "bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent"
            }`}>
              {voucher.diemDoi} điểm
            </span>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            {affordable ? (
              <div className="p-1 rounded-full bg-emerald-100">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            ) : (
              <div className="p-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full">
                <XCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <span className={`text-sm font-bold ${
              affordable 
                ? (isPGGVoucher ? "text-emerald-700" : "text-emerald-600")
                : "text-red-600"
            }`}>
              {affordable ? "Có thể đổi" : "Không đủ điểm"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
