import {
  DollarSign,
  Package,
  Receipt,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChiTietKhuyenMai } from "@/components/types/khuyenmai-type";
import { formatDateFlexible } from "./formatDateFlexible";
import { cn } from "@/lib/utils";

interface Props {
  data: ChiTietKhuyenMai | null;
  isLoading: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

// Hàm xử lý màu trạng thái sản phẩm
const getTrangThaiColor = (trangThai: string) => {
  switch (trangThai) {
    case "Đang kinh doanh":
      return "text-green-600 bg-green-100";
    case "Ngừng kinh doanh":
      return "text-yellow-600 bg-yellow-100";
    case "Hết hàng":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function KhuyenMaiDetailModal({ data, isLoading }: Props) {
  if (isLoading)
    return <div className="text-sm text-gray-500">Đang tải...</div>;
  if (!data)
    return <div className="text-sm text-gray-500">Không có dữ liệu</div>;

  return (
    <div className="space-y-4 text-sm max-h-[80vh]  p-2 text-white">
      {/* THÔNG TIN CƠ BẢN */}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4" />
        <span className="font-semibold">Thông tin khuyến mãi</span>
      </div>
      <div className="text-base font-bold flex items-center gap-2">
        Tên Khuyến Mãi: {data.tenKhuyenMai} -{" "}
        <Badge variant="destructive">{data.phanTramKhuyenMai}%</Badge>
      </div>
      <div className="text-sm font-medium text-white space-y-1">
        <p>Ngày bắt đầu: {formatDateFlexible(data.ngayBatDau)}</p>
        <p>Ngày kết thúc: {formatDateFlexible(data.ngayKetThuc)}</p>
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
            label: "Sản phẩm",
            value: data.soSanPhamApDung,
            color: "bg-green-300",
          },
          {
            icon: ShoppingCart,
            label: "Lượt bán",
            value: data.tongSoLuongBan,
            color: "bg-red-300",
          },
          {
            icon: Receipt,
            label: "Hóa đơn",
            value: data.soHoaDon,
            color: "bg-amber-300",
          },
          {
            icon: DollarSign,
            label: "Tiền giảm",
            value: formatCurrency(data.tongSoTienGiam),
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
            <span>-{formatCurrency(data.tongSoTienGiam)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-green-600">
            <span>Sau giảm:</span>
            <span>{formatCurrency(data.tongTienSauGiam)}</span>
          </div>
        </div>
      </div>

      {/* SẢN PHẨM ĐÃ ÁP DỤNG */}
      {data.sanPhamDaApDung?.length > 0 && (
        <div>
          <div className="font-semibold flex items-center gap-2 text-sm mb-2">
            <TrendingDown className="w-4 h-4" />
            Sản phẩm áp dụng ({data.sanPhamDaApDung.length})
          </div>
          <div className="space-y-2  ">
            {data.sanPhamDaApDung.map(
              ([ma, ten, trangThai, giaGoc, giaSauGiam], i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-2 py-2 border border-gray-300 rounded bg-white text-black"
                >
                  <div>
                    <div className="font-medium text-lg">Tên SP : {ten}</div>
                    <div className="text-xs text-gray-800">Mã: {ma}</div>
                    <div
                      className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${getTrangThaiColor(
                        trangThai
                      )}`}
                    >
                      {trangThai}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="line-through text-xs text-gray-400">
                      {formatCurrency(giaGoc)}
                    </div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(giaSauGiam)}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
