"use client";

import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

interface Props {
  phieuGiamGias: PhieuGiamGia[];
  onEdit: (phieuGiamGia: PhieuGiamGia) => void;
  onDelete: (id: number) => void;
}

export default function PhieuGiamTable({
  phieuGiamGias,
  onDelete,
  onEdit,
}: Props) {
  return (
    <div className="border-3 border-blue-500 rounded-2xl mt-3">
      <Table className="border-none">
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Mã Phiếu</TableHead>
            <TableHead>Số Lượng</TableHead>
            <TableHead>Giá Trị Giảm</TableHead>
            <TableHead>Giảm Tối Đa</TableHead>
            <TableHead>Giá Trị Tối Thiểu</TableHead>
            <TableHead>Loại Giảm</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Ngày bắt đầu</TableHead>
            <TableHead>Ngày kết thúc</TableHead>
            <TableHead className="text-center">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phieuGiamGias.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-muted-foreground"
              >
                Không có phiếu giảm giá nào.
              </TableCell>
            </TableRow>
          ) : (
            phieuGiamGias.map((pgg, index) => (
              <TableRow key={pgg.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{pgg.maPhieu}</TableCell>
                <TableCell>{pgg.soLuong}</TableCell>
                <TableCell>{pgg.giaTriGiam}</TableCell>
                <TableCell>{pgg.giamToiDa}</TableCell>
                <TableCell>{pgg.giaTriToiThieu}</TableCell>
                <TableCell>{pgg.loaiPhieuGiam}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-semibold",
                      pgg.trangThai === "Đang hoạt động" && "text-green-600",
                      pgg.trangThai === "Ngừng" && "text-yellow-600",
                      pgg.trangThai === "Hết hạn" && "text-red-600"
                    )}
                  >
                    {pgg.trangThai}
                  </span>
                </TableCell>
                <TableCell>{pgg.ngayBatDau}</TableCell>
                <TableCell>{pgg.ngayKetThuc}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      title="Chỉnh sửa"
                      aria-label="Chỉnh sửa"
                      onClick={() => onEdit(pgg)}
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      title="Xóa"
                      aria-label="Xóa"
                      onClick={() => onDelete(pgg.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
