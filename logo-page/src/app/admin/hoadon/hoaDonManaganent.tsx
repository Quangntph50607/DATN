"use client";

import React, { useEffect, useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import {
    HoaDonDTO,
    HoaDonDetailDTO,
    PaymentMethods,
    TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { useSanPham } from "@/hooks/useSanPham";
import { useAccounts } from "@/hooks/useAccount";
import { toast } from "sonner";
import HoaDonFilter from "./hoaDonFilter";
import HoaDonList from "./hoaDonList";
import HoaDonDetail from "./hoaDondetail";

const PAGE_SIZE = 5;

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

function parseBackendDateToDate(date: any): Date | null {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

const mapStatusToKey = (status: string): keyof typeof TrangThaiHoaDon | undefined =>
    Object.keys(TrangThaiHoaDon).find(
        (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === status
    ) as any;

const mapPaymentToKey = (method: string): keyof typeof PaymentMethods | undefined =>
    Object.keys(PaymentMethods).find(
        (key) => PaymentMethods[key as keyof typeof PaymentMethods] === method
    ) as any;

const HoaDonManagement = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<{ content: HoaDonDTO[]; totalPages: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<HoaDonDTO | null>(null);
    const [chiTietSanPham, setChiTietSanPham] = useState<HoaDonDetailDTO[]>([]);

    const { data: sanPhams = [], error: sanPhamError } = useSanPham();
    const { data: users = [], error: userError } = useAccounts();

    const [filters, setFilters] = useState({
        keyword: "",
        trangThai: "all" as keyof typeof TrangThaiHoaDon | "all",
        phuongThuc: "all" as keyof typeof PaymentMethods | "all",
        from: "",
        to: "",
        loaiHD: "all",
    });

    useEffect(() => {
        if (sanPhamError) toast.error("Lỗi khi tải danh sách sản phẩm");
        if (userError) toast.error("Lỗi khi tải danh sách người dùng");
    }, [sanPhamError, userError]);

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

            // Keyword search
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                filtered = filtered.filter((hd) => {
                    const user = users.find((u) => u.id === hd.userId);
                    return (
                        (user?.ten?.toLowerCase().includes(kw)) ||
                        (hd.maHD?.toLowerCase().includes(kw)) ||
                        (user?.sdt?.includes(kw)) ||
                        (hd.id + "").includes(kw)
                    );
                });
            }

            if (filters.loaiHD !== "all") {
                filtered = filtered.filter((hd) => String(hd.loaiHD) === filters.loaiHD);
            }

            if (filters.trangThai !== "all") {
                const trangThaiValue = TrangThaiHoaDon[filters.trangThai];
                filtered = filtered.filter((hd) => hd.trangThai === trangThaiValue);
            }

            if (filters.phuongThuc !== "all") {
                filtered = filtered.filter((hd) => hd.phuongThucThanhToan === filters.phuongThuc);
            }

            if (filters.from) {
                const fromDate = new Date(filters.from);
                filtered = filtered.filter((hd) => {
                    const d = parseBackendDateToDate(hd.ngayTao);
                    return d && d >= fromDate;
                });
            }

            if (filters.to) {
                const toDate = new Date(filters.to);
                filtered = filtered.filter((hd) => {
                    const d = parseBackendDateToDate(hd.ngayTao);
                    return d && d <= toDate;
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
            const user = users.find((u) => u.id === detail.userId) || null;

            setDetail({
                ...detail,
                trangThai: mapStatusToKey(detail.trangThai)
                    ? TrangThaiHoaDon[mapStatusToKey(detail.trangThai)!]
                    : detail.trangThai,
                phuongThucThanhToan: mapPaymentToKey(detail.phuongThucThanhToan) || detail.phuongThucThanhToan,
                user,
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

            />

            <HoaDonDetail
                open={open}
                onClose={() => setOpen(false)}
                detail={detail}
                chiTietSanPham={chiTietSanPham}
                sanPhams={sanPhams}
                users={users}
                loadingDetail={false}
            />
        </div>
    );
};

export default HoaDonManagement;
