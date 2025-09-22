"use client";

import React from "react";
import { useTongNguoiDung } from "@/hooks/useThongKe";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function TongNguoiDungStats() {
  const { data, isLoading, error } = useTongNguoiDung();

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm format số với dấu phần nghìn
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Component hiển thị trend
  const TrendIndicator = ({
    value,
    isPositive = true,
  }: {
    value: number;
    isPositive?: boolean;
  }) => {
    const isGoodTrend = isPositive ? value >= 0 : value <= 0;
    return (
      <div
        className={`flex items-center gap-1 text-sm ${
          isGoodTrend ? "text-green-600" : "text-red-600"
        }`}
      >
        {isGoodTrend ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="font-medium">{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-10">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">
            Không thể tải dữ liệu thống kê
          </p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {/* Tổng người dùng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Tổng Người Dùng
              </h3>
              <p className="text-sm text-gray-500">Tất cả tài khoản</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-blue-600">
            {formatNumber(data.user_tong)}
          </div>
          <TrendIndicator value={data.ti_le_tang_User} />
        </div>
      </div>

      {/* Đơn hàng hôm nay */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Đơn Hàng Hôm Nay
              </h3>
              <p className="text-sm text-gray-500">Số đơn mới</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            {formatNumber(data.don_Hang_hom_nay)}
          </div>
          <TrendIndicator value={data.ti_le_tang_DonHang} />
        </div>
      </div>

      {/* Doanh thu tháng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Doanh Thu Tháng
              </h3>
              <p className="text-sm text-gray-500">Tổng thu nhập</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-purple-600">
            {formatCurrency(data.doanhThuThang)}
          </div>
          <TrendIndicator value={data.ti_Le_tang_DoanhThu} />
        </div>
      </div>
    </div>
  );
}

