"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import OrderFilter from "./OrderFilter";
import StatusCardList from "./StatusCardList";
import OrderTable from "./OrderTable";
import { toast } from "sonner";

export default function TrangThaiHoaDonPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterPayment, setFilterPayment] = useState("ALL");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [hoaDonData, setHoaDonData] = useState<{ content: HoaDonDTO[]; totalPages: number } | null>(null);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 5;

    // 🔄 Gọi API lấy danh sách hóa đơn
    const fetchHoaDons = useCallback(() => {
        setLoading(true);
        HoaDonService.getPagedHoaDons(page, PAGE_SIZE)
            .then((res) => {
                setHoaDonData({ content: res.content, totalPages: res.totalPages });
            })
            .catch((err) => {
                console.error("Lỗi khi tải hóa đơn:", err);
                toast.error("Không thể tải dữ liệu hóa đơn.");
            })
            .finally(() => setLoading(false));
    }, [page]);

    // 🔄 Gọi API thống kê trạng thái
    const fetchStatusCounts = useCallback(() => {
        HoaDonService.getStatusCounts()
            .then((res) => {
                setStatusCounts(res);
            })
            .catch((err) => {
                console.error("Lỗi thống kê trạng thái:", err);
                toast.error("Không thể lấy thống kê trạng thái.");
            });
    }, []);

    useEffect(() => {
        fetchHoaDons();
        fetchStatusCounts();
    }, [fetchHoaDons, fetchStatusCounts]);

    // 📦 Lọc dữ liệu
    const filteredData = useMemo(() => {
        if (!hoaDonData) return [];

        const searchText = search.toLowerCase();

        return hoaDonData.content.filter((o) => {
            //  Map từ label (tiếng Việt) → enumKey (ví dụ: "Đang xử lý" → "PROCESSING")
            const statusKey = Object.entries(TrangThaiHoaDon).find(
                ([_, label]) => label === o.trangThai
            )?.[0].toUpperCase();

            const matchesStatus = filterStatus === "ALL" || statusKey === filterStatus;
            const matchesPayment = filterPayment === "ALL" || o.phuongThucThanhToan === filterPayment;

            const matchesSearch =
                !search ||
                o.ten?.toLowerCase().includes(searchText) ||
                o.maHD?.toLowerCase().includes(searchText) ||
                o.diaChi?.toLowerCase().includes(searchText) ||
                o.maVanChuyen?.toLowerCase().includes(searchText);

            return matchesStatus && matchesPayment && matchesSearch;
        });
    }, [hoaDonData, filterStatus, filterPayment, search]);

    // 👆 Xử lý khi chọn trạng thái
    const handleCardClick = (status: string) => {
        setFilterStatus((prev) => (prev === status ? "ALL" : status));
        setPage(0);
    };

    // 👁️ Xem chi tiết hóa đơn
    const handleViewDetail = (id: number) => {
        toast.info(`📄 Xem chi tiết hóa đơn #${id}`);
    };

    return (
        <div className="min-h-screen bg-[#181e29] py-8 px-2 md:px-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-10 tracking-tight drop-shadow">
                Quản lý trạng thái đơn hàng
            </h1>

            <StatusCardList
                statusCounts={statusCounts}
                filterStatus={filterStatus}
                onCardClick={handleCardClick}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <OrderFilter
                    search={search}
                    setSearch={setSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filterPayment={filterPayment}
                    setFilterPayment={setFilterPayment}
                    orders={hoaDonData?.content || []}
                    setPage={setPage}
                />
            </div>

            <OrderTable
                data={{ content: filteredData, totalPages: hoaDonData?.totalPages || 1 }}
                page={page}
                setPage={setPage}
                handleViewDetail={handleViewDetail}
                PAGE_SIZE={PAGE_SIZE}
                fetchData={() => {
                    fetchHoaDons();
                    fetchStatusCounts(); // ✅ load lại thống kê
                }}
            />

            {loading && <div className="text-white text-center mt-4">Đang tải dữ liệu...</div>}
        </div>
    );
}
