"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import OrderFilter from "./OrderFilter";
import StatusCardList from "./StatusCardList";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import OrderTable from "./OrderTable";

export default function TrangThaiHoaDonPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterPayment, setFilterPayment] = useState("ALL");
    const [hoaDonData, setHoaDonData] = useState<{ content: HoaDonDTO[]; totalPages: number } | null>(null);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<{
        id: number;
        current: string;
        next: string;
    } | null>(null);
    const PAGE_SIZE = 5;

    // 🔄 Gọi API lấy danh sách hóa đơn
    const fetchHoaDons = useCallback(() => {
        setLoading(true);
        HoaDonService.getPagedHoaDons(0, 1000) // lấy hết để lọc/phân trang phía client
            .then((res) => {
                setHoaDonData({ content: res.content, totalPages: res.totalPages });
            })
            .catch((err) => {
                console.error("Lỗi khi tải hóa đơn:", err);
                toast.error("Không thể tải dữ liệu hóa đơn.");
            })
            .finally(() => setLoading(false));
    }, []);

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

    // 📦 Lọc dữ liệu và phân trang ở đây
    const filteredData = useMemo(() => {
        if (!hoaDonData) return [];

        const searchText = search.toLowerCase();

        const filtered = hoaDonData.content.filter((o) => {
            const statusKey = Object.entries(TrangThaiHoaDon).find(
                ([_, label]) => label === o.trangThai
            )?.[0].toUpperCase();

            const matchesStatus = filterStatus === "ALL" || statusKey === filterStatus;
            const matchesPayment = filterPayment === "ALL" || o.phuongThucThanhToan === filterPayment;

            const matchesSearch =
                !search ||
                o.ten?.toLowerCase().includes(searchText) ||
                o.maHD?.toLowerCase().includes(searchText) ||
                o.maVanChuyen?.toLowerCase().includes(searchText);

            return matchesStatus && matchesPayment && matchesSearch;
        });

        // Phân trang tại đây
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filtered.slice(start, end);
    }, [hoaDonData, filterStatus, filterPayment, search, page, PAGE_SIZE]);

    // Tổng số trang sau khi lọc
    const totalFilteredPages = useMemo(() => {
        if (!hoaDonData) return 1;
        const searchText = search.toLowerCase();
        const filtered = hoaDonData.content.filter((o) => {
            const statusKey = Object.entries(TrangThaiHoaDon).find(
                ([_, label]) => label === o.trangThai
            )?.[0].toUpperCase();

            const matchesStatus = filterStatus === "ALL" || statusKey === filterStatus;
            const matchesPayment = filterPayment === "ALL" || o.phuongThucThanhToan === filterPayment;

            const matchesSearch =
                !search ||
                o.ten?.toLowerCase().includes(searchText) ||
                o.maHD?.toLowerCase().includes(searchText) ||
                o.diaChiGiaoHang?.toLowerCase().includes(searchText) ||
                o.maVanChuyen?.toLowerCase().includes(searchText);

            return matchesStatus && matchesPayment && matchesSearch;
        });
        return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    }, [hoaDonData, filterStatus, filterPayment, search, PAGE_SIZE]);

    // 👆 Xử lý khi chọn trạng thái
    const handleCardClick = (status: string) => {
        setFilterStatus((prev) => (prev === status ? "ALL" : status));
        setPage(0);
    };

    // 👁️ Xem chi tiết hóa đơn
    const handleViewDetail = (id: number) => {
        toast.info(`📄 Xem chi tiết hóa đơn #${id}`);
    };

    // Cập nhật trạng thái hóa đơn
    const isValidTrangThaiTransition = (current: string, next: string): boolean => {
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
    };

    // Sử dụng AlertDialog thay cho window.confirm
    const handleStatusUpdate = (id: number, currentStatus: string, nextStatus: string) => {
        if (!isValidTrangThaiTransition(currentStatus, nextStatus)) {
            toast.warning("⚠️ Chuyển trạng thái không hợp lệ!");
            return;
        }
        setPendingStatus({ id, current: currentStatus, next: nextStatus });
        setDialogOpen(true);
    };

    const onConfirmChange = async () => {
        if (!pendingStatus) return;
        try {
            const response = await HoaDonService.updateTrangThai(
                pendingStatus.id,
                pendingStatus.next
            );
            if (response?.trangThai) {
                toast.success("✅ Cập nhật trạng thái thành công!");
                fetchHoaDons();
                fetchStatusCounts();
            } else {
                throw new Error("Trạng thái trả về không hợp lệ.");
            }
        } catch (err: any) {
            toast.error(`❌ Lỗi cập nhật: ${err.message || "Không xác định"}`);
        } finally {
            setDialogOpen(false);
            setPendingStatus(null);
        }
    };

    return (
        <Card className="p-4 bg-gray-800 shadow-md max-h-screen w-full h-full">
            {/* AlertDialog xác nhận chuyển trạng thái */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận chuyển trạng thái</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn chuyển trạng thái từ{" "}
                            <b>{pendingStatus?.current}</b> sang{" "}
                            <b>{pendingStatus?.next}</b>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmChange}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                    PAGE_SIZE={PAGE_SIZE}
                />
            </div>

            {/* Tách phần bảng và phân trang sang OrderTable */}
            <OrderTable
                data={{ content: filteredData, totalPages: totalFilteredPages }}
                page={page}
                setPage={setPage}
                PAGE_SIZE={PAGE_SIZE}
                handleStatusUpdate={handleStatusUpdate}
                isValidTrangThaiTransition={isValidTrangThaiTransition}
            />
        </Card>
    );
}
