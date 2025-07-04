// app/components/sanpham/invoiceUtils.ts
"use client";

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
import { HoaDonDetailDTO, HoaDonDTO, PaymentMethods, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { DTOUser } from "@/components/types/account.type";

// --- Helpers ---
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

const getUserMap = (users: DTOUser[]) => {
    const map = new Map<number, { ten: string; sdt: string }>();
    users.forEach((user) => {
        if (typeof user.id === "number") {
            map.set(user.id, {
                ten: user.ten || "N/A",
                sdt: user.sdt || "N/A",
            });
        }
    });
    return map;
};

const getTrangThaiLabel = (status: string) => {
    return TrangThaiHoaDon[status as keyof typeof TrangThaiHoaDon] || status;
};

// --- Xuất Excel ---
export const exportInvoiceToExcel = (
    detail: HoaDonDTO | null,
    chiTietSanPham: HoaDonDetailDTO[],
    users: DTOUser[]
) => {
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
        ["Phương thức thanh toán", detail.phuongThucThanhToan || "N/A"],
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
            (idx + 1).toString(),
            sp.spId.maSanPham || "N/A",
            sp.spId.tenSanPham || "N/A",
            sp.soLuong.toString(),
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

// --- Xuất DOCX ---
export const exportInvoiceToDocx = (
    detail: HoaDonDTO | null,
    chiTietSanPham: HoaDonDetailDTO[],
    users: DTOUser[]
) => {
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
                    ...[
                        [`Mã hóa đơn: ${detail.maHD || "N/A"}`, true],
                        [`Ngày tạo: ${parseBackendDate(detail.ngayTao)}`],
                        [`Trạng thái: ${getTrangThaiLabel(detail.trangThai || "")}`, true],
                        [`Phương thức thanh toán: ${detail.phuongThucThanhToan || "N/A"}`],
                        [`Khách hàng: ${ten}`],
                        [`Số điện thoại: ${sdt}`],
                        [`Địa chỉ giao hàng: ${detail.diaChiGiaoHang || "N/A"}`],
                        [`Mã vận chuyển: ${detail.maVanChuyen || "N/A"}`, true],
                        [`Tạm tính: ${detail.tamTinh?.toLocaleString() || 0}₫`, true],
                        [`Giảm giá: ${detail.soTienGiam?.toLocaleString() || 0}₫`, true],
                        [`Tổng tiền: ${detail.tongTien?.toLocaleString() || 0}₫`, true, "008000"],
                    ].map(([text, bold = false, color], i) =>
                        new Paragraph({
                            children: [
                                new TextRun({ text: text as string, bold: !!bold, color: (color as string) || undefined }),
                            ],
                            spacing: { after: 100 },
                        })
                    ),
                    new Paragraph({
                        children: [new TextRun({ text: "Chi tiết sản phẩm", bold: true, size: 24 })],
                        spacing: { after: 200 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: ["STT", "Mã SP", "Tên SP", "Số lượng", "Đơn giá", "Thành tiền"].map(
                                    (header) =>
                                        new TableCell({
                                            children: [new Paragraph(header)],
                                            margins: { top: 100, bottom: 100 },
                                        })
                                ),
                            }),
                            ...chiTietSanPham.map((sp, idx) =>
                                new TableRow({
                                    children: [
                                        `${idx + 1}`,
                                        sp.spId.maSanPham || "N/A",
                                        sp.spId.tenSanPham || "N/A",
                                        `${sp.soLuong || 0}`,
                                        `${Number(sp.gia || 0).toLocaleString()}₫`,
                                        `${Number(sp.tongTien || 0).toLocaleString()}₫`,
                                    ].map(
                                        (val) =>
                                            new TableCell({
                                                children: [new Paragraph(val)],
                                                margins: { top: 100, bottom: 100 },
                                            })
                                    ),
                                })
                            ),
                            ...[
                                ["Tạm tính", detail.tamTinh],
                                ["Giảm giá", detail.soTienGiam],
                                ["Tổng cộng", detail.tongTien],
                            ].map(([label, val]) =>
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph(label as string)],
                                            columnSpan: 5,
                                            margins: { top: 100, bottom: 100 },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph(`${(val as number)?.toLocaleString() || 0}₫`)],
                                            margins: { top: 100, bottom: 100 },
                                        }),
                                    ],
                                })
                            ),
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

// --- In hóa đơn (cơ bản) ---
export const printInvoice = () => {
    window.print();
};