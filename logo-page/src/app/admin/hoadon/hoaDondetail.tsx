"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { HoaDonDetailDTO, HoaDonDTO, PaymentMethods, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { DTOUser } from "@/components/types/account.type";
import { SanPham } from "@/components/types/product.type";
import { exportInvoiceToExcel, exportInvoiceToDocx, printInvoice } from "./invoiceUtils";
import { useSanPham } from "@/hooks/useSanPham"; // Giả sử bạn đã định nghĩa hook này

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    detail: HoaDonDTO | null;
    loadingDetail: boolean;
    chiTietSanPham: HoaDonDetailDTO[];
    sanPhams: SanPham[];
    users: DTOUser[];
}

const getUserById = (users: DTOUser[], userId?: number) => {
    const map = new Map(users.map((u) => [u.id, u]));
    return userId ? map.get(userId) : undefined;
};

const parseBackendDate = (date: any): string => {
    try {
        if (Array.isArray(date)) {
            const [y, m, d, h = 0, min = 0, s = 0] = date;
            return new Date(y, m - 1, d, h, min, s).toLocaleString("vi-VN");
        }
        return new Date(date).toLocaleString("vi-VN");
    } catch {
        return "N/A";
    }
};

const getStatusLabel = (status: string) => TrangThaiHoaDon[status as keyof typeof TrangThaiHoaDon] || status;

const getStatusStyle = (status: string) => {
    switch (status) {
        case TrangThaiHoaDon.PENDING:
            return "bg-yellow-500 text-white";
        case TrangThaiHoaDon.PROCESSING:
            return "bg-orange-400 text-white";
        case TrangThaiHoaDon.PACKING:
            return "bg-purple-500 text-white";
        case TrangThaiHoaDon.COMPLETED:
            return "bg-blue-500 text-white";
        case TrangThaiHoaDon.SHIPPED:
            return "bg-orange-500 text-white";
        case TrangThaiHoaDon.DELIVERED:
            return "bg-green-600 text-white";
        case TrangThaiHoaDon.CANCELLED:
            return "bg-red-500 text-white";
        case TrangThaiHoaDon.FAILED:
            return "bg-red-600 text-white";
        default:
            return "bg-gray-600 text-white";
    }
};

const format = (val?: number | null) => `${val?.toLocaleString("vi-VN") || "0"}₫`;

export default function HoaDonDetail({ open, onOpenChange, detail, loadingDetail, chiTietSanPham, sanPhams, users }: Props) {
    const user = getUserById(users, detail?.userId);

    const enrichedChiTietSanPham = chiTietSanPham.map((ct) => {
        // Lấy productId từ spId
        const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
        const matched = sanPhams.find((sp) => sp.id === productId);

        // Log để kiểm tra matching
        console.log(`Processing spId: ${productId}, matched:`, matched);

        // Nếu không tìm thấy sản phẩm, trả về giá trị mặc định
        if (!matched) {
            console.warn(`Không tìm thấy sản phẩm cho spId: ${productId}`);
            return {
                ...ct,
                spId: {
                    id: productId,
                    maSanPham: "N/A",
                    tenSanPham: "N/A",
                },
            };
        }

        return {
            ...ct,
            spId: {
                id: productId,
                maSanPham: matched.maSanPham ?? "N/A",
                tenSanPham: matched.tenSanPham ?? "N/A",
            },
        };
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[95vh] dark:bg-gray-900 text-white overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">
                        Chi tiết hóa đơn <span className="text-blue-400">#{detail?.maHD || "N/A"}</span>
                    </DialogTitle>
                </DialogHeader>

                {loadingDetail ? (
                    <div className="text-center py-16 text-gray-300">Đang tải...</div>
                ) : (
                    <ScrollArea className="h-[75vh] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                            <div className="space-y-2">
                                <Info label="Mã hóa đơn" value={detail?.maHD || "N/A"} />
                                <Info label="Ngày tạo" value={parseBackendDate(detail?.ngayTao)} />
                                <Info
                                    label="Trạng thái"
                                    value={<Badge className={getStatusStyle(detail?.trangThai || "")}>{getStatusLabel(detail?.trangThai || "")}</Badge>}
                                />
                                <Info label="Phương thức" value={detail?.phuongThucThanhToan ? PaymentMethods[detail.phuongThucThanhToan] : "N/A"} />
                                <Info label="Tạm tính" value={format(detail?.tamTinh)} />
                                <Info label="Giảm giá" value={format(detail?.soTienGiam)} />
                                <Info label="Tổng tiền" value={<span className="text-green-400 font-semibold">{format(detail?.tongTien)}</span>} />
                            </div>
                            <div className="space-y-2">
                                <Info label="Khách hàng" value={user?.ten || "N/A"} />
                                <Info label="SĐT" value={user?.sdt || "N/A"} />
                                <Info label="Địa chỉ" value={detail?.diaChiGiaoHang || "N/A"} />
                                <Info label="Mã VC" value={detail?.maVanChuyen || "N/A"} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mb-4">
                            <Button variant="outline" onClick={() => exportInvoiceToExcel(detail, enrichedChiTietSanPham, users)}>
                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                            </Button>
                            <Button variant="outline" onClick={() => exportInvoiceToDocx(detail, enrichedChiTietSanPham, users)}>
                                <FileText className="w-4 h-4 mr-2" /> DOCX
                            </Button>
                            <Button variant="outline" onClick={printInvoice}>
                                <Printer className="w-4 h-4 mr-2" /> In
                            </Button>
                        </div>

                        <Separator className="my-2" />
                        <h3 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h3>
                        <div className="overflow-auto border rounded-md">
                            <table className="min-w-full table-auto text-sm">
                                <thead className="bg-muted text-left">
                                    <tr>
                                        <th className="p-2">STT</th>
                                        <th className="p-2">Mã SP</th>
                                        <th className="p-2">Tên SP</th>
                                        <th className="p-2">SL</th>
                                        <th className="p-2">Đơn giá</th>
                                        <th className="p-2">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrichedChiTietSanPham.map((item, idx) => (
                                        <tr key={item.id || idx} className="border-t">
                                            <td className="p-2">{idx + 1}</td>
                                            <td className="p-2">{item.spId.maSanPham}</td>
                                            <td className="p-2">{item.spId.tenSanPham}</td>
                                            <td className="p-2 text-center">{item.soLuong}</td>
                                            <td className="p-2 text-right">{format(item.gia)}</td>
                                            <td className="p-2 text-right">{format(item.tongTien)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between">
        <span className="font-semibold text-gray-300">{label}:</span>
        <span className="text-gray-200">{value}</span>
    </div>
);