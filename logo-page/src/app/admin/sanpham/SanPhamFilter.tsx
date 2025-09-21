import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReusableCombobox from "@/shared/ReusableCombobox";
import { useSearchStore } from "@/context/useSearch.store";
import { useEffect, useState } from "react";

interface Props {
  danhMucs: { id: number; tenDanhMuc: string }[];
  boSuuTaps: { id: number; tenBoSuuTap: string }[];
  xuatXus: { id: number; ten: string }[];
  thuongHieus: { id: number; ten: string }[];
  selectedDanhMuc: number | null;
  selectedBoSuuTap: number | null;
  selectedXuatXu: number | null;
  selectedThuongHieu: number | null;
  giaMin: number | null;
  giaMax: number | null;
  tuoiMin: number | null;
  tuoiMax: number | null;
  onChangeDanhMuc: (id: number | null) => void;
  onChangeBoSuuTap: (id: number | null) => void;
  onChangeXuatXu: (id: number | null) => void;
  onChangeThuongHieu: (id: number | null) => void;
  onChangeGia: (min: number | null, max: number | null) => void;
  onChangeTuoi: (min: number | null, max: number | null) => void;
  onResetFilter: () => void;
}

export default function SanPhamFilter({
  danhMucs,
  boSuuTaps,
  thuongHieus,
  xuatXus,
  selectedDanhMuc,
  selectedBoSuuTap,
  selectedThuongHieu,
  selectedXuatXu,
  giaMin,
  giaMax,
  tuoiMin,
  tuoiMax,
  onChangeDanhMuc,
  onChangeBoSuuTap,
  onChangeThuongHieu,
  onChangeXuatXu,
  onChangeGia,
  onChangeTuoi,
  onResetFilter,
}: Props) {
  const { keyword, setKeyword } = useSearchStore();
  const [localKeyword, setLocalKeyword] = useState(keyword);
  useEffect(() => {
    setLocalKeyword(keyword);
  }, [keyword]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setKeyword(localKeyword);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [localKeyword]);

  return (
    <div className="space-y-4 p-3  rounded-lg border my-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <Button type="button" variant="outline" onClick={onResetFilter}>
          Đặt lại
        </Button>
      </div>

      {/* Hàng 1: Tìm kiếm */}
      <div className="flex flex-col  gap-2">
        <span className="text-sm font-medium text-white flex items-center gap-1">
          🔍 Bộ lọc tìm kiếm
        </span>
        <Input
          placeholder="Tìm theo tên, mã sản phẩm, hoặc tuổi"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
        />
      </div>

      {/* Hàng 2: Các combobox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            📂 Danh mục
          </label>
          <ReusableCombobox
            items={danhMucs.map((dm) => ({ id: dm.id, label: dm.tenDanhMuc }))}
            selectedId={selectedDanhMuc}
            onSelect={onChangeDanhMuc}
            placeholder="Chọn danh mục"
            allLabel="Tất cả"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            📋 Bộ sưu tập
          </label>
          <ReusableCombobox
            items={boSuuTaps.map((bst) => ({
              id: bst.id,
              label: bst.tenBoSuuTap,
            }))}
            selectedId={selectedBoSuuTap}
            onSelect={onChangeBoSuuTap}
            placeholder="Chọn bộ sưu tập"
            allLabel="Tất cả"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            🏷️ Thương hiệu
          </label>
          <ReusableCombobox
            items={thuongHieus.map((th) => ({
              id: th.id,
              label: th.ten,
            }))}
            selectedId={selectedThuongHieu}
            onSelect={onChangeThuongHieu}
            placeholder="Chọn thương hiệu"
            allLabel="Tất cả"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            🌍 Xuất xứ
          </label>
          <ReusableCombobox
            items={xuatXus.map((xx) => ({
              id: xx.id,
              label: xx.ten,
            }))}
            selectedId={selectedXuatXu}
            onSelect={onChangeXuatXu}
            placeholder="Chọn xuất xứ"
            allLabel="Tất cả"
          />
        </div>
      </div>

      {/* Hàng 3: Khoảng giá và tuổi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Giá */}
        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            💰 Khoảng giá (VNĐ)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Từ"
              value={giaMin ?? ""}
              onChange={(e) =>
                onChangeGia(e.target.value ? +e.target.value : null, giaMax)
              }
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Đến"
              value={giaMax ?? ""}
              onChange={(e) =>
                onChangeGia(giaMin, e.target.value ? +e.target.value : null)
              }
              className="h-9"
            />
          </div>
        </div>

        {/* Tuổi */}
        <div>
          <label className="text-xs font-medium text-white mb-1 block">
            📅 Độ tuổi (năm)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Từ"
              value={tuoiMin ?? ""}
              onChange={(e) =>
                onChangeTuoi(e.target.value ? +e.target.value : null, tuoiMax)
              }
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Đến"
              value={tuoiMax ?? ""}
              onChange={(e) =>
                onChangeTuoi(tuoiMin, e.target.value ? +e.target.value : null)
              }
              className="h-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
