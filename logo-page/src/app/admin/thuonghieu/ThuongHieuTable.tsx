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
import { ThuongHieu } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";

interface ThuongHieuTableProps {
    thuongHieus: ThuongHieu[];
    onEdit: (thuongHieu: ThuongHieu) => void;
    onDelete: (id: number, ten: string) => void;
}

export default function ThuongHieuTable({ thuongHieus, onEdit, onDelete }: ThuongHieuTableProps) {
    return (
        <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/20">
            <Table>
                <TableHeader className="bg-blue-500">
                    <TableRow className="font-bold">
                        <TableHead className="w-20">STT</TableHead>
                        <TableHead className="w-60 truncate">Tên thương hiệu</TableHead>
                        <TableHead className="w-80 truncate">Mô tả</TableHead>
                        <TableHead className="w-32">Hành động</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {thuongHieus.map((thuongHieu, index) => (
                        <TableRow key={thuongHieu.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="w-60 max-w-[300px] truncate font-medium">
                                {thuongHieu.ten}
                            </TableCell>
                            <TableCell className="w-80 max-w-[320px] truncate">
                                {thuongHieu.moTa || "Không có mô tả"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button onClick={() => onEdit(thuongHieu)} title="Chỉnh sửa">
                                        <Edit className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(thuongHieu.id, thuongHieu.ten)}
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
} 