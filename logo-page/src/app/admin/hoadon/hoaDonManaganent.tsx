"use client";

import React, { useEffect, useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon, PaymentMethods, HoaDonDetailDTO } from "@/components/types/hoaDon-types";
import { useSanPham } from "@/hooks/useSanPham";
import HoaDonFilter from "./hoaDonFilter";
import { toast } from "sonner";
import HoaDonList from "./hoaDonList";
import HoaDonDetail from "./hoaDondetail";
import { useAccounts } from "@/hooks/useAccount";

const PAGE_SIZE = 10;

function isValidTrangThaiTransition(current: string, next: string): boolean {
    const currentKey = Object.keys(TrangThaiHoaDon).find(
        (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === current
    );
    const nextKey = Object.keys(TrangThaiHoaDon).find(
        (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === next
    );

    if (!currentKey || !nextKey) return false;

    switch (currentKey) {
        case "PENDING":
            return nextKey === "PROCESSING" || nextKey === "CANCELLED";
        case "PROCESSING":
            return nextKey === "PACKING";
        case "PACKING":
            return nextKey === "SHIPPED";
        case "SHIPPED":
            return nextKey === "DELIVERED" || nextKey === "FAILED";
        case "DELIVERED":
            return nextKey === "COMPLETED";
        case "FAILED":
            return nextKey === "CANCELLED" || nextKey === "PENDING";
        default:
            return false;
    }
}

function parseBackendDate(date: any): string {
    if (!date) return "N/A";
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        const parsedDate = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
        return !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString("vi-VN") : "N/A";
    }
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toLocaleString("vi-VN") : "N/A";
}

const mapStatusToKey = (status: string): keyof typeof TrangThaiHoaDon | undefined =>
    Object.keys(TrangThaiHoaDon).find((key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === status) as any;

const mapPaymentToKey = (method: string): keyof typeof PaymentMethods | undefined =>
    Object.keys(PaymentMethods).find((key) => PaymentMethods[key as keyof typeof PaymentMethods] === method) as any;

const HoaDonManagement = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<{ content: HoaDonDTO[]; totalPages: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<HoaDonDTO | null>(null);
    const [chiTietSanPham, setChiTietSanPham] = useState<HoaDonDetailDTO[]>([]);

    // Sử dụng hook useSanPham để lấy danh sách sản phẩm
    const { data: sanPhams = [], isLoading: loadingSanPhams, error: sanPhamError } = useSanPham();

    // Sử dụng hook useAccounts để lấy danh sách người dùng
    const { data: users = [], isLoading: loadingUsers, error: userError } = useAccounts();

    const [filters, setFilters] = useState({
        keyword: "",
        trangThai: "all" as keyof typeof TrangThaiHoaDon | "all",
        phuongThuc: "all" as keyof typeof PaymentMethods | "all",
        from: "",
        to: "",
    });

    // Xử lý lỗi khi lấy sản phẩm
    useEffect(() => {
        if (sanPhamError) {
            toast.error("Lỗi khi tải danh sách sản phẩm");
        }
    }, [sanPhamError]);

    // Xử lý lỗi khi lấy người dùng
    useEffect(() => {
        if (userError) {
            toast.error("Lỗi khi tải danh sách người dùng");
        }
    }, [userError]);

    const fetchData = async () => {
        try {
            const allPaged = await HoaDonService.getPagedHoaDons(0, 1000);
            let filtered = allPaged.content.map((hd: any) => ({
                ...hd,
                trangThai: mapStatusToKey(hd.trangThai)
                    ? TrangThaiHoaDon[mapStatusToKey(hd.trangThai)!]
                    : hd.trangThai,
                phuongThucThanhToan: mapPaymentToKey(hd.phuongThucThanhToan) || hd.phuongThucThanhToan,
            }));

            // Tìm kiếm từ khóa
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                filtered = filtered.filter(
                    (hd) => {
                        const user = users.find((u) => u.id === hd.userId);
                        return (
                            (user?.ten?.toLowerCase().includes(kw)) ||
                            (hd.maHD?.toLowerCase().includes(kw)) ||
                            (user?.sdt?.includes(kw)) ||
                            (hd.id + "").includes(kw)
                        );
                    }
                );
            }

            // Lọc trạng thái
            if (filters.trangThai !== "all") {
                const trangThaiValue = TrangThaiHoaDon[filters.trangThai];
                filtered = filtered.filter((hd) => hd.trangThai === trangThaiValue);
            }

            // Lọc phương thức thanh toán
            if (filters.phuongThuc !== "all") {
                filtered = filtered.filter((hd) => hd.phuongThucThanhToan === filters.phuongThuc);
            }

            // Lọc ngày
            if (filters.from) {
                const fromDate = new Date(filters.from);
                filtered = filtered.filter((hd) => {
                    const d = parseBackendDate(hd.ngayTao);
                    return d && new Date(d) >= fromDate;
                });
            }

            if (filters.to) {
                const toDate = new Date(filters.to);
                filtered = filtered.filter((hd) => {
                    const d = parseBackendDate(hd.ngayTao);
                    return d && new Date(d) <= toDate;
                });
            }

            const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
            const content = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
            setData({ content, totalPages });
        } catch (e: any) {
            toast.error(`Lỗi tải dữ liệu: ${e.message}`);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, filters, users]);

    const handleViewDetail = async (id: number) => {
        try {
            setOpen(true);
            const detail = await HoaDonService.getHoaDonById(id);
            const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(id);
            setDetail({
                ...detail,
                trangThai: mapStatusToKey(detail.trangThai)
                    ? TrangThaiHoaDon[mapStatusToKey(detail.trangThai)!]
                    : detail.trangThai,
                phuongThucThanhToan: mapPaymentToKey(detail.phuongThucThanhToan) || detail.phuongThucThanhToan,
            });
            setChiTietSanPham(chiTiet);
        } catch {
            toast.error("Lỗi khi xem chi tiết");
        }
    };

    const handleStatusChange = async (id: number, current: string, next: string) => {
        if (!isValidTrangThaiTransition(current, next)) {
            toast.error(`Không thể chuyển từ "${current}" sang "${next}"`);
            return;
        }
        try {
            await HoaDonService.updateTrangThai(id, next);
            toast.success(`Cập nhật trạng thái thành công`);
            fetchData();
        } catch (e) {
            toast.error(`Cập nhật trạng thái thất bại`);
        }
    };

    return (
        <div className="space-y-6">
            <HoaDonFilter
                filters={filters}
                setFilters={setFilters}
                fetchData={fetchData}
                setPage={setPage}
                hoaDons={data?.content || []}
            />

            <HoaDonList
                data={data}
                page={page}
                setPage={setPage}
                handleViewDetail={handleViewDetail}
                handleStatusChange={handleStatusChange}
                PAGE_SIZE={PAGE_SIZE}
                isValidTrangThaiTransition={isValidTrangThaiTransition}
                users={users} // Truyền users vào HoaDonList
            />

            <HoaDonDetail
                open={open}
                onClose={() => setOpen(false)}
                detail={detail}
                chiTietSanPham={chiTietSanPham}
                sanPhams={sanPhams}
                users={users} // Truyền danh sách users vào HoaDonDetail
                loadingDetail={false}
            />
        </div>
    );
};

export default HoaDonManagement;