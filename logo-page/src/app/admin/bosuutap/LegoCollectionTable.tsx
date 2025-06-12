'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BoSuuTap } from '@/components/types/product.type';

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Tên bộ sưu tập</TableHead>
            <TableHead className="font-bold">Mô tả</TableHead>
            <TableHead className="font-bold">Năm phát hành</TableHead>
            <TableHead className="font-bold">Ngày tạo</TableHead>
            <TableHead className="font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {collections.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.tenBoSuuTap}</TableCell>
              <TableCell>{c.moTa}</TableCell>
              <TableCell>{c.namPhatHanh}</TableCell>
              <TableCell>{c.ngayTao}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="hover:opacity-80 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id, c.tenBoSuuTap)}
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

export default LegoCollectionTable;
