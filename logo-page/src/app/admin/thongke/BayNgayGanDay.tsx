"use client";

import React from "react";
import { useBayNgayGanDay } from "@/hooks/useThongKe";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";

export default function BayNgayGanDay() {
  const { data, isLoading, error } = useBayNgayGanDay();

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const formatDayOnly = (date: string | number[] | null | undefined) =>
    formatDateFlexible(date, false);

  const chartData =
    data?.map((item) => ({
      ...item,
      formattedDate: formatDayOnly(item.date),
      displayDate: item.date,
    })) || [];

  // Tính toán thống kê
  const totalRevenue = data?.reduce((sum, item) => sum + item.total, 0) || 0;
  const averageRevenue = data?.length ? totalRevenue / data.length : 0;
  const maxRevenue = data?.length
    ? Math.max(...data.map((item) => item.total))
    : 0;
  const minRevenue = data?.length
    ? Math.min(...data.map((item) => item.total))
    : 0;

  // Tính tỷ lệ tăng trưởng (so với ngày đầu tiên)
  const growthRate =
    data?.length && data.length > 1
      ? ((data[data.length - 1].total - data[0].total) / data[0].total) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="bg-white  rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Doanh Thu 7 Ngày Gần Đây
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Doanh Thu 7 Ngày Gần Đây
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">
            Không thể tải dữ liệu biểu đồ
          </p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Doanh Thu 7 Ngày Gần Đây
          </h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có dữ liệu doanh thu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mt-5 mb-5 rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Doanh Thu 7 Ngày Gần Đây
            </h3>
            <p className="text-sm text-gray-500">
              Xu hướng doanh thu theo thời gian
            </p>
          </div>
        </div>

        {/* Tỷ lệ tăng trưởng */}
        <div className="text-right">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              growthRate >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${growthRate < 0 ? "rotate-180" : ""}`}
            />
            <span>{Math.abs(growthRate).toFixed(1)}%</span>
          </div>
          <p className="text-xs text-gray-500">Tăng trưởng</p>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-medium text-green-600 mb-1">
            Tổng Doanh Thu
          </p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-1">
            Trung Bình/Ngày
          </p>
          <p className="text-lg font-bold text-blue-700">
            {formatCurrency(averageRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-medium text-purple-600 mb-1">Cao Nhất</p>
          <p className="text-lg font-bold text-purple-700">
            {formatCurrency(maxRevenue)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs font-medium text-orange-600 mb-1">Thấp Nhất</p>
          <p className="text-lg font-bold text-orange-700">
            {formatCurrency(minRevenue)}
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#374151", fontWeight: "bold" }}
              formatter={(value: number) => [
                formatCurrency(value),
                "Doanh Thu",
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  return `Ngày ${payload[0].payload.formattedDate}`;
                }
                return `Ngày ${label}`;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Danh sách chi tiết */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Chi Tiết Theo Ngày
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.formattedDate}
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
