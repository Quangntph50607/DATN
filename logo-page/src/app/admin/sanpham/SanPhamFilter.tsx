// app/components/sanpham/SanPhamFilter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/context/useSearch.store";
import ReusableCombobox from "@/shared/ReusableCombobox";

interface Props {
  danhMucs: { id: number; tenDanhMuc: string }[];
  boSuuTaps: { id: number; tenBoSuuTap: string }[];
  selectedDanhMuc: number | null;
  selectedBoSuuTap: number | null;
  onChangeDanhMuc: (id: number | null) => void;
  onChangeBoSuuTap: (id: number | null) => void;
  onResetFilter: () => void;
}

export default function SanPhamFilter({
  danhMucs,
  boSuuTaps,
  selectedDanhMuc,
  selectedBoSuuTap,
  onChangeDanhMuc,
  onChangeBoSuuTap,
  onResetFilter,
}: Props) {
  const { keyword, setKeyword } = useSearchStore();

  return (
    <div className="flex flex-wrap gap-4 my-4">
      {/* Tìm kiếm theo tên / mã sản phẩm */}
      <Input
        placeholder="Tìm theo tên, mã sản phẩm, hoặc tuổi"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full sm:w-[300px]"
      />

      <div className="flex items-center gap-5">
        {/* Lọc theo danh mục */}
        <ReusableCombobox
          items={danhMucs.map((dm) => ({ id: dm.id, label: dm.tenDanhMuc }))}
          selectedId={selectedDanhMuc}
          onSelect={onChangeDanhMuc}
          placeholder="Tìm theo tên danh mục"
          allLabel="Tát cả danh mục"
        />

        {/* Lọc theo bộ sưu tập */}
        <Select
          onValueChange={(val) => onChangeBoSuuTap(val === "all" ? null : +val)}
          value={selectedBoSuuTap?.toString() || "all"}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn bộ sưu tập" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bộ sưu tập</SelectItem>
            {boSuuTaps.map((bst) => (
              <SelectItem key={bst.id} value={bst.id.toString()}>
                {bst.tenBoSuuTap}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Reset */}
        <div className="col-span-full text-right">
          <Button
            type="button"
            onClick={onResetFilter}
            className="text-sm text-blue-500 underline hover:text-blue-700"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}
