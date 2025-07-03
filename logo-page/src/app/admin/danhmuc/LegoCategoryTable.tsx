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
    <div className="border-3 border-blue-500 rounded-2xl overflow-x-auto">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow className="font-bold">
            <TableHead className="w-20">STT</TableHead>
            <TableHead className="w-60 truncate">Tên danh mục</TableHead>
            <TableHead className="w-80 truncate">Mô tả</TableHead>
            <TableHead className="w-32">Hành động</TableHead>
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
    </div>
  );
};

export default LegoCategoryTable;
