"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchStore } from "@/context/useSearch.store";
import { parse, format, isValid, parseISO } from "date-fns";
import React from "react";

interface Props {
  fromDate: string;
  toDate: string;
  onChangeFromDate: (date: string) => void;
  onChangeTodate: (date: string) => void;
  onResetFilter: () => void;
}

export default function KhuyenMaiFilter({
  fromDate,
  toDate,
  onChangeFromDate,
  onChangeTodate,
  onResetFilter,
}: Props) {
  const { keyword, setKeyword } = useSearchStore();

  // Convert string → Date
  const fromDateObj = fromDate ? parseISO(fromDate) : null;
  const toDateObj = toDate ? parseISO(toDate) : null;

  const handleFromDateChange = (date: Date | null) => {
    if (date) {
      onChangeFromDate(format(date, "yyyy-MM-dd"));
    } else {
      onChangeFromDate("");
    }
  };

  const handleToDateChange = (date: Date | null) => {
    if (date) {
      onChangeTodate(format(date, "yyyy-MM-dd"));
    } else {
      onChangeTodate("");
    }
  };
  console.log("fromDate:", fromDate);
  console.log("toDate:", toDate);

  return (
    <div className="flex flex-wrap gap-4 my-4 items-end">
      {/* Từ khóa */}
      <div className="flex flex-col">
        <Label className="mb-1">Từ khóa</Label>
        <Input
          placeholder="Tìm theo tên, mã khuyến mãi"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-[300px]"
        />
      </div>

      {/* Từ ngày */}
      <div className="flex flex-col">
        <Label className="mb-1">Ngày bắt đầu</Label>
        <DateTimePicker
          value={fromDateObj}
          onChange={handleFromDateChange}
          mode="date"
        />
      </div>

      {/* Đến ngày */}
      <div className="flex flex-col">
        <Label className="mb-1">Ngày kết thúc</Label>
        <DateTimePicker
          value={toDateObj}
          onChange={handleToDateChange}
          mode="date"
        />
      </div>

      {/* Nút reset */}
      <div className="">
        <Button
          type="button"
          onClick={onResetFilter}
          variant="default"
          className="text-sm text-blue-500 underline hover:text-blue-700"
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
