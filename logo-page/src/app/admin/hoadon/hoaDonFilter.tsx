// app/components/sanpham/HoaDonFilter.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { format } from "date-fns";
import {
  HoaDonDTO,
  PaymentMethods,
  TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { DateTimePicker } from "@/components/ui/date-picker";

interface HoaDonFilterProps {
  filters: {
    keyword: string;
    trangThai: keyof typeof TrangThaiHoaDon | "all";
    phuongThuc: keyof typeof PaymentMethods | "all";
    from: string;
    to: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      keyword: string;
      trangThai: keyof typeof TrangThaiHoaDon | "all";
      phuongThuc: keyof typeof PaymentMethods | "all";
      from: string;
      to: string;
    }>
  >;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  hoaDons: HoaDonDTO[];
}

export default function HoaDonFilter({
  filters,
  setFilters,
  setPage,
  hoaDons,
}: HoaDonFilterProps) {
  const [suggestions, setSuggestions] = useState<HoaDonDTO[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.from ? new Date(filters.from) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.to ? new Date(filters.to) : undefined
  );

  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    if (!inputValue) return [];

    return hoaDons
      .filter(
        (hd) =>
          (hd.id + "").includes(inputValue) ||
          hd.maHD?.toLowerCase().includes(inputValue) ||
          hd.ten?.toLowerCase().includes(inputValue) ||
          hd.sdt?.includes(inputValue)
      )
      .slice(0, 5);
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      trangThai: "all",
      phuongThuc: "all",
      from: "",
      to: "",
    });
    setFromDate(undefined);
    setToDate(undefined);
    setPage(0);
  };

  return (
    <div className="space-y-2 p-3 bg-[#181e29] text-white rounded-lg border border-blue-400 shadow mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-600">
        <span className="text-sm font-medium text-white flex items-center gap-1">
          📋 Bộ lọc hóa đơn
        </span>
        <Button type="button" variant="outline" onClick={resetFilters}>
          <RotateCcw className="w-3 h-3 mr-1" />
          Đặt lại
        </Button>
      </div>

      {/* Hàng 1: Tìm kiếm */}
      <div className="flex  flex-col  gap-2">
        <span className="text-sm font-medium text-gray-300 min-w-fit">
          🔍 Từ khóa:
        </span>
        <div className="flex-1 relative">
          <Input
            placeholder="Mã hóa đơn, tên khách, SĐT..."
            value={filters.keyword}
            onChange={(e) => {
              const value = e.target.value;
              setFilters((f) => ({ ...f, keyword: value }));
              setPage(0);
              if (value) {
                setSuggestions(getSuggestions(value));
                setShowSuggestions(true);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              if (filters.keyword) {
                setSuggestions(getSuggestions(filters.keyword));
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
            className="h-9"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 bg-popover border rounded w-full mt-1 max-h-40 overflow-y-auto text-sm shadow-lg">
              {suggestions.map((hd) => (
                <li
                  key={hd.id}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-foreground"
                  onMouseDown={() => {
                    setFilters((f) => ({
                      ...f,
                      keyword: hd.maHD || hd.ten || hd.sdt || hd.id.toString(),
                    }));
                    setPage(0);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="font-semibold text-blue-600">
                    {hd.maHD || `#${hd.id}`}
                  </span>{" "}
                  - {hd.ten || "N/A"} - {hd.sdt || "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Hàng 2: Trạng thái + Phương thức + Ngày */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Trạng thái */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            📊 Trạng thái
          </label>
          <Select
            value={filters.trangThai}
            onValueChange={(value) => {
              setFilters((f) => ({
                ...f,
                trangThai: value as keyof typeof TrangThaiHoaDon | "all",
              }));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(TrangThaiHoaDon).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            💳 Thanh toán
          </label>
          <Select
            value={filters.phuongThuc}
            onValueChange={(value) => {
              setFilters((f) => ({
                ...f,
                phuongThuc: value as keyof typeof PaymentMethods | "all",
              }));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(PaymentMethods).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Từ ngày */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            📅 Từ ngày
          </label>
          <DateTimePicker
            value={fromDate || null}
            onChange={(date) => {
              setFromDate(date || undefined);
              setFilters((f) => ({
                ...f,
                from: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "",
              }));
              setPage(0);
            }}
            mode="date"
            placeholder="Chọn ngày"
          />
        </div>

        {/* Đến ngày */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            📅 Đến ngày
          </label>
          <DateTimePicker
            value={toDate || null}
            onChange={(date) => {
              setToDate(date || undefined);
              setFilters((f) => ({
                ...f,
                to: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "",
              }));
              setPage(0);
            }}
            mode="date"
            placeholder="Chọn ngày"
          />
        </div>
      </div>
    </div>
  );
}
