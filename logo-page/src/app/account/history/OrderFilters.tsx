import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface StatusOption {
  value: string;
  label: string;
  count: number;
}

interface OrderFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  statusOptions: StatusOption[];
}

export default function OrderFilters({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  searchKeyword,
  setSearchKeyword,
  statusOptions,
}: OrderFiltersProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Bộ lọc đơn hàng</h3>
      </div>

      {/* Status Filter Buttons */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Trạng thái đơn hàng
        </Label>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm border flex items-center
                ${
                  statusFilter === option.value
                    ? "bg-orange-600 text-white border-orange-600 shadow-lg"
                    : "bg-white text-gray-600 border-gray-500 hover:border-orange-300 hover:text-orange-600 "
                }`}
            >
              <span>{option.label}</span>
              {option.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                  ${
                    statusFilter === option.value
                      ? "bg-white  border border-orange-300 text-orange-600 shadow-sm"
                      : "border border-gray-300 text-gray-700"
                  }`}
                >
                  {option.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Tìm kiếm
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Mã đơn hàng hoặc tên sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-black"
            />
          </div>
        </div>

        {/* Date Filter */}
        {/* <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Ngày tạo
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                const v = e.target.value;
                // Normalize to ISO yyyy-mm-dd to match page.tsx compare logic
                const normalized = v
                  ? new Date(v).toISOString().slice(0, 10)
                  : "";
                setDateFilter(normalized);
              }}
              className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-black"
            />
          </div>
        </div> */}
      </div>

      {/* Active Filters Summary */}
      {(searchKeyword ||
        dateFilter ||
        statusFilter !== statusOptions[0]?.value) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {statusFilter !== statusOptions[0]?.value && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Trạng thái:
                  {
                    statusOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </span>
              )}
              {searchKeyword && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Tìm kiếm: "{searchKeyword}"
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Ngày: {dateFilter}
                </span>
              )}
            </div>
            <Button
              onClick={() => {
                setStatusFilter(statusOptions[0]?.value || "");
                setSearchKeyword("");
                setDateFilter("");
              }}
              variant="default"
            >
              Xóa tất cả
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
