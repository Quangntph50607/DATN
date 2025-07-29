import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/context/useSearch.store";
import React from "react";

interface Props {
  selectedLoaiPhieuGiam: "" | "theo_phan_tram" | "theo_so_tien";
  onChangeLoaiPhieuGiam: (val: "" | "theo_phan_tram" | "theo_so_tien") => void;
  fromDate: string;
  toDate: string;
  onChangeFromDate: (date: string) => void;
  onChangeToDate: (date: string) => void;
  onResetFilter: () => void;
}

export default function PhieuGiamFilter({
  selectedLoaiPhieuGiam,
  onChangeLoaiPhieuGiam,
  fromDate,
  toDate,
  onChangeFromDate,
  onChangeToDate,
  onResetFilter,
}: Props) {
  const { keyword, setKeyword } = useSearchStore();

  return (
    <div className="flex flex-wrap gap-4 items-end my-4">
      {/* Từ khóa */}
      <div className="flex flex-col min-w-[200px]">
        <Label className="mb-1">Từ khóa</Label>
        <Input
          placeholder="Tìm theo tên hoặc mã"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-[300px]"
        />
      </div>

      {/* Loại phiếu */}
      <div className="flex flex-col min-w-[150px]">
        <Label className="mb-1">Loại phiếu</Label>
        <Select
          value={selectedLoaiPhieuGiam}
          onValueChange={(val) =>
            onChangeLoaiPhieuGiam(val as "" | "theo_phan_tram" | "theo_so_tien")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tìm theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theo_phan_tram">Theo %</SelectItem>
            <SelectItem value="theo_so_tien">Theo số tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Từ ngày */}
      <div className="flex flex-col min-w-[150px]">
        <Label className="mb-1">Từ ngày</Label>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => onChangeFromDate(e.target.value)}
        />
      </div>

      {/* Đến ngày */}
      <div className="flex flex-col min-w-[150px]">
        <Label className="mb-1">Đến ngày</Label>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => onChangeToDate(e.target.value)}
        />
      </div>

      {/* Nút đặt lại */}
      <div className="min-w-[120px]">
        <Button
          type="button"
          onClick={onResetFilter}
          variant="default"
          className="text-sm text-blue-500 underline hover:text-blue-700 w-full"
        >
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
