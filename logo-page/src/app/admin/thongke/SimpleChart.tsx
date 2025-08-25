"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { LucideIcon } from "lucide-react";

interface SimpleChartProps {
  title: string;
  data: Record<string, number> | null | undefined;
  isLoading?: boolean;
  icon: LucideIcon;
  type?: "bar" | "pie";
  colors?: string[];
}

export default function SimpleChart({
  title,
  data,
  isLoading,
  icon: Icon,
  type = "bar",
  colors = ["#3b82f6", "#22c55e", "#f97316", "#a855f7"],
}: SimpleChartProps) {
  const formattedData = data
    ? Object.entries(data).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart
              data={formattedData}
              barCategoryGap="30%" // giảm khoảng cách giữa cột
            >
              <CartesianGrid strokeDasharray="4" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                }
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]} // bo góc cột cho đẹp
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={formattedData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={(entry) =>
                  `${entry.name}: ${new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(entry.value)}`
                }
              >
                {formattedData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                }
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
