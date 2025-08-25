"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string; // giữ nguyên để tương thích ngược
  isLoading?: boolean;
  suffix?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading = false,
  suffix = "",
}: StatCardProps) {
  // Ánh xạ màu cũ sang hệ thống mới
  const getColorConfig = (colorClass: string) => {
    if (colorClass.includes("green")) {
      return {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        iconBg: "bg-green-500",
        text: "text-green-700",
        border: "border-green-200",
        glow: "hover:shadow-green-200",
      };
    }
    if (colorClass.includes("red")) {
      return {
        bg: "bg-gradient-to-br from-red-50 to-red-100",
        iconBg: "bg-red-500",
        text: "text-red-700",
        border: "border-red-200",
        glow: "hover:shadow-red-200",
      };
    }
    if (colorClass.includes("blue")) {
      return {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        iconBg: "bg-blue-500",
        text: "text-blue-700",
        border: "border-blue-200",
        glow: "hover:shadow-blue-200",
      };
    }
    if (colorClass.includes("orange")) {
      return {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100",
        iconBg: "bg-orange-500",
        text: "text-orange-700",
        border: "border-orange-200",
        glow: "hover:shadow-orange-200",
      };
    }
    // Mặc định
    return {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100",
      iconBg: "bg-gray-500",
      text: "text-gray-700",
      border: "border-gray-200",
      glow: "hover:shadow-gray-200",
    };
  };

  const colorConfig = getColorConfig(color);

  return (
    <div
      className={`relative rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorConfig.bg} ${colorConfig.border} border ${colorConfig.glow}`}
    >
      <div className="z-10">
        <p
          className={`text-xs font-medium uppercase tracking-wider ${colorConfig.text} opacity-80`}
        >
          {title}
        </p>
        {isLoading ? (
          <div className="h-8 bg-white rounded-md animate-pulse w-24 mt-2 opacity-50"></div>
        ) : (
          <p className={`text-2xl font-bold ${colorConfig.text} mt-2`}>
            {value}
            {suffix && (
              <span className="text-sm font-normal ml-1">{suffix}</span>
            )}
          </p>
        )}
      </div>

      <div className="relative z-10">
        <div
          className={`flex items-center justify-center h-12 w-12 rounded-xl ${colorConfig.iconBg} text-white transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-md`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Hiệu ứng nền trang trí */}
      <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-white opacity-20"></div>
    </div>
  );
}
