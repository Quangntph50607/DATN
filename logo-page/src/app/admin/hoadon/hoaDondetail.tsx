
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from "docx";
import { useState } from "react";

// Define interfaces aligned with HoaDonDTO
interface InvoiceDetail {
    maHD?: string;
    id?: number;
    ngayTao?: number | Date | string | null;
    trangThai?: keyof typeof TrangThaiHoaDon | string;
    phuongThucThanhToan?: keyof typeof PaymentMethods | null;
    tamTinh?: number;
    soTienGiam?: number;
    tongTien?: number;
    ten?: string | null;
    sdt?: string;
    diaChiGiaoHang?: string;
    userId?: number;
    maVanChuyen?: string;
}

interface ProductDetail {
    id?: number;
    hdId?: number;
    spId?: number;
    tensp?: string;
    masp?: string;
    soLuong?: number;
    gia?: number;
    tongTien?: number;
}

type HoaDonDetailProps = {
    open: boolean;
    onClose: () => void;
    detail: InvoiceDetail | null;
    loadingDetail: boolean;
    chiTietSanPham: ProductDetail[];
};

// Mock enums to match HoaDonDTO
enum TrangThaiHoaDon {
    PENDING = "Đang xử lý",
    PROCESSING = "Đã xác nhận",
    PACKING = "Đang đóng gói",
    SHIPPED = "Đang vận chuyển",
    DELIVERED = "Đã giao",
    COMPLETED = "Hoàn tất",
    CANCELLED = "Đã hủy",
    FAILED = "Thất bại",
}

enum PaymentMethods {
    CASH = "Tiền mặt",
    BANK_TRANSFER = "Chuyển khoản",
    CASH_ON_DELIVERY = "COD",
}

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
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case TrangThaiHoaDon.COMPLETED:
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case TrangThaiHoaDon.CANCELLED:
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        case TrangThaiHoaDon.FAILED:
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
};

const getTrangThaiLabel = (status: string) => {
    return TrangThaiHoaDon[status as keyof typeof TrangThaiHoaDon] || status;
};

// Function to export invoice details to Excel
const exportExcel = (detail: InvoiceDetail | null, chiTietSanPham: ProductDetail[]) => {
    if (!detail || !chiTietSanPham) {
        alert("Không có dữ liệu để xuất file!");
        return;
    }
    const invoiceData = [
        ["Mã hóa đơn", detail.maHD || "N/A"],
        ["Ngày tạo", parseBackendDate(detail.ngayTao)],
        ["Trạng thái", getTrangThaiLabel(detail.trangThai || "")],
        ["Phương thức thanh toán", detail.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"],
        ["Khách hàng", detail.ten || "N/A"],
        ["Số điện thoại", detail.sdt || ""],
        ["Địa chỉ giao hàng", detail.diaChiGiaoHang || ""],
        ["User ID", detail.userId?.toString() || "N/A"],
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
            sp.masp || "",
            sp.tensp || "",
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
        { wch: 20 },
        { wch: 15 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `HoaDon_${detail.maHD || "unknown"}.xlsx`);
};

// Function to export invoice details to DOCX
const exportDocx = (detail: InvoiceDetail | null, chiTietSanPham: ProductDetail[]) => {
    if (!detail || !chiTietSanPham) {
        alert("Không có dữ liệu để xuất file!");
        return;
    }
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Chi tiết hóa đơn #${detail.maHD || "N/A"} `,
                                bold: true,
                                size: 28,
                                color: "0000FF",
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Mã hóa đơn: ${detail.maHD || "N/A"} `, bold: true }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Ngày tạo: ${parseBackendDate(detail.ngayTao)} `,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Trạng thái: ${getTrangThaiLabel(detail.trangThai || "")} `, bold: true }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Phương thức thanh toán: ${detail.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"} `,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Khách hàng: ${detail.ten || "N/A"} ` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Số điện thoại: ${detail.sdt || ""} ` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Địa chỉ giao hàng: ${detail.diaChiGiaoHang || ""} ` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `User ID: ${detail.userId?.toString() || "N/A"} ` })],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Mã vận chuyển: ${detail.maVanChuyen || "N/A"} `, bold: true }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Tạm tính: ${detail.tamTinh?.toLocaleString() || 0}₫`, bold: true }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Giảm giá: ${detail.soTienGiam?.toLocaleString() || 0}₫`, bold: true }),
                        ],
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
                            ...chiTietSanPham.map((sp, idx) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(`${idx + 1} `)], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(sp.masp || "")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(sp.tensp || "")], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${sp.soLuong || 0} `)], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${Number(sp.gia || 0).toLocaleString()}₫`)], margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${Number(sp.tongTien || 0).toLocaleString()}₫`)], margins: { top: 100, bottom: 100 } }),
                                ],
                            })),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Tạm tính")], columnSpan: 5, margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${detail.tamTinh?.toLocaleString() || 0}₫`)], margins: { top: 100, bottom: 100 } }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Giảm giá")], columnSpan: 5, margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${detail.soTienGiam?.toLocaleString() || 0}₫`)], margins: { top: 100, bottom: 100 } }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Tổng cộng")], columnSpan: 5, margins: { top: 100, bottom: 100 } }),
                                    new TableCell({ children: [new Paragraph(`${detail.tongTien?.toLocaleString() || 0}₫`)], margins: { top: 100, bottom: 100 } }),
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

export default function HoaDonDetail(props: HoaDonDetailProps) {
    const { open, onClose, detail, loadingDetail, chiTietSanPham } = props;
    console.log("Chi tiết hóa đơn:", detail);
    const handleViewDetail = async (id: number) => {
        setOpen(true);
        setLoadingDetail(true);
        try {
            const data = await HoaDonService.getHoaDonById(id);
            console.log("Chi tiết hóa đơn từ API:", data); // <== Thêm ở đây
            setDetail(data);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
            <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="relative pb-2">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                        {detail ? (
                            <>
                                Chi tiết hóa đơn <span className="text-blue-600 dark:text-blue-400">#{detail.maHD || "N/A"}</span>
                            </>
                        ) : (
                            "Chi tiết hóa đơn"
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        onClick={onClose}
                        aria-label="Đóng chi tiết hóa đơn"
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
                                            className={`uppercase px - 3 py - 1 text - xs font - medium ${getStatusStyles(detail.trangThai || "")} `}
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
                                        <span>{detail.ten}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Số điện thoại:</span>
                                        <span>{detail.sdt || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">Địa chỉ giao hàng:</span>
                                        <span>{detail.diaChiGiaoHang || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 w-32">User ID:</span>
                                        <span>{detail.userId?.toString() || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mb-6">
                                <Button
                                    onClick={() => exportExcel(detail, chiTietSanPham)}
                                    className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Xuất Excel
                                </Button>
                                <Button
                                    onClick={() => exportDocx(detail, chiTietSanPham)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Xuất DOCX
                                </Button>
                            </div>

                            <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Chi tiết sản phẩm</h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <tr>
                                            <th className="p-3 text-left font-semibold">STT</th>
                                            <th className="p-3 text-left font-semibold">Mã SP</th>
                                            <th className="p-3 text-left font-semibold">Tên SP</th>
                                            <th className="p-3 text-center font-semibold">SL</th>
                                            <th className="p-3 text-right font-semibold">Đơn giá</th>
                                            <th className="p-3 text-right font-semibold">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chiTietSanPham.map((sp, idx) => (
                                            <tr
                                                key={sp.masp ?? idx}
                                                className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                                                    } hover: bg - gray - 100 dark: hover: bg - gray - 700 transition - colors`}
                                            >
                                                <td className="p-3">{idx + 1}</td>
                                                <td className="p-3">{sp.masp || "N/A"}</td>
                                                <td className="p-3 truncate max-w-xs">{sp.tensp || "N/A"}</td>
                                                <td className="p-3 text-center">{sp.soLuong || 0}</td>
                                                <td className="p-3 text-right">{Number(sp.gia || 0).toLocaleString()}₫</td>
                                                <td className="p-3 text-right">{Number(sp.tongTien || 0).toLocaleString()}₫</td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-700">
                                            <td colSpan={5} className="p-3 text-right">Tạm tính:</td>
                                            <td className="p-3 text-right">{detail.tamTinh?.toLocaleString() || 0}₫</td>
                                        </tr>
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-700">
                                            <td colSpan={5} className="p-3 text-right">Giảm giá:</td>
                                            <td className="p-3 text-right">{detail.soTienGiam?.toLocaleString() || 0}₫</td>
                                        </tr>
                                        <tr className="font-bold bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400">
                                            <td colSpan={5} className="p-3 text-right">Tổng cộng:</td>
                                            <td className="p-3 text-right">{detail.tongTien?.toLocaleString() || 0}₫</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-red-500 dark:text-red-400 text-center py-12 font-medium">
                            Không tìm thấy hóa đơn
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
