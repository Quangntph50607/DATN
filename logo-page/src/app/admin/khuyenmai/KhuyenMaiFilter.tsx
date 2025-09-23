import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchStore } from "@/context/useSearch.store";
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
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => onChangeFromDate(e.target.value)}
          className="w-[150px]"
        />
      </div>

      {/* Đến ngày */}
      <div className="flex flex-col">
        <Label className="mb-1">Ngày kết thúc</Label>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => onChangeTodate(e.target.value)}
          className="w-[150px]"
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
