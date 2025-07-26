import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import React, { useState } from "react";
type Props = {
  selectedIds: number[];
  setSelectedIds: (id: number[]) => void;
};
export default function SanPhamMultiSelect({
  selectedIds,
  setSelectedIds,
}: Props) {
  const { data: sanPhams = [] } = useListKhuyenMaiTheoSanPham();
  const [filterText, setFilterText] = useState("");
  function handleToggle(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }
  const filteredSanPhams = sanPhams.filter((sp) =>
    sp.tenSanPham.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-4 border p-3 rounded-md ">
      <Label className="font-semibold text-sm">Chọn sản phẩm áp dụng</Label>
      <Input
        placeholder="Tìm kiếm theo tên "
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <ScrollArea className="max-h-64 border rounded p-2 overflow-auto">
        {filteredSanPhams.length > 0 ? (
          filteredSanPhams.map((sp) => (
            <div key={sp.id} className="flex items-center gap-2 py-1">
              <Checkbox
                checked={selectedIds.includes(sp.id)}
                onCheckedChange={() => handleToggle(sp.id)}
              />
              <span>{sp.maSanPham}</span>
              <span>-{sp.tenSanPham}</span>
            </div>
          ))
        ) : (
          <div className="py-1 text-gray-500">Không tìm thấy sản phẩm</div>
        )}
      </ScrollArea>
    </div>
  );
}
