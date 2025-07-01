"use client";

import React from "react";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  Ban,
  ClipboardList,
  Box,
  XCircle,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrangThaiHoaDon } from "@/components/types/hoaDon-types";

// Map enumKey -> Icon
const statusIcons: Record<string, LucideIcon> = {
  PENDING: Loader2,
  PROCESSING: ClipboardList,
  PACKING: Box,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  COMPLETED: CheckCircle2,
  CANCELLED: Ban,
  FAILED: XCircle,
};

// Map enumKey -> border color
const statusColors: Record<string, string> = {
  PENDING: "border-yellow-400",
  PROCESSING: "border-blue-400",
  PACKING: "border-amber-400",
  SHIPPED: "border-sky-400",
  DELIVERED: "border-green-400",
  COMPLETED: "border-green-500",
  CANCELLED: "border-red-400",
  FAILED: "border-rose-500",
};

// Map enumKey -> Label (hiển thị)
const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  PACKING: "Đóng gói",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

// Mapping ngược: label → enumKey
const labelToEnumKey: Record<string, string> = Object.entries(TrangThaiHoaDon).reduce(
  (acc, [key, label]) => {
    acc[label] = key.toUpperCase(); // để khớp enumKey (COMPLETED, CANCELLED,...)
    return acc;
  },
  {} as Record<string, string>
);

interface StatusCardListProps {
  statusCounts: Record<string, number>; // ví dụ: { "Đã hủy": 2, "Hoàn tất": 3 }
  filterStatus: string; // enumKey: "CANCELLED"
  onCardClick: (status: string) => void;
}

function StatusCardList({
  statusCounts,
  filterStatus,
  onCardClick,
}: StatusCardListProps) {
  const allEnumStatuses = Object.entries(TrangThaiHoaDon).map(([key, label]) => {
    const enumKey = key.toUpperCase();
    const count = statusCounts[label] || 0; // BE trả label → cần map lại
    return {
      enumKey,
      label,
      count,
    };
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
      {allEnumStatuses.map(({ enumKey, label, count }) => {
        const Icon = statusIcons[enumKey] || Package;
        const borderColor = statusColors[enumKey] || "border-gray-400";
        const isActive = filterStatus === enumKey;

        return (
          <div
            key={enumKey}
            onClick={() => onCardClick(enumKey)}
            className={`relative w-40 h-24 group cursor-pointer transition-transform duration-300 rounded-xl ${isActive ? "scale-[1.04]" : ""
              }`}
          >
            <Card className={`relative w-full h-full border-2 ${borderColor} rounded-xl z-10 bg-white/5`}>
              <CardContent className="p-3 flex flex-col justify-between h-full">
                <div className="text-xs text-gray-300 tracking-wide mb-1 flex items-center gap-1">
                  <Icon className="w-4 h-4 text-blue-300" />
                  {label}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-white">{count}</span>
                  {isActive && (
                    <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                      Lọc
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export default StatusCardList;
