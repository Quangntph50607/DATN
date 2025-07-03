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

const loaiHDOptions = [
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

    const parseBackendDate = (date: any): string => {
        if (!date) return "N/A";
        if (Array.isArray(date) && date.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
            const d = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
            return d.toLocaleString("vi-VN");
        }
        const d = new Date(date);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN");
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
            <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-left-10 duration-500">
                <Tabs value={filterLoaiHD} onValueChange={setFilterLoaiHD}>
                    <TabsList className="bg-[#181e29] border border-blue-400 text-white rounded-xl shadow-md">
                        {loaiHDOptions.map((opt) => (
                            <TabsTrigger
                                key={opt.value}
                                value={opt.value}
                                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white
                                    text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-blue-800 hover:text-white"
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Bảng hóa đơn */}
            <div className="rounded-2xl shadow-xl overflow-x-auto bg-[#181e29] border border-blue-400">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#232b3b]">
                            {[
                                "STT", "Mã HĐ", "Khách hàng", "Tổng tiền", "Ngày tạo",
                                "Trạng thái", "Thanh toán", "Loại HĐ", "Xem"
                            ].map((header, idx) => (
                                <TableHead key={idx} className="text-white text-center text-sm font-semibold bg-[#181e29]">
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((hd, index) => (
                            <TableRow key={hd.id} className="hover:bg-[#232b3b] transition">
                                <TableCell className="text-white text-center">
                                    {page * PAGE_SIZE + index + 1}
                                </TableCell>
                                <TableCell className="text-blue-400 font-semibold text-center">
                                    {hd.maHD || "N/A"}
                                </TableCell>
                                <TableCell className="text-white text-center">
                                    {hd.ten || "N/A"}
                                </TableCell>
                                <TableCell className="text-green-400 text-center font-medium">
                                    {hd.tongTien.toLocaleString("vi-VN")}₫
                                </TableCell>
                                <TableCell className="text-white text-center">
                                    {parseBackendDate(hd.ngayTao)}
                                </TableCell>
                                <TableCell >
                                    <Select
                                        value={hd.trangThai || ""}
                                        onValueChange={(value) => {
                                            if (
                                                hd.trangThai &&
                                                value !== hd.trangThai &&
                                                isValidTrangThaiTransition(hd.trangThai, value)
                                            ) {
                                                const confirmed = window.confirm(
                                                    `Chuyển từ "${hd.trangThai}" sang "${value}"?`
                                                );
                                                if (confirmed) {
                                                    handleStatusChange(hd.id, hd.trangThai, value);
                                                }
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[130px] bg-white/10 border border-blue-400 text-white text-xs font-semibold rounded-lg">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#181e29] border border-blue-400 text-white">
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
                                <TableCell className="text-white text-center">
                                    {hd.phuongThucThanhToan
                                        ? PaymentMethods[hd.phuongThucThanhToan]
                                        : "N/A"}
                                </TableCell>
                                <TableCell className="text-white text-center">
                                    {getLoaiHDLabel(hd.loaiHD)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleViewDetail(hd.id)}
                                    >
                                        <Eye className="w-5 h-5 text-blue-400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!data || filteredData.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-gray-400 py-8">
                                    Không có dữ liệu phù hợp.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang */}
            <div className="flex justify-center items-center mt-4 bg-[#181e29] p-2 rounded-lg ">
                <Button
                    variant="outline"
                    className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550] rounded-lg px-4 py-2"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                >
                    Trang trước
                </Button>
                <span className="text-sm text-gray-400 mx-4">
                    Trang <strong>{page + 1}</strong> / {data?.totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550] rounded-lg px-4 py-2"
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
