"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, FileSpreadsheet, FileText, Printer, Undo2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
} from "docx";
import { HoaDonDetailDTO, PaymentMethods, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { SanPham } from "@/components/types/product.type";
import { DTOUser } from "@/components/types/account.type";

interface InvoiceDetail {
    maHD?: string;
    id?: number;
    ngayTao?: number | Date | string | null;
    trangThai?: keyof typeof TrangThaiHoaDon | string;
    phuongThucThanhToan?: keyof typeof PaymentMethods | null;
    tamTinh?: number;
    soTienGiam?: number;
    tongTien?: number;
    diaChiGiaoHang?: string;
    userId?: number;
    maVanChuyen?: string;
}

interface HoaDonDetailProps {
    open: boolean;
    onClose: () => void;
    detail: InvoiceDetail | null;
    loadingDetail: boolean;
    chiTietSanPham: HoaDonDetailDTO[];
    sanPhams: SanPham[];
    users: DTOUser[];
}

// Hàm tra cứu thông tin sản phẩm
const getSanPhamMap = (sanPhams: SanPham[]) => {
    const map = new Map<number, SanPham>();
    sanPhams.forEach((sp) => map.set(sp.id, sp));
    return map;
};

// Hàm tra cứu thông tin người dùng
const getUserMap = (users: DTOUser[]) => {
    const map = new Map<number, { ten: string; sdt: string }>();
    users.forEach((user) => {
        map.set(user.id, { ten: user.ten || "N/A", sdt: user.sdt || "N/A" });
    });
    return map;
};

// Hàm bổ sung masp và tensp
const enrichChiTietSanPham = (chiTietSanPham: HoaDonDetailDTO[], sanPhams: SanPham[]): HoaDonDetailDTO[] => {
    const spMap = getSanPhamMap(sanPhams);
    return chiTietSanPham.map((item) => {
        const sp = spMap.get(item.spId);
        return {
            ...item,
            masp: sp?.maSanPham || "N/A",
            tensp: sp?.tenSanPham || "N/A",
        };
    });
};

// Hàm xử lý định dạng ngày
const parseBackendDate = (date: number | Date | string | null | undefined): string => {
    if (!date) return "N/A";
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        const parsedDate = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
        return !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString("vi-VN") : "N/A";
    }
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toLocaleString("vi-VN") : "N/A";
};

// Hàm lấy style cho trạng thái
const getStatusStyles = (status: string) => {
    switch (status) {
        case TrangThaiHoaDon.PENDING:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case TrangThaiHoaDon.PROCESSING:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case TrangThaiHoaDon.PACKING:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        case TrangThaiHoaDon.SHIPPED:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        case TrangThaiHoaDon.DELIVERED:
        case TrangThaiHoaDon.COMPLETED:
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case TrangThaiHoaDon.CANCELLED:
        case TrangThaiHoaDon.FAILED:
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
};

// Hàm lấy nhãn trạng thái
const getTrangThaiLabel = (status: string) => {
    return TrangThaiHoaDon[status as keyof typeof TrangThaiHoaDon] || status;
};

// Hàm xuất Excel
const exportExcel = (detail: InvoiceDetail | null, chiTietSanPham: HoaDonDetailDTO[], users: DTOUser[]) => {
    if (!detail || !chiTietSanPham) {
        alert("Không có dữ liệu để xuất file!");
        return;
    }
    const userMap = getUserMap(users);
    const { ten, sdt } = userMap.get(detail.userId!) || { ten: "N/A", sdt: "N/A" };
    const invoiceData = [
        ["Mã hóa đơn", detail.maHD || "N/A"],
        ["Ngày tạo", parseBackendDate(detail.ngayTao)],
        ["Trạng thái", getTrangThaiLabel(detail.trangThai || "")],
        ["Phương thức thanh toán", detail.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"],
        ["Khách hàng", ten],
        ["Số điện thoại", sdt],
        ["Địa chỉ giao hàng", detail.diaChiGiaoHang || "N/A"],
        ["Mã vận chuyển", detail.maVanChuyen || "N/A"],
        ["Tạm tính", `${detail.tamTinh?.toLocaleString() || 0}₫`],
        ["Giảm giá", `${detail.soTienGiam?.toLocaleString() || 0}₫`],
        ["Tổng tiền", `${detail.tongTien?.toLocaleString() || 0}₫`],
        [],
        ["Chi tiết sản phẩm"],
        ["STT", "Mã SP", "Tên SP", "Số lượng", "Đơn giá", "Thành tiền"],
    ];
    chiTietSanPham.forEach((sp, idx) => {
        invoiceData.push([
            idx + 1,
            sp.masp || "N/A",
            sp.tensp || "N/A",
            sp.soLuong || 0,
            `${Number(sp.gia || 0).toLocaleString()}₫`,
            `${Number(sp.tongTien || 0).toLocaleString()}₫`,
        ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(invoiceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HoaDon");
    worksheet["!cols"] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
    ];
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `HoaDon_${detail.maHD || "unknown"}.xlsx`);
};

// Hàm xuất DOCX
const exportDocx = (detail: InvoiceDetail | null, chiTietSanPham: HoaDonDetailDTO[], users: DTOUser[]) => {
    if (!detail || !chiTietSanPham) {
        alert("Không có dữ liệu để xuất file!");
        return;
    }
    const userMap = getUserMap(users);
    const { ten, sdt } = userMap.get(detail.userId!) || { ten: "N/A", sdt: "N/A" };
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Chi tiết hóa đơn #${detail.maHD || "N/A"}`,
                                bold: true,
                                size: 28,
                                color: "0000FF",
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Mã hóa đơn: ${detail.maHD || "N/A"}`, bold: true })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Ngày tạo: ${parseBackendDate(detail.ngayTao)}` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Trạng thái: ${getTrangThaiLabel(detail.trangThai || "")}`, bold: true }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Phương thức thanh toán: ${detail.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"}`,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Khách hàng: ${ten}` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Số điện thoại: ${sdt}` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Địa chỉ giao hàng: ${detail.diaChiGiaoHang || "N/A"}` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Mã vận chuyển: ${detail.maVanChuyen || "N/A"}`, bold: true })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Tạm tính: ${detail.tamTinh?.toLocaleString() || 0}₫`, bold: true })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Giảm giá: ${detail.soTienGiam?.toLocaleString() || 0}₫`, bold: true })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Tổng tiền: ${detail.tongTien?.toLocaleString() || 0}₫`,
                                bold: true,
                                color: "008000",
                            }),
                        ],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "Chi tiết sản phẩm", bold: true, size: 24 })],
                        spacing: { after: 200 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph("Mã SP")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph("Tên SP")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph("Số lượng")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph("Đơn giá")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")], margins: { top: 100, bottom: 100 } }),
                                ],
                            }),
                            ...chiTietSanPham.map((sp, idx) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(`${idx + 1}`)], margins: { top: 100, bottom: 100 } }),
                                        new TableCell({ children: [new Paragraph(sp.masp || "N/A")], margins: { top: 100, bottom: 100 } }),
                                        new TableCell({ children: [new Paragraph(sp.tensp || "N/A")], margins: { top: 100, bottom: 100 } }),
                                        new TableCell({ children: [new Paragraph(`${sp.soLuong || 0}`)], margins: { top: 100, bottom: 100 } }),
                                        new TableCell({
                                            children: [new Paragraph(`${Number(sp.gia || 0).toLocaleString()}₫`)],
                                            margins: { top: 100, bottom: 100 },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph(`${Number(sp.tongTien || 0).toLocaleString()}₫`)],
                                            margins: { top: 100, bottom: 100 },
                                        }),
                                    ],
                                })
                            ),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph("Tạm tính")],
                                        columnSpan: 5,
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`${detail.tamTinh?.toLocaleString() || 0}₫`)],
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph("Giảm giá")],
                                        columnSpan: 5,
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`${detail.soTienGiam?.toLocaleString() || 0}₫`)],
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph("Tổng cộng")],
                                        columnSpan: 5,
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`${detail.tongTien?.toLocaleString() || 0}₫`)],
                                        margins: { top: 100, bottom: 100 },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `HoaDon_${detail.maHD || "unknown"}.docx`);
    });
};

export default function HoaDonDetail({ open, onClose, detail, loadingDetail, chiTietSanPham, sanPhams, users }: HoaDonDetailProps) {
    // Debug log để kiểm tra dữ liệu
    console.log("Debug - Users:", users);
    console.log("Debug - Detail:", detail);

    const enrichedChiTietSanPham = enrichChiTietSanPham(chiTietSanPham, sanPhams);
    const userMap = getUserMap(users);

    // Tra cứu thông tin người dùng với kiểm tra kỹ hơn
    const userInfo = detail && detail.userId ? userMap.get(detail.userId) : null;
    const { ten, sdt } = userInfo || { ten: "N/A", sdt: "N/A" };
    console.log("Debug - User Info:", { userId: detail?.userId, ten, sdt }); // Log kết quả tra cứu

    if (!open) return null;

    const handlePrint = () => window.print();
    const handleRefund = () => alert("Chức năng hoàn tiền đang được phát triển.");
    const handleExportExcel = () => exportExcel(detail, enrichedChiTietSanPham, users);
    const handleExportDocx = () => exportDocx(detail, enrichedChiTietSanPham, users);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <Card className="w-full max-w-4xl max-h-[70vh] bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="relative pb-2">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                        Chi tiết hóa đơn <span className="text-blue-600 dark:text-blue-400">#{detail?.maHD || "N/A"}</span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 text-sm">
                    {loadingDetail ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-12">Đang tải chi tiết...</div>
                    ) : detail ? (
                        <ScrollArea className="h-[75vh] pr-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Mã hóa đơn:</span>
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">{detail.maHD || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Ngày tạo:</span>
                                        <span>{parseBackendDate(detail.ngayTao)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Trạng thái:</span>
                                        <Badge
                                            className={`uppercase px-3 py-1 text-xs font-medium ${getStatusStyles(detail.trangThai || "")}`}
                                        >
                                            {getTrangThaiLabel(detail.trangThai || "")}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Phương thức thanh toán:</span>
                                        <span>{detail.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Tạm tính:</span>
                                        <span>{detail.tamTinh?.toLocaleString() || 0}₫</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Giảm giá:</span>
                                        <span>{detail.soTienGiam?.toLocaleString() || 0}₫</span>
                                    </div>
                                    <div className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Tổng tiền:</span>
                                        <span>{detail.tongTien?.toLocaleString() || 0}₫</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Mã vận chuyển:</span>
                                        <span>{detail.maVanChuyen || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Khách hàng:</span>
                                        <span>{ten}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Số điện thoại:</span>
                                        <span>{sdt}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Địa chỉ giao hàng:</span>
                                        <span>{detail.diaChiGiaoHang || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    onClick={handleExportExcel}
                                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-100"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExportDocx}
                                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-100"
                                >
                                    <FileText className="w-4 h-4 mr-2" /> DOCX
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handlePrint}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                                >
                                    <Printer className="w-4 h-4 mr-2" /> In hóa đơn
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleRefund}
                                    className="text-red-600 border-red-300 hover:bg-red-100"
                                >
                                    <Undo2 className="w-4 h-4 mr-2" /> Hoàn tiền
                                </Button>
                            </div>

                            <Separator className="my-4" />
                            <h3 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">STT</th>
                                            <th className="px-4 py-2 font-semibold">Mã SP</th>
                                            <th className="px-4 py-2 font-semibold">Tên SP</th>
                                            <th className="px-4 py-2 font-semibold">Số lượng</th>
                                            <th className="px-4 py-2 font-semibold">Đơn giá</th>
                                            <th className="px-4 py-2 font-semibold">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrichedChiTietSanPham.map((item, idx) => (
                                            <tr
                                                key={item.masp ?? idx}
                                                className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                            >
                                                <td className="px-4 py-2">{idx + 1}</td>
                                                <td className="px-4 py-2">{item.masp || "N/A"}</td>
                                                <td className="px-4 py-2">{item.tensp || "N/A"}</td>
                                                <td className="px-4 py-2 text-center">{item.soLuong || 0}</td>
                                                <td className="px-4 py-2 text-right">{Number(item.gia || 0).toLocaleString()}₫</td>
                                                <td className="px-4 py-2 text-right">{Number(item.tongTien || 0).toLocaleString()}₫</td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-700">
                                            <td colSpan={5} className="px-4 py-2 text-right">Tạm tính:</td>
                                            <td className="px-4 py-2 text-right">{detail.tamTinh?.toLocaleString() || 0}₫</td>
                                        </tr>
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-700">
                                            <td colSpan={5} className="px-4 py-2 text-right">Giảm giá:</td>
                                            <td className="px-4 py-2 text-right">{detail.soTienGiam?.toLocaleString() || 0}₫</td>
                                        </tr>
                                        <tr className="font-bold bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400">
                                            <td colSpan={5} className="px-4 py-2 text-right">Tổng cộng:</td>
                                            <td className="px-4 py-2 text-right">{detail.tongTien?.toLocaleString() || 0}₫</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-red-500 dark:text-red-400 text-center py-12 font-medium">Không tìm thấy hóa đơn</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}