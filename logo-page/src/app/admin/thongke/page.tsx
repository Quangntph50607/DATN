"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  useDoanhThuTheoDanhMuc,
  useDoanhThuTheoPTTT,
  useDoanhThuTheoXuatXu,
  useKhuyenMaiHieuQua,
  useLyDoHoan,
  useThongKeTheoNgay,
  useTiLeHoan,
  useTopKhachHang,
  useTopSanPhamBanChay,
} from "@/hooks/useThongKe";
import {
  Calendar,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Gift,
  RotateCcw,
  DollarSign,
  TrendingDown,
  Star,
  CreditCard,
  LucideIcon,
  BarChart3,
} from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import StatCard from "./StatCard";
import SimpleChart from "./SimpleChart";
import DataTable from "./DataTable";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-picker";

interface SimpleBarChartProps {
  title: string;
  data: Record<string, number> | null | undefined;
  isLoading?: boolean;
  icon: LucideIcon;
}

export default function ThongKePage() {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)
  );
  const [endDate, setEndDate] = useState<Date | null>(today);

  // format yyyy-MM-dd để truyền vào hooks API
  const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : "";

  // Gọi các hook
  const doanhThuNgay = useThongKeTheoNgay(startDateStr, endDateStr);
  const doanhThuPTTT = useDoanhThuTheoPTTT(startDateStr, endDateStr);
  const doanhThuDanhMuc = useDoanhThuTheoDanhMuc(startDateStr, endDateStr);
  const doanhThuXuatXu = useDoanhThuTheoXuatXu(startDateStr, endDateStr);
  const khuyenMaiHieuQua = useKhuyenMaiHieuQua(startDateStr, endDateStr);
  const topSanPham = useTopSanPhamBanChay(startDateStr, endDateStr);
  const topKhachHang = useTopKhachHang(startDateStr, endDateStr);
  const tiLeHoan = useTiLeHoan(startDateStr, endDateStr);
  const lyDoHoan = useLyDoHoan(startDateStr, endDateStr);

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  function SimpleBarChart({
    title,
    data,
    isLoading,
    icon: Icon,
  }: SimpleBarChartProps) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isLoading || !data || !Object.keys(data).length ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(data).map(([key, value], index) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700 text-sm">
                    {key}
                  </span>
                </div>
                <span className="text-gray-900 font-semibold text-sm">
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-brtext-card-foreground  gap-6 rounded-xl border p-4 bg-gray-800 shadow-md ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Thống Kê LEGO MyKingDomStore
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dashboard tổng quan về hoạt động kinh doanh và phân tích dữ liệu
              chi tiết
            </p>
          </div>
        </div>

        {/* Form nhập liệu */}
        <div className="mb-10">
          <div className="bg-blue-400 rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-50">
                  Tùy chọn thống kê
                </h2>
                <p className="text-sm text-gray-100 mt-1">
                  Chọn khoảng thời gian để xem báo cáo
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="block text-sm font-semibold text-gray-800">
                  Ngày bắt đầu
                </Label>
                <div className="relative">
                  <DateTimePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Chọn ngày bắt đầu"
                    mode="date"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="block text-sm font-semibold text-gray-800">
                  Ngày kết thúc
                </Label>
                <div className="relative">
                  <DateTimePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Chọn ngày kết thúc"
                    mode="date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Tổng Doanh Thu"
            value={
              doanhThuNgay.data ? formatCurrency(doanhThuNgay.data) : "0 ₫"
            }
            icon={DollarSign}
            color="green"
            isLoading={doanhThuNgay.isLoading}
          />
          <StatCard
            title="Tỉ Lệ Hoàn Hàng"
            value={tiLeHoan.data?.toString() || "0"}
            icon={RotateCcw}
            color="red"
            suffix="%"
            isLoading={tiLeHoan.isLoading}
          />
          <StatCard
            title="Sản Phẩm Bán Chạy"
            value={topSanPham.data?.length.toString() || "0"}
            icon={TrendingUp}
            color="blue"
            isLoading={topSanPham.isLoading}
          />
        </div>

        {/* Charts Section - Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <SimpleBarChart
            title="Doanh Thu Theo Phương Thức Thanh Toán"
            data={doanhThuPTTT.data}
            isLoading={doanhThuPTTT.isLoading}
            icon={CreditCard}
          />
          <SimpleBarChart
            title="Doanh Thu Theo Danh Mục"
            data={doanhThuDanhMuc.data}
            isLoading={doanhThuDanhMuc.isLoading}
            icon={Package}
          />
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <SimpleBarChart
            title="Doanh Thu Theo Xuất Xứ"
            data={doanhThuXuatXu.data}
            isLoading={doanhThuXuatXu.isLoading}
            icon={ShoppingBag}
          />

          {/* Lý do hoàn hàng */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Lý Do Hoàn Hàng
              </h3>
            </div>
            {lyDoHoan.isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="h-16 bg-gray-100 rounded-lg animate-pulse"
                    ></div>
                  ))}
              </div>
            ) : lyDoHoan.data && lyDoHoan.data.length > 0 ? (
              <div className="space-y-4">
                {lyDoHoan.data.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-l-4 border-red-400 hover:shadow-sm transition-shadow duration-150"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 block">
                        {item.lyDo || `Lý do ${idx + 1}`}
                      </span>
                      <span className="gap-1 flex text-sm text-gray-500 mt-1">
                        Số lần hoàn:
                        <span className="font-medium">{item.soLan}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 text-lg">
                        {formatCurrency(item.tongTien)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có dữ liệu hoàn hàng</p>
              </div>
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <DataTable
            title="Top 10 Sản Phẩm Bán Chạy"
            headers={["STT", "Tên Sản Phẩm", "Số Lượng", "Doanh Thu"]}
            data={topSanPham.data}
            isLoading={topSanPham.isLoading}
            icon={Star}
            renderRow={(item, indx) => (
              <>
                <TableCell className="px-6 py-4 text-sm font-bold text-gray-900">
                  #{indx + 1}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm max-w-[200px] truncate font-medium text-gray-800">
                  {item.tenSanPham}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {item.soLuongBan?.toLocaleString() || 0}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-bold text-green-600">
                  {formatCurrency(item.doanhThu)}
                </TableCell>
              </>
            )}
          />

          <DataTable
            title="Top Khách Hàng"
            headers={["STT", "Tên Khách Hàng", "Số Đơn", "Tổng Tiền"]}
            data={topKhachHang.data}
            isLoading={topKhachHang.isLoading}
            icon={Users}
            renderRow={(item, index) => (
              <>
                <TableCell className="px-6 py-4 text-sm font-bold text-gray-900">
                  #{index + 1}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-medium text-gray-800">
                  {item.ten}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {item.soDon?.toLocaleString() || 0}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-bold text-blue-600">
                  {formatCurrency(item.tongTien)}
                </TableCell>
              </>
            )}
          />
        </div>

        {/* Full Width Tables */}
        <div className="space-y-8">
          <DataTable
            title="Khuyến Mãi Hiệu Quả"
            headers={[
              "STT",
              "Tên Khuyến Mãi",
              "Số Đơn Áp Dụng",
              "Doanh Thu Gốc",
              "Sau Giảm Giá",
              "Tiền Được Giảm",
            ]}
            data={khuyenMaiHieuQua.data}
            isLoading={khuyenMaiHieuQua.isLoading}
            icon={Gift}
            renderRow={(item, index) => (
              <>
                <TableCell className="px-6 py-4 text-sm font-bold text-gray-900">
                  #{index + 1}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-medium text-gray-800 max-w-[200px] truncate">
                  {item.tenKhuyenMai}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {item.soDonApDung?.toLocaleString() || 0}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {formatCurrency(item.tongDoanhThuGoc)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-bold text-green-600">
                  {formatCurrency(item.tongDoanhThuSauGiam)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-bold text-red-500">
                  -{formatCurrency(item.tongTienGiam)}
                </TableCell>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
