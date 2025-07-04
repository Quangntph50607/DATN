"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { DanhMuc } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LegoCategoryTableProps {
  categories: DanhMuc[];
  onEdit: (category: DanhMuc) => void;
  onDelete: (id: number, tenBoSuuTap: string) => void;
}

const LegoCategoryTable: React.FC<LegoCategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-3 border-blue-500 rounded-2xl mt-4 overflow-x-auto shadow-2xl shadow-blue-500/20"
    >
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead className="font-bold">STT</TableHead>
            <TableHead className="font-bold">Tên danh mục</TableHead>
            <TableHead className="font-bold">Mô tả</TableHead>
            <TableHead className="font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c, index) => (
            <TableRow key={c.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="w-60 max-w-[240px] truncate">
                {c.tenDanhMuc}
              </TableCell>
              <TableCell className="w-80 max-w-[320px] truncate">
                {c.moTa}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(c)}
                    className="hover:opacity-80 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    onClick={() => onDelete(c.id, c.tenDanhMuc)}
                    className="hover:opacity-80 transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default LegoCategoryTable;
