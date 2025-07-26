import React from "react";
import {
  Package,
  DollarSign,
  Receipt,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChitietPhieuGiamGia } from "@/components/types/phieugiam.type";
import { cn } from "@/lib/utils";

interface Props {
  data: ChitietPhieuGiamGia | null;
  isLoading: boolean;
}
type StatusInfo = {
  label: string;
  colorClass: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const convertStatus = (status: string): StatusInfo => {
  switch (status) {
    case "active":
      return {
        label: "Đang hoạt động",
        colorClass: "text-green-600 bg-green-100",
      };
    case "inactive":
      return {
        label: "Chưa bắt đầu",
        colorClass: "text-yellow-600 bg-yellow-100",
      };

    case "expired":
      return {
        label: "Đã hết hạn",
        colorClass: "text-red-600 bg-red-100",
      };

    default:
      return {
        label: "Không xác định",
        colorClass: "text-gray-600 bg-gray-100",
      };
  }
};

export default function PhieuGiamGiaModal({ data, isLoading }: Props) {
  const { label, colorClass } = convertStatus(data?.trangThai ?? "");
  if (isLoading)
    return <div className="text-sm text-gray-500">Đang tải...</div>;
  if (!data)
    return <div className="text-sm text-gray-500">Không có dữ liệu</div>;

  return (
    <div className="space-y-4 text-sm max-h-[80vh] p-2 text-white">
      {/* THÔNG TIN CƠ BẢN */}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4" />
        <span className="font-semibold">Thông tin phiếu giảm giá</span>
      </div>
      <div className="text-base font-bold flex items-center gap-2">
        Tên Phiếu: {data.tenPhieu}
        <p className="gap-2">
          - Giá trị giảm
          <Badge variant="destructive"> {data.giaTriGiam}</Badge>
        </p>
      </div>
      <div className="text-sm font-medium space-y-1">
        <p>Mã phiếu: {data.maPhieu}</p>
        <p>
          Trạng thái:
          <Badge className={`ml-1 ${colorClass}`} variant="outline">
            {label}
          </Badge>
        </p>
      </div>

      {/* THỐNG KÊ */}
      <div className="font-semibold flex items-center gap-2 text-sm mb-2">
        <TrendingDown className="w-5 h-5" />
        Thống kê tổng quan
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          {
            icon: Package,
            label: "Số lượng phiếu",
            value: data.soLuongPhieu,
            color: "bg-green-300",
          },
          {
            icon: ShoppingCart,
            label: "Số lượt sử dụng ",
            value: data.soLuotSuDung,
            color: "bg-red-300",
          },
          {
            icon: Receipt,
            label: "Số người sử dụng",
            value: data.soNguoiSuDung,
            color: "bg-amber-300",
          },
          {
            icon: DollarSign,
            label: "Tiền giảm",
            value: formatCurrency(data.tongTienGiam),
            color: "bg-white",
          },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className={cn("p-2 rounded text-xs", color)}>
            <Icon className="w-4 h-4 mx-auto text-black mb-1" />
            <div className="font-bold text-black text-[13px]">{value}</div>
            <div className="text-black">{label}</div>
          </div>
        ))}
      </div>

      {/* DOANH THU */}
      <div className="space-y-1">
        <div className="font-semibold flex items-center gap-2 text-sm mb-2">
          <DollarSign className="w-4 h-4" />
          Chi tiết doanh thu
        </div>
        <div className="bg-gray-100 text-black p-2 rounded">
          <div className="flex justify-between text-sm font-medium">
            <span>Trước giảm:</span>
            <span>{formatCurrency(data.tongTienTruocGiam)}</span>
          </div>
          <div className="flex justify-between text-sm text-red-600">
            <span>Tiền giảm:</span>
            <span>-{formatCurrency(data.tongTienGiam)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-green-600">
            <span>Sau giảm:</span>
            <span>{formatCurrency(data.tongTienBanDuoc)}</span>
          </div>
        </div>
      </div>

      {/* NGƯỜI DÙNG ĐÃ DÙNG */}
      {data.userDungPGG?.length > 0 && (
        <div>
          <div className="font-semibold flex items-center gap-2 text-sm mb-2">
            <Receipt className="w-4 h-4" />
            Người dùng đã sử dụng ({data.userDungPGG.length})
          </div>
          <div className="space-y-2">
            {data.userDungPGG.map(([id, hoTen, email, soLan]) => (
              <div
                key={id}
                className="flex justify-between items-center px-2 py-2 border border-gray-300 rounded bg-white text-black"
              >
                <div>
                  <div className="font-medium text-base">
                    Người dùng: {hoTen}
                  </div>
                  <div className="text-xs text-gray-700">Email: {email}</div>
                </div>
                <div className="text-right text-sm font-bold text-blue-600">
                  {soLan} lần
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
