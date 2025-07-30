"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useHoaDonByUserId, useChiTietSanPhamHoaDon } from "@/hooks/useHoaDon";
import { useSanPham } from "@/hooks/useSanPham";
import { HoaDonService } from "@/services/hoaDonService";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    Truck,
    CheckCircle,
    Eye,
    XCircle,
    Package,
    Clock,
    Phone,
    Loader2,
} from "lucide-react";
import { cartService } from "@/services/cartService";

// ====== (GIẢ ĐỊNH) Cart Service: chỉnh lại path/API theo dự án ======

// Ví dụ cài đặt CartService:
// export const CartService = { addItem: (productId: number, quantity: number) => api.post("/cart/items", { productId, quantity }) };

// ====== Types ======
interface SanPham {
    id: number;
    maSanPham: string;
    tenSanPham: string;
    gia: number;
}

interface ChiTietSanPham {
    spId: number | { id: number };
    soLuong: number;
    gia?: number;
    sanPham?: SanPham | null;
}

interface BaseOrder {
    id: number;
    maHD: string;
    ngayTao: string;
    trangThai: string;
    tongTien: number;
    diaChiGiaoHang?: string;
    loaiVanChuyen?: number;
    isFast?: number;
    phiShip?: number;
    tenNguoiNhan?: string;
    sdt?: string;
    tamTinh?: number;
    soTienGiam?: number;
    phuongThucThanhToan?: string;
}

type EnrichedOrder = BaseOrder & { chiTietSanPham: ChiTietSanPham[] };

// ====== LEGO PALETTE / CLASSES (Light theme) ======
const palette = {
    pageBg: "bg-[#FFF3CC]",
    panelBg: "bg-white",
    chipBg: "bg-[#FFFAE6]",
    text: "text-[#0f172a]",
    subText: "text-slate-600",
    accent: "text-[#006DB7]",
    border: "border border-yellow-400",
    softBorder: "border border-slate-200",
    track: "bg-slate-200",
};
const badgeBase = "px-2 py-0.5 rounded-full text-xs bg-white";
const statusBadge = (status: string) => {
    switch (status) {
        case "Đang xử lý":
            return `${badgeBase} text-[#E3000B] border border-red-400`;
        case "Đã xác nhận":
            return `${badgeBase} text-[#006DB7] border border-blue-400`;
        case "Đang đóng gói":
            return `${badgeBase} text-purple-700 border border-purple-400`;
        case "Đang vận chuyển":
            return `${badgeBase} text-indigo-700 border border-indigo-400`;
        case "Đã giao":
        case "Hoàn tất":
            return `${badgeBase} text-green-700 border border-green-400`;
        case "Đã hủy":
            return `${badgeBase} text-red-700 border border-red-400`;
        default:
            return `${badgeBase} text-slate-700 border border-slate-300`;
    }
};

export default function OrderHistoryPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const { data: orders, isLoading, error, refetch } = useHoaDonByUserId(user?.id || 0);
    const { data: sanPhams } = useSanPham();

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    const [ordersWithDetails, setOrdersWithDetails] = useState<EnrichedOrder[]>([]);
    const [productImages, setProductImages] = useState<Record<number, string>>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);

    const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [reorderingId, setReorderingId] = useState<number | null>(null);

    const { data: chiTietSanPham } = useChiTietSanPhamHoaDon(selectedOrder?.id || 0);

    // --- Enrich danh sách orders bằng chi tiết + map SanPham
    useEffect(() => {
        if (orders && sanPhams) {
            const fetchDetails = async () => {
                const enrichedOrders = await Promise.all(
                    (orders as BaseOrder[]).map(async (order: BaseOrder) => {
                        try {
                            const chiTietData = await HoaDonService.getChiTietSanPhamByHoaDonId(order.id);
                            const enrichedChiTiet: ChiTietSanPham[] = chiTietData.map((ct: ChiTietSanPham) => {
                                const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
                                const matched = (sanPhams as SanPham[]).find((sp) => sp.id === productId) || null;
                                return { ...ct, sanPham: matched };
                            });
                            return { ...order, chiTietSanPham: enrichedChiTiet } as EnrichedOrder;
                        } catch (e) {
                            console.error("Error fetching details", e);
                            return { ...order, chiTietSanPham: [] } as EnrichedOrder;
                        }
                    })
                );
                setOrdersWithDetails(enrichedOrders);
            };
            fetchDetails();
        }
    }, [orders, sanPhams]);

    // --- Enrich lại selected order khi mở modal (và preload ảnh)
    useEffect(() => {
        if (selectedOrder && chiTietSanPham && sanPhams) {
            const enriched = chiTietSanPham.map((ct: ChiTietSanPham) => {
                const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
                const matched =
                    (sanPhams as SanPham[]).find((sp: SanPham) => sp.id === productId) || {
                        id: productId,
                        maSanPham: "N/A",
                        tenSanPham: "N/A",
                        gia: 0,
                    };
                return { ...ct, sanPham: matched };
            });

            setSelectedOrder((prev) => (prev ? { ...prev, chiTietSanPham: enriched } : prev));

            enriched.forEach((item) => {
                if (item.sanPham?.id) fetchProductImage(item.sanPham.id);
            });
        }
    }, [chiTietSanPham, sanPhams, selectedOrder?.id]);

    const fetchProductImage = async (productId?: number) => {
        if (!productId || productImages[productId]) return;
        try {
            const images = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(productId);
            const mainImg = images.find((img: any) => img.anhChinh) || images[0];
            if (mainImg?.url) {
                setProductImages((prev) => ({
                    ...prev,
                    [productId]: `http://localhost:8080/api/anhsp/images/${mainImg.url}`,
                }));
            }
        } catch (e) {
            console.error("Image fetch error", e);
        }
    };

    // --- Lọc
    const filteredOrders = useMemo(() => {
        return ordersWithDetails.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.trangThai === statusFilter;

            let matchesDateRange = true;
            if (dateFilter) {
                const orderDate = new Date(order.ngayTao);
                matchesDateRange =
                    !isNaN(orderDate.getTime()) && orderDate.toISOString().slice(0, 10) >= dateFilter;
            }

            const keyword = searchKeyword.toLowerCase().trim();
            const matchesKeyword = keyword
                ? order.maHD?.toLowerCase().includes(keyword) ||
                order.chiTietSanPham?.some((it) => it.sanPham?.tenSanPham?.toLowerCase().includes(keyword))
                : true;

            return matchesStatus && matchesDateRange && matchesKeyword;
        });
    }, [ordersWithDetails, statusFilter, dateFilter, searchKeyword]);

    useEffect(() => setCurrentPage(1), [itemPerPage]);

    // --- Stats
    const totalOrders = ordersWithDetails.length;
    const shippingOrders = ordersWithDetails.filter((o) => o.trangThai === "Đang vận chuyển").length;
    const deliveredOrders = ordersWithDetails.filter((o) => o.trangThai === "Đã giao").length;

    const statusOptions = [
        { value: "all", label: "Tất cả", count: totalOrders },
        { value: "Đang xử lý", label: "Đang xử lý", count: ordersWithDetails.filter((o) => o.trangThai === "Đang xử lý").length },
        { value: "Đã xác nhận", label: "Đã xác nhận", count: ordersWithDetails.filter((o) => o.trangThai === "Đã xác nhận").length },
        { value: "Đang đóng gói", label: "Đang đóng gói", count: ordersWithDetails.filter((o) => o.trangThai === "Đang đóng gói").length },
        { value: "Đang vận chuyển", label: "Đang vận chuyển", count: shippingOrders },
        { value: "Đã giao", label: "Đã giao", count: deliveredOrders },
        { value: "Hoàn tất", label: "Hoàn tất", count: ordersWithDetails.filter((o) => o.trangThai === "Hoàn tất").length },
        { value: "Đã hủy", label: "Đã hủy", count: ordersWithDetails.filter((o) => o.trangThai === "Đã hủy").length },
    ];

    // --- Handlers
    const handleCancelOrder = async (orderId: number) => {
        const ok = window.confirm("Bạn chắc chắn muốn hủy đơn này?");
        if (!ok) return;

        try {
            setCancelingId(orderId);
            await HoaDonService.updateTrangThai(orderId, "Đã hủy");
            toast.success("Hủy đơn hàng thành công");
            if (selectedOrder?.id === orderId) setShowOrderDetail(false);
            await refetch();
        } catch (e) {
            toast.error("Không thể hủy đơn hàng");
        } finally {
            setCancelingId(null);
        }
    };

    const handleConfirmDelivery = async (orderId: number) => {
        const ok = window.confirm("Bạn đã nhận được hàng và muốn xác nhận?");
        if (!ok) return;

        try {
            setCancelingId(orderId);
            await HoaDonService.updateTrangThai(orderId, "Hoàn tất");
            toast.success("Đã xác nhận giao hàng thành công");
            if (selectedOrder?.id === orderId) setShowOrderDetail(false);
            await refetch();
        } catch (e) {
            toast.error("Không thể xác nhận giao hàng");
        } finally {
            setCancelingId(null);
        }
    };

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const handleReorder = async (order: EnrichedOrder) => {
        try {
            setReorderingId(order.id);

            const items = order.chiTietSanPham || [];
            if (items.length === 0) {
                toast.info("Đơn hàng không có sản phẩm để mua lại.");
                setReorderingId(null);
                return;
            }

            await Promise.all(
                items.map((it) => {
                    const productId = typeof it.spId === "object" ? it.spId.id : it.spId;
                    const quantity = it.soLuong || 1;
                    return cartService.addToCart(productId, quantity);
                })
            );

            toast.success("Đã thêm sản phẩm vào giỏ. Đang chuyển tới giỏ hàng...");
            await sleep(3000);
            router.push("/cart");
        } catch (e) {
            console.error(e);
            toast.error("Không thể mua lại. Vui lòng thử lại.");
        } finally {
            setReorderingId(null);
        }
    };

    const handleViewDetail = (order: EnrichedOrder) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    // --- Phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    // ====== RENDER =======
    if (isLoading) {
        return (
            <div className={`min-h-screen ${palette.pageBg} flex items-center justify-center`}>
                <div className="text-center space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <div className={`text-sm ${palette.subText}`}>Đang tải lịch sử đơn hàng...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${palette.pageBg} flex items-center justify-center`}>
                <div className="text-center">
                    <p className="text-red-600">Lỗi: Không thể tải lịch sử đơn hàng</p>
                    <Button
                        onClick={() => refetch()}
                        className="mt-4 bg-[#FFD400] hover:bg-[#FFE066] text-black transition-colors duration-200"
                    >
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`text-4xl md:text-5xl font-extrabold ${palette.text} mb-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.08)]`}
                >
                    Lịch Sử Đơn Hàng
                </motion.h1>

                {/* Bộ lọc */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`${palette.panelBg} ${palette.border} rounded-2xl p-4 mb-6 shadow-[0_6px_20px_rgba(0,0,0,0.08)]`}
                >
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                        <TabsList className="flex flex-nowrap gap-2 bg-transparent overflow-x-auto">
                            {statusOptions.map((option) => (
                                <TabsTrigger
                                    key={option.value}
                                    value={option.value}
                                    className={`px-3 py-1 rounded-lg transition-all duration-300 min-w-[110px] text-center
                    ${statusFilter === option.value
                                            ? `bg-[#FFD400] text-black border border-yellow-400 shadow-sm underline`
                                            : `bg-white ${palette.subText} border border-slate-200 hover:border-yellow-300`
                                        }`}
                                >
                                    <span className="text-sm">{option.label}</span>
                                    {option.count > 0 && (
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-yellow-400 text-slate-800 bg-[#FFF8CC]">
                                            {option.count}
                                        </span>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-4 mt-4 items-center">
                        <Input
                            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 focus:border-yellow-400 focus:ring-0 text-slate-900"
                        />
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-48 bg-white border border-slate-300 focus:border-yellow-400 focus:ring-0 text-slate-900"
                        />
                    </div>
                </motion.div>

                {/* Danh sách đơn */}
                <AnimatePresence>
                    <div className="space-y-4">
                        {paginatedOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, delay: index * 0.06 }}
                            >
                                <Card className={`${palette.panelBg} ${palette.border} rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.08)]`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#FFE04D] rounded-lg flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5 text-black" />
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${palette.text}`}>{order.maHD}</h3>
                                                    <p className={`text-xs ${palette.subText}`}>Đặt ngày {formatDateFlexible(order.ngayTao, false)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={statusBadge(order.trangThai)}>{order.trangThai}</span>
                                                <p className="text-lg font-extrabold text-[#E3000B] mt-1">
                                                    ₫{(order.tongTien || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className={`text-xs ${palette.subText} mb-1`}>Tiến độ đơn hàng</div>
                                            <div className={`w-full ${palette.track} rounded-full h-3 overflow-hidden`}>
                                                <motion.div
                                                    className="bg-[#FFD400] h-3 rounded-full"
                                                    initial={{ width: "10%" }}
                                                    animate={{
                                                        width:
                                                            order.trangThai === "Đã hủy"
                                                                ? "0%"
                                                                : order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất"
                                                                    ? "100%"
                                                                    : order.trangThai === "Đang vận chuyển"
                                                                        ? "75%"
                                                                        : order.trangThai === "Đang đóng gói"
                                                                            ? "50%"
                                                                            : order.trangThai === "Đã xác nhận"
                                                                                ? "25%"
                                                                                : "10%",
                                                    }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                />
                                            </div>
                                            <div className={`text-xs ${palette.subText} mt-1`}>
                                                {order.trangThai === "Đã hủy"
                                                    ? "0%"
                                                    : order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất"
                                                        ? "100%"
                                                        : order.trangThai === "Đang vận chuyển"
                                                            ? "75%"
                                                            : order.trangThai === "Đang đóng gói"
                                                                ? "50%"
                                                                : order.trangThai === "Đã xác nhận"
                                                                    ? "25%"
                                                                    : "10%"}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="mb-4">
                                            <p className={`text-sm font-medium ${palette.text} mb-2`}>
                                                Sản phẩm ({order.chiTietSanPham?.length || 0})
                                            </p>
                                            <div className="space-y-2">
                                                {order.chiTietSanPham?.map((item, idx) => {
                                                    const pid = item.sanPham?.id;
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            className={`flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 hover:border-yellow-300`}
                                                            whileHover={{ scale: 1.01 }}
                                                            transition={{ duration: 0.15 }}
                                                        >
                                                            {productImages[pid as number] ? (
                                                                <img
                                                                    src={productImages[pid as number]}
                                                                    alt={item.sanPham?.tenSanPham || ""}
                                                                    className="w-12 h-12 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <Skeleton className="w-12 h-12 rounded-lg" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className={`font-medium ${palette.text} text-sm`}>
                                                                    {item.sanPham?.tenSanPham || "Sản phẩm không tồn tại"}
                                                                </p>
                                                                <p className={`text-xs ${palette.subText}`}>Số lượng: {item.soLuong || 0}</p>
                                                            </div>
                                                            <p className="font-semibold text-[#E3000B]">
                                                                ₫{((item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                                            </p>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    // variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 border border-yellow-300 text-black bg-[#FFD400] hover:bg-[#FFE066] transition-colors duration-200"
                                                    onClick={() => handleViewDetail(order)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Xem Chi Tiết
                                                </Button>
                                            </motion.div>

                                            {order.trangThai === "Đang xử lý" && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        // variant="outline"
                                                        size="sm"
                                                        disabled={cancelingId === order.id}
                                                        className="flex items-center gap-2 border-yellow-500 text-black bg-red-500 hover:bg-red-600 transition-colors duration-200 disabled:opacity-60"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        {cancelingId === order.id ? "Đang hủy..." : "Hủy Đơn"}
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {(order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất") && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-2 border-green-500 text-white bg-green-500 hover:bg-green-600 transition-colors duration-200"
                                                        onClick={() => handleConfirmDelivery(order.id)}
                                                        disabled={cancelingId === order.id}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        {cancelingId === order.id ? "Đang xác nhận..." : "Xác nhận đã giao hàng"}
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {(order.trangThai === "Hoàn tất" || order.trangThai === "Đã hủy") && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        // variant="outline"
                                                        size="sm"
                                                        onClick={() => handleReorder(order)}
                                                        disabled={reorderingId === order.id}
                                                        className="flex items-center gap-2 border border-yellow-400 text-black bg-white hover:bg-[#FFF3CC] transition-colors duration-200"
                                                    >
                                                        {reorderingId === order.id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Đang thêm...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingBag className="w-4 h-4" />
                                                                Mua lại
                                                            </>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>

                {/* Modal chi tiết đơn */}
                <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                    <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-yellow-400 rounded-2xl`}>
                        <DialogHeader>
                            <DialogTitle className={`text-xl font-bold ${palette.text}`}>Chi Tiết Đơn Hàng</DialogTitle>
                        </DialogHeader>

                        {selectedOrder && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Thông tin đơn */}
                                    <div className={`bg-[#FFFAE6] rounded-lg p-4 border border-yellow-300`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 bg-[#FFD400] rounded-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-black" />
                                            </div>
                                            <h3 className={`font-semibold ${palette.accent}`}>Thông Tin Đơn Hàng</h3>
                                        </div>
                                        <div className={`space-y-2 text-sm ${palette.text}`}>
                                            <div className="flex justify-between">
                                                <span className={palette.subText}>Mã đơn hàng:</span>
                                                <span className="font-medium">{selectedOrder.maHD}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className={palette.subText}>Ngày đặt:</span>
                                                <span className="font-medium">{formatDateFlexible(selectedOrder.ngayTao, false)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={palette.subText}>Trạng thái:</span>
                                                <span className={statusBadge(selectedOrder.trangThai)}>{selectedOrder.trangThai}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className={palette.subText}>Tổng tiền:</span>
                                                <span className="font-extrabold text-[#E3000B] text-lg">
                                                    ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lịch sử */}
                                    <div className={`bg-[#FFFAE6] rounded-lg p-4 border border-yellow-300`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-orange-700">Lịch Sử Đơn Hàng</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { status: "Đặt hàng thành công", date: formatDateFlexible(selectedOrder.ngayTao, false), icon: CheckCircle },
                                                ...(selectedOrder.trangThai === "Đang xử lý" ||
                                                    selectedOrder.trangThai === "Đã xác nhận" ||
                                                    selectedOrder.trangThai === "Đang đóng gói" ||
                                                    selectedOrder.trangThai === "Đang vận chuyển" ||
                                                    selectedOrder.trangThai === "Đã giao" ||
                                                    selectedOrder.trangThai === "Hoàn tất"
                                                    ? [{ status: "Đang xử lý", date: "đơn hàng đang được xử lý", icon: Clock }]
                                                    : []),
                                                ...(selectedOrder.trangThai === "Đã xác nhận"
                                                    ? [{ status: "Xác nhận đơn hàng", date: "Đã xác nhận đơn", icon: CheckCircle }]
                                                    : []),
                                                ...(selectedOrder.trangThai === "Đang đóng gói" ||
                                                    selectedOrder.trangThai === "Đang vận chuyển" ||
                                                    selectedOrder.trangThai === "Đã giao" ||
                                                    selectedOrder.trangThai === "Hoàn tất"
                                                    ? [{ status: "Đang đóng gói", date: "Đang chuẩn bị hàng", icon: Package }]
                                                    : []),
                                                ...(selectedOrder.trangThai === "Đang vận chuyển" ||
                                                    selectedOrder.trangThai === "Đã giao" ||
                                                    selectedOrder.trangThai === "Hoàn tất"
                                                    ? [{ status: "Đang vận chuyển", date: "Đang giao hàng", icon: Truck }]
                                                    : []),
                                                ...(selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất"
                                                    ? [{ status: "Giao hàng thành công", date: "Đã giao thành công", icon: CheckCircle }]
                                                    : []),
                                                ...(selectedOrder.trangThai === "Đã hủy"
                                                    ? [{ status: "Đã hủy", date: "Đơn hàng đã bị hủy", icon: XCircle }]
                                                    : []),
                                            ].map((item, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.25, delay: idx * 0.08 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                        <item.icon className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className={`font-medium ${palette.text}`}>{item.status}</p>
                                                        <p className={palette.subText}>{item.date}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Giao hàng */}
                                <div className={`bg-[#FFFAE6] rounded-lg p-4 border border-yellow-300`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-green-700">Thông Tin Giao Hàng</h3>
                                    </div>
                                    <div className={`space-y-2 text-sm ${palette.text}`}>
                                        <div>
                                            <span className={palette.subText}>Địa chỉ:</span>
                                            <p className="font-medium">{selectedOrder.diaChiGiaoHang || "Chưa có địa chỉ"}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Phương thức:</span>
                                            <span className="font-medium">
                                                {selectedOrder.loaiVanChuyen === 1 || selectedOrder.isFast === 1 ? "Giao hàng nhanh" : "Giao hàng thường"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Phí giao hàng:</span>
                                            <span className="font-medium">₫{(selectedOrder.phiShip || 0).toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.tenNguoiNhan && (
                                            <div className="flex justify-between">
                                                <span className={palette.subText}>Người nhận:</span>
                                                <span className="font-medium">{selectedOrder.tenNguoiNhan}</span>
                                            </div>
                                        )}
                                        {selectedOrder.sdt && (
                                            <div className="flex justify-between">
                                                <span className={palette.subText}>Số điện thoại:</span>
                                                <span className="font-medium">{selectedOrder.sdt}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sản phẩm */}
                                <div className={`bg-[#FFFAE6] rounded-lg p-4 border border-yellow-300`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-purple-700">
                                            Sản Phẩm ({selectedOrder.chiTietSanPham?.length || 0})
                                        </h3>
                                    </div>
                                    {selectedOrder.chiTietSanPham && selectedOrder.chiTietSanPham.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedOrder.chiTietSanPham.map((item, index) => {
                                                const pid = item.sanPham?.id;
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        className={`flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200`}
                                                        whileHover={{ scale: 1.01 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        {productImages[pid as number] ? (
                                                            <img
                                                                src={productImages[pid as number]}
                                                                alt={item.sanPham?.tenSanPham || ""}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <Skeleton className="w-16 h-16 rounded-lg" />
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className={`font-medium ${palette.text}`}>{item.sanPham?.tenSanPham || "Sản phẩm không tồn tại"}</h4>
                                                            <p className={`text-sm ${palette.subText}`}>Mã SP: {item.sanPham?.maSanPham || "N/A"}</p>
                                                            <p className={`text-sm ${palette.subText}`}>Số lượng: {item.soLuong || 0}</p>
                                                            <p className={`text-sm ${palette.subText}`}>
                                                                Đơn giá: ₫{(item.gia || item.sanPham?.gia || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-[#E3000B]">
                                                                ₫{((item.gia || item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                            <p className={`${palette.subText}`}>Không có sản phẩm nào</p>
                                        </div>
                                    )}
                                </div>

                                {/* Thanh toán + Hành động trong modal */}
                                <div className={`bg-[#FFFAE6] rounded-lg p-4 border border-yellow-300`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-[#FFD400] rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-black" />
                                        </div>
                                        <h3 className={`font-semibold ${palette.accent}`}>Thông Tin Thanh Toán</h3>
                                    </div>
                                    <div className={`space-y-2 text-sm ${palette.text}`}>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Tạm tính:</span>
                                            <span className="font-medium">₫{(selectedOrder.tamTinh || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Phí vận chuyển:</span>
                                            <span className="font-medium">₫{(selectedOrder.phiShip || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Giảm giá:</span>
                                            <span className="font-medium text-green-700">-₫{(selectedOrder.soTienGiam || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-yellow-200 pt-2 flex justify-between">
                                            <span className="font-bold">Tổng cộng:</span>
                                            <span className="font-extrabold text-[#E3000B] text-lg">
                                                ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={palette.subText}>Phương thức:</span>
                                            <span className="font-medium">{selectedOrder.phuongThucThanhToan || "COD"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                                        <Button className="bg-[#FFD400] hover:bg-[#FFE066] text-black px-6 transition-colors duration-200">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Liên Hệ Hỗ Trợ
                                        </Button>

                                        {selectedOrder.trangThai === "Đang xử lý" && (
                                            <Button
                                                variant="outline"
                                                className="border-red-500 text-white bg-red-500 hover:bg-red-600 transition-colors duration-200"
                                                disabled={cancelingId === selectedOrder.id}
                                                onClick={() => handleCancelOrder(selectedOrder.id)}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                {cancelingId === selectedOrder.id ? "Đang hủy..." : "Hủy Đơn"}
                                            </Button>
                                        )}

                                        {selectedOrder.trangThai === "Đã giao" && (
                                            <Button
                                                variant="outline"
                                                className="border-green-500 text-white bg-green-500 hover:bg-green-600 transition-colors duration-200"
                                                disabled={cancelingId === selectedOrder.id}
                                                onClick={() => handleConfirmDelivery(selectedOrder.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {cancelingId === selectedOrder.id ? "Đang xác nhận..." : "Xác nhận đã giao hàng"}
                                            </Button>
                                        )}

                                        {(selectedOrder.trangThai === "Hoàn tất" || selectedOrder.trangThai === "Đã hủy") && (
                                            <Button
                                                variant="outline"
                                                className="border border-yellow-400 text-black bg-white hover:bg-[#FFF3CC] transition-colors duration-200"
                                                disabled={reorderingId === selectedOrder.id}
                                                onClick={() => handleReorder(selectedOrder)}
                                            >
                                                {reorderingId === selectedOrder.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Đang thêm...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                                        Mua lại
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-between items-center gap-2 mt-8"
                    >
                        <div className={`text-sm ${palette.subText}`}>
                            Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors duration-200"
                            >
                                ←
                            </Button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <motion.div key={page} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                                            <Button
                                                variant={currentPage === page ? "default" : "outline"}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 ${currentPage === page
                                                    ? "bg-[#FFD400] text-black"
                                                    : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-100"
                                                    } transition-colors duration-200`}
                                            >
                                                {page}
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors duration-200"
                            >
                                →
                            </Button>
                            <Select value={itemPerPage.toString()} onValueChange={(v) => setItemPerPage(Number(v))}>
                                <SelectTrigger className="w-40 bg-white border border-slate-300 text-slate-900">
                                    <SelectValue placeholder="Số bản ghi" />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-slate-900">
                                    {[5, 10, 20, 50].map((v) => (
                                        <SelectItem key={v} value={v.toString()}>
                                            {v} bản ghi
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
