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
import { Edit, Trash2 } from "lucide-react";
import React from "react";

interface Props {
  phieuGiamGias: PhieuGiamGia[];
  onEdit: (phieuGiamGia: PhieuGiamGia) => void;
  onDelete: (id: number) => void;
}

const formatVND = (value?: number) =>
  value != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

const formatTrangThai = (status?: string) => {
  switch (status) {
    case "active":
      return { text: "Đang hoạt động", className: "text-green-600" };
    case "inactive":
      return { text: "Chưa bắt đầu", className: "text-yellow-600" };
    case "expired":
      return { text: "Đã hết hạn", className: "text-red-600" };
    default:
      return { text: "Không xác định", className: "text-gray-500" };
  }
};

const formatGiaTriGiam = (value: number, loai: string) => {
  return loai === "Theo %" ? `${value}%` : formatVND(value);
};

export default function PhieuGiamTable({
  phieuGiamGias,
  onDelete,
  onEdit,
}: Props) {
  return (
    <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Mã Phiếu</TableHead>
            <TableHead>Số Lượng</TableHead>
            <TableHead>Giá Trị Giảm</TableHead>
            <TableHead>Giảm Tối Đa</TableHead>
            <TableHead>Giá Trị Tối Thiểu</TableHead>
            <TableHead>Loại Giảm</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Ngày Bắt Đầu</TableHead>
            <TableHead>Ngày Kết Thúc</TableHead>
            <TableHead className="text-center">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phieuGiamGias.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center text-muted-foreground"
              >
                Không có phiếu giảm giá nào.
              </TableCell>
            </TableRow>
          ) : (
            phieuGiamGias.map((pgg, index) => {
              const status = formatTrangThai(pgg.trangThai);
              return (
                <TableRow key={pgg.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{pgg.maPhieu}</TableCell>
                  <TableCell>{pgg.soLuong}</TableCell>
                  <TableCell>
                    {formatGiaTriGiam(pgg.giaTriGiam, pgg.loaiPhieuGiam)}
                  </TableCell>
                  <TableCell>{formatVND(pgg.giamToiDa)}</TableCell>
                  <TableCell>{formatVND(pgg.giaTriToiThieu)}</TableCell>
                  <TableCell>{pgg.loaiPhieuGiam}</TableCell>
                  <TableCell className={`font-bold ${status.className}`}>
                    {status.text}
                  </TableCell>
                  <TableCell>{pgg.ngayBatDau}</TableCell>
                  <TableCell>{pgg.ngayKetThuc}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        title="Chỉnh sửa"
                        onClick={() => onEdit(pgg)}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        size="icon"
                        title="Xóa"
                        onClick={() => onDelete(pgg.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
