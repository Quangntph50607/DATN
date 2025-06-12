"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { SanPham } from "@/components/types/product.type";

interface LegoProductTableProps {
  products: SanPham[];
  onEdit: (product: SanPham) => void;
  onDelete: (id: number) => void;
}

const LegoProductTable: React.FC<LegoProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Ảnh đại diện</TableHead>
            <TableHead className="font-bold">Mã sản phẩm</TableHead>
            <TableHead className="font-bold">Tên sản phẩm</TableHead>
            <TableHead className="font-bold">Danh mục</TableHead>
            <TableHead className="font-bold">Bộ Sưu Tập</TableHead>
            <TableHead className="font-bold">Độ tuổi</TableHead>
            <TableHead className="font-bold">Giá (VND)</TableHead>
            <TableHead className="font-bold">Số lượng</TableHead>
            <TableHead className="font-bold">Số mảnh ghép</TableHead>
            <TableHead className="font-bold">Trạng thái</TableHead>
            <TableHead className="font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <img
                  src={p.anhDaiDien ?? "/default.jpg"}
                  alt={p.tenSanPham}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
              </TableCell>
              <TableCell>{p.maSanPham}</TableCell>
              <TableCell>{p.tenSanPham}</TableCell>
              <TableCell>{p.tenDanhMuc ?? "Không rõ"}</TableCell>
              <TableCell>{p.tenBoSuuTap ?? "Không rõ"}</TableCell>
              <TableCell>{p.doTuoi}+</TableCell>
              <TableCell>{p.gia.toLocaleString("vi-VN")}₫</TableCell>
              <TableCell>{p.soLuong}</TableCell>
              <TableCell>{p.soLuongManhGhep}</TableCell>
              <TableCell>{p.trangThai}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="hover:opacity-80 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="hover:opacity-80 transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default LegoProductTable;
