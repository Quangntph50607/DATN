"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoSuuTap } from "@/components/types/product.type";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";
import { Button } from "@/components/ui/button";

interface Props {
  collections: BoSuuTap[];
  onEdit: (collection: BoSuuTap) => void;
  onDelete: (id: number, tenBoSuuTap: string) => void;
}

const LegoCollectionTable: React.FC<Props> = ({
  collections,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/20">
      <Table>
        <TableHeader className="bg-blue-500">
          <TableRow className="font-bold">
            <TableHead className="w-20">STT</TableHead>
            <TableHead className="w-60 truncate">Tên bộ sưu tập</TableHead>
            <TableHead className="w-80 truncate">Mô tả</TableHead>
            <TableHead className="w-60">Ngày tạo</TableHead>
            <TableHead className="w-32">Hành đọng</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {collections.map((c, index) => (
            <TableRow key={c.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{c.tenBoSuuTap}</TableCell>
              <TableCell>{c.moTa}</TableCell>
              <TableCell>{formatDateFlexible(c.ngayTao)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button onClick={() => onEdit(c)} title="Chỉnh sửa">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    onClick={() => onDelete(c.id, c.tenBoSuuTap)}
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

export default LegoCollectionTable;
