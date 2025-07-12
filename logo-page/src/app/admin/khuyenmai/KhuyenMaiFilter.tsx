import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchStore } from "@/context/useSearch.store";
import React, { useState } from "react";

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
  return (
    <div>
      {/* Từ khóa */}
      <div>
        <Label className="mb-2 block">Từ khóa</Label>
        <Input
          placeholder="Tìm theo tên hoặc mã"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div>
        <Label className="mb-2 block">Từ ngày</Label>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => onChangeFromDate(e.target.value)}
        />
      </div>

      {/* Đến ngày */}
      <div>
        <Label className="mb-2 block">Đến ngày</Label>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => onChangeTodate(e.target.value)}
        />
      </div>
      {/* Nút đặt lại */}
      <div className="col-span-full text-right">
        <Button
          type="button"
          onClick={onResetFilter}
          variant="ghost"
          className="text-sm text-blue-500 underline hover:text-blue-700"
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
