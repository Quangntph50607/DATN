"use client";

import React from "react";
import { useHoatDongGanDay } from "@/hooks/useThongKe";
import { Activity, UserPlus, ShoppingCart, XCircle, Clock } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";

export default function HoatDongGanDay() {
  const { data, isLoading, error } = useHoatDongGanDay();

  // Hàm format thời gian
  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      if (!isValid(date)) {
        return "Thời gian không hợp lệ";
      }
      return format(date, "HH:mm", { locale: vi });
    } catch {
      return "Thời gian không hợp lệ";
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      if (!isValid(date)) {
        return "Ngày không hợp lệ";
      }
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  // Icon và màu sắc cho từng loại hoạt động
  const getActivityConfig = (type: string) => {
    switch (type) {
      case "Người dùng mới đăng ký":
        return {
          icon: UserPlus,
          bgColor: "bg-green-50",
          iconColor: "text-green-600",
          borderColor: "border-green-200",
          iconBg: "bg-green-100",
        };
      case "Đơn hàng mới":
        return {
          icon: ShoppingCart,
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
        };
      case "Hủy đơn hàng":
        return {
          icon: XCircle,
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
        };
      default:
        return {
          icon: Activity,
          bgColor: "bg-gray-50",
          iconColor: "text-gray-600",
          borderColor: "border-gray-200",
          iconBg: "bg-gray-100",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Hoạt Động Gần Đây
          </h3>
        </div>
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Hoạt Động Gần Đây
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">
            Không thể tải dữ liệu hoạt động
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
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Hoạt Động Gần Đây
          </h3>
        </div>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có hoạt động nào gần đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Hoạt Động Gần Đây
          </h3>
          <p className="text-sm text-gray-500">
            Các sự kiện mới nhất trong hệ thống
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.map((activity, index) => {
          const config = getActivityConfig(activity.type);
          const IconComponent = config.icon;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor} hover:shadow-sm transition-shadow duration-150`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${config.iconBg}`}
              >
                <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">
                    {activity.userName}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${config.iconColor} ${config.iconBg}`}
                  >
                    {activity.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(activity.time)}</span>
                  <span>•</span>
                  <span>{formatTime(activity.time)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-medium ${config.iconColor}`}>
                  {formatTime(activity.time)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Hiển thị {data.length} hoạt động gần nhất
          </p>
        </div>
      )}
    </div>
  );
}

