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
import { XuatXu } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";

interface XuatXuTableProps {
    xuatXus: XuatXu[];
    onEdit: (xuatXu: XuatXu) => void;
    onDelete: (id: number, ten: string) => void;
}

export default function XuatXuTable({ xuatXus, onEdit, onDelete }: XuatXuTableProps) {
    return (
        <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/20">
            <Table>
                <TableHeader className="bg-blue-500">
                    <TableRow className="font-bold">
                        <TableHead className="w-20">STT</TableHead>
                        <TableHead className="w-60 truncate">Tên xuất xứ</TableHead>
                        <TableHead className="w-80 truncate">Mô tả</TableHead>
                        <TableHead className="w-32">Hành động</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {xuatXus.map((xuatXu, index) => (
                        <TableRow key={xuatXu.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="w-60 max-w-[300px] truncate font-medium">
                                {xuatXu.ten}
                            </TableCell>
                            <TableCell className="w-80 max-w-[320px] truncate">
                                {xuatXu.moTa || "Không có mô tả"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button onClick={() => onEdit(xuatXu)} title="Chỉnh sửa">
                                        <Edit className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(xuatXu.id, xuatXu.ten)}
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