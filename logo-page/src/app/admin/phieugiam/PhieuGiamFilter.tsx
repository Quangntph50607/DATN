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
  selectedLoaiPhieuGiam: "" | "Theo %" | "Theo số tiền";
  onChangeLoaiPhieuGiam: (val: "" | "Theo %" | "Theo số tiền") => void;
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
    <div className="flex flex-wrap gap-4 my-4">
      {/* Từ khóa */}
      <div>
        <Label className="mb-2 block">Từ khóa</Label>
        <Input
          placeholder="Tìm theo tên hoặc mã"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full sm:w-[300px]"
        />
      </div>

      {/* Loại phiếu */}
      <div>
        <Label className="mb-2 block">Loại phiếu</Label>
        <Select
          value={selectedLoaiPhieuGiam}
          onValueChange={(val) =>
            onChangeLoaiPhieuGiam(val as "Theo %" | "Theo số tiền" | "")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tìm theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Theo %">Theo %</SelectItem>
            <SelectItem value="Theo số tiền">Theo số tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Từ ngày */}
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
          onChange={(e) => onChangeToDate(e.target.value)}
        />
      </div>

      {/* Nút đặt lại */}
      <div className="col-span-full text-right">
        <Button
          type="button"
          onClick={onResetFilter}
          variant="outline"
          className="text-sm text-blue-500 underline hover:text-blue-700"
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
