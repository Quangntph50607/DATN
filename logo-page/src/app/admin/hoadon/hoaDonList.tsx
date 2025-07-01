"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import {
    TrangThaiHoaDon,
    PaymentMethods,
    HoaDonDTO,
} from "@/components/types/hoaDon-types";

const loaiHDOptions: { value: string; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "1", label: "Tại quầy" },
    { value: "2", label: "Online" },
];

interface HoaDonListProps {
    data: { content: HoaDonDTO[]; totalPages: number } | null;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    handleViewDetail: (id: number) => void;
    handleStatusChange: (id: number, current: string, next: string) => void;
    PAGE_SIZE: number;
    isValidTrangThaiTransition: (current: string, next: string) => boolean;
}

function HoaDonList({
    data,
    page,
    setPage,
    handleViewDetail,
    handleStatusChange,
    PAGE_SIZE,
    isValidTrangThaiTransition,
}: HoaDonListProps) {
    const [filterLoaiHD, setFilterLoaiHD] = useState<string>("all");

    const parseBackendDate = (date: any): Date | null => {
        if (!date) return null;
        if (Array.isArray(date) && date.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
            return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
        }
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    };

    const filteredData = useMemo(() => {
        if (filterLoaiHD === "all") return data?.content || [];
        return data?.content.filter((hd) => String(hd.loaiHD) === filterLoaiHD) || [];
    }, [data, filterLoaiHD]);

    const getLoaiHDLabel = (loaiHD: number | undefined) => {
        if (loaiHD === 1) return "Tại quầy";
        if (loaiHD === 2) return "Online";
        return "Không rõ";
    };

    return (
        <>
            {/* Tabs lọc loại hóa đơn */}
            <div className="flex justify-start mb-10 mr-100 animate-in fade-in slide-in-from-left-10 duration-500">
                <Tabs value={filterLoaiHD} onValueChange={setFilterLoaiHD}>
                    <TabsList className="bg-card border shadow-sm p-1 rounded-xl">
                        {loaiHDOptions.map((opt) => (
                            <TabsTrigger
                                key={opt.value}
                                value={opt.value}
                                className="data-[state=active]:bg-primary data-[state=active]:text-white
                                text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-muted"
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Bảng danh sách hóa đơn */}
            <div className="rounded-2xl shadow-lg bg-background border border-muted overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            {[
                                "STT", "Mã HĐ", "Tên", "SĐT", "Tổng tiền", "Ngày tạo",
                                "Loại HĐ", "Trạng thái", "Thanh toán", ""
                            ].map((header, i) => (
                                <TableHead
                                    key={i}
                                    className="whitespace-nowrap text-foreground font-semibold text-sm"
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((hd: HoaDonDTO, index) => (
                            <TableRow key={hd.id} className="hover:bg-muted/20 transition-colors">
                                <TableCell>{page * PAGE_SIZE + index + 1}</TableCell>
                                <TableCell className="text-blue-500 font-semibold">{hd.maHD || "N/A"}</TableCell>
                                <TableCell>{hd.ten || "N/A"}</TableCell>
                                <TableCell>{hd.sdt || "N/A"}</TableCell>
                                <TableCell className="text-green-500 font-medium">
                                    {hd.tongTien.toLocaleString("vi-VN")}₫
                                </TableCell>
                                <TableCell>{parseBackendDate(hd.ngayTao)?.toLocaleString("vi-VN") || "N/A"}</TableCell>
                                <TableCell>{getLoaiHDLabel(hd.loaiHD)}</TableCell>
                                <TableCell>
                                    <Select
                                        value={hd.trangThai || ""}
                                        onValueChange={(value: string) =>
                                            handleStatusChange(hd.id, hd.trangThai || "", value)
                                        }
                                    >
                                        <SelectTrigger className="w-[130px] text-xs bg-muted/20 border border-border">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TrangThaiHoaDon).map((status, idx) => (
                                                <SelectItem
                                                    key={idx}
                                                    value={status}
                                                    disabled={
                                                        hd.trangThai
                                                            ? !isValidTrangThaiTransition(hd.trangThai, status) ||
                                                            hd.trangThai === status
                                                            : false
                                                    }
                                                    className="text-xs"
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {hd.phuongThucThanhToan
                                        ? PaymentMethods[hd.phuongThucThanhToan]
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleViewDetail(hd.id)}
                                    >
                                        <Eye className="w-5 h-5 text-blue-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                >
                    Trang trước
                </Button>
                <span className="text-sm text-muted-foreground">
                    Trang <strong>{page + 1}</strong> / {data?.totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    onClick={() =>
                        setPage((prev) => (data && prev < data.totalPages - 1 ? prev + 1 : prev))
                    }
                    disabled={!data || page >= data.totalPages - 1}
                >
                    Trang sau
                </Button>
            </div>
        </>
    );
}

export default HoaDonList;
