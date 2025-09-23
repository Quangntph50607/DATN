"use client";

import { HangThanhLyItem } from "../../../components/types/hangthanhly.type";
import { parseBackendDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  items: HangThanhLyItem[];
}

export default function HangThanhLyTable({ items }: Props) {
  const sortedItems = [...items];

  function formatNgayNhap(input?: string | number[] | number | Date): string {
    if (input === undefined || input === null) return "-";

    // If backend sends array [y, m, d, h, m, s, nano]
    if (Array.isArray(input)) {
      const d = parseBackendDate(input);
      return d ? d.toLocaleString("vi-VN") : "-";
    }

    // If Date instance
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? "-" : input.toLocaleString("vi-VN");
    }

    // If numeric timestamp
    if (typeof input === "number") {
      const d = new Date(input.toString().length === 13 ? input : input * 1000);
      return isNaN(d.getTime()) ? "-" : d.toLocaleString("vi-VN");
    }

    const trimmed = input.trim();
    // If it's a pure number string (timestamp)
    if (/^\d{10,13}$/.test(trimmed)) {
      const ts = Number(trimmed.length === 13 ? trimmed : `${trimmed}000`);
      const d = new Date(ts);
      return isNaN(d.getTime()) ? "-" : d.toLocaleString("vi-VN");
    }
    // Common formats from Java/SQL: 'yyyy-MM-dd HH:mm:ss'
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      const iso = trimmed.replace(" ", "T");
      const d = new Date(iso);
      return isNaN(d.getTime()) ? trimmed : d.toLocaleString("vi-VN");
    }
    // Date only: 'yyyy-MM-dd'
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T00:00:00`);
      return isNaN(d.getTime()) ? trimmed : d.toLocaleDateString("vi-VN");
    }
    // Try native parse as a last resort (e.g., ISO strings)
    const native = new Date(trimmed);
    return isNaN(native.getTime()) ? trimmed : native.toLocaleString("vi-VN");
  }
  return (
    <div className="border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead className="whitespace-nowrap">STT</TableHead>
            <TableHead className="whitespace-nowrap">Mã sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap">Tên sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap text-right">Giá</TableHead>
            <TableHead className="whitespace-nowrap text-right">Số lượng TL</TableHead>
            <TableHead className="whitespace-nowrap">Ngày nhập</TableHead>
            <TableHead className="whitespace-nowrap">Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Không có hàng thanh lý
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((row, idx) => (
              <TableRow key={`${row.sanPhamResponseDTO.id}-${idx}`}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="max-w-[100px] truncate">{row.sanPhamResponseDTO.maSanPham || "-"}</TableCell>
                <TableCell className="max-w-[250px] truncate">{row.sanPhamResponseDTO.tenSanPham}</TableCell>
                <TableCell className="text-right">{row.sanPhamResponseDTO.gia.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell className="text-right">{row.soLuong}</TableCell>
                <TableCell>{formatNgayNhap(row.ngayNhap)}</TableCell>
                <TableCell>{row.ghiChu || ""}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}




