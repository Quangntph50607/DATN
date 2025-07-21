import React from "react";
import { ChiTietKhuyenMai } from "@/components/types/khuyenmai-type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateFlexible } from "./formatDateFlexible";
import {
  Calendar,
  Package,
  DollarSign,
  TrendingDown,
  Receipt,
  ShoppingCart,
} from "lucide-react";

interface Props {
  data: ChiTietKhuyenMai | null;
  isLoading: boolean;
}

export default function KhuyenMaiDetailModal({ data, isLoading }: Props) {
  console.log("KhuyenMaiDetailModal - data:", data);
  console.log("KhuyenMaiDetailModal - isLoading:", isLoading);
  console.log("KhuyenMaiDetailModal - data type:", typeof data);
  console.log(
    "KhuyenMaiDetailModal - data keys:",
    data ? Object.keys(data) : "null"
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có dữ liệu chi tiết</p>
        <p className="text-sm text-gray-400 mt-2">
          Có thể khuyến mãi chưa có lịch sử hoặc API chưa trả về dữ liệu
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  console.log("data:", data.sanPhamDaApDung);

  return (
    <div className="space-y-6">
      {/* Thông tin chính */}
      <Card className="bg-gray-200  text-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Thông tin khuyến mãi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-lg">
                Tên khuyến mãi: {data.tenKhuyenMai}
              </h3>
              <Badge variant="destructive" className="mt-2">
                Phần trăm giảm: {data.phanTramKhuyenMai}% giảm giá
              </Badge>
            </div>
            <div className="space-y-2 ">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-900">
                  {formatDateFlexible(data.ngayBatDau)}
                  {formatDateFlexible(data.ngayKetThuc)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê tổng quan */}
      <Card className="bg-gray-200 text-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Thống kê tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {data.soSanPhamApDung}
              </div>
              <div className="text-sm text-gray-600">Sản phẩm áp dụng</div>
            </div>

            <div className="text-center p-3 bg-green-200 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {data.tongSoLuongBan}
              </div>
              <div className="text-sm text-gray-600">Lượt bán</div>
            </div>

            <div className="text-center p-3 bg-orange-200 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.tongSoTienGiam)}
              </div>
              <div className="text-sm text-gray-600">Tổng tiền giảm</div>
            </div>

            <div className="text-center p-3 bg-purple-200 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {data.soHoaDon}
              </div>
              <div className="text-sm text-gray-600">Hóa đơn</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết doanh thu */}
      <Card className="bg-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <DollarSign className="w-5 h-5 " />
            Chi tiết doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-500 rounded">
              <span className="font-medium">Tổng tiền trước giảm:</span>
              <span className="font-bold text-white">
                {formatCurrency(data.tongTienTruocGiam)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500 rounded">
              <span className="font-medium">Tổng tiền giảm:</span>
              <span className="font-bold text-white">
                -{formatCurrency(data.tongSoTienGiam)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500 rounded">
              <span className="font-medium">Tổng tiền sau giảm:</span>
              <span className="font-bold  text-white">
                {formatCurrency(data.tongTienSauGiam)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách sản phẩm đã áp dụng */}
      {data.sanPhamDaApDung && data.sanPhamDaApDung.length > 0 && (
        <Card className="bg-gray-200 text-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sản phẩm đã áp dụng ({data.sanPhamDaApDung.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sanPhamDaApDung.map((sanPham, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border  border-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium">Mã: {sanPham[0]}</div>
                    <div className="text-sm text-gray-500">
                      Tên: {sanPham[1]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(sanPham[2])}
                    </div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(sanPham[3])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
