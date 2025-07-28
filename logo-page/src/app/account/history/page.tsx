
"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useHoaDonByUserId } from "@/hooks/useHoaDon";
import { useSanPham } from "@/hooks/useSanPham";
import { HoaDonService } from "@/services/hoaDonService";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    ShoppingBag,
    Truck,
    CheckCircle,
    Wallet,
    Eye,
    RotateCcw,
    XCircle,
    Package,
    Clock,
    Phone
} from "lucide-react";
import { toast } from "sonner";
import { useChiTietSanPhamHoaDon } from "@/hooks/useHoaDon";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";

export default function OrderHistoryPage() {
    const { user } = useUserStore();
    const { data: orders, isLoading, error, refetch } = useHoaDonByUserId(user?.id || 0);
    const { data: sanPhams } = useSanPham();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [ordersWithDetails, setOrdersWithDetails] = useState<any[]>([]);
    const [productImages, setProductImages] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    // Get chi tiết sản phẩm for selected order
    const { data: chiTietSanPham } = useChiTietSanPhamHoaDon(selectedOrder?.id || 0);

    useEffect(() => {
        if (orders && sanPhams) {
            const ordersWithSanPhamDetails = orders.map((order: any) => {
                // Fetch chi tiết sản phẩm cho mỗi order
                const fetchChiTietForOrder = async () => {
                    try {
                        const chiTietData = await HoaDonService.getChiTietSanPhamByHoaDonId(order.id);
                        if (chiTietData && chiTietData.length > 0) {
                            const enrichedChiTiet = chiTietData.map((ct: any) => {
                                const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
                                const matched = sanPhams.find((sp: any) => sp.id === productId);
                                return {
                                    ...ct,
                                    sanPham: matched || null,
                                };
                            });

                            // Update order with chi tiết
                            setOrdersWithDetails(prev =>
                                prev.map(o =>
                                    o.id === order.id
                                        ? { ...o, chiTietSanPham: enrichedChiTiet }
                                        : o
                                )
                            );
                        }
                    } catch (error) {
                        console.error(`Lỗi lấy chi tiết cho order ${order.id}:`, error);
                    }
                };

                fetchChiTietForOrder();

                return {
                    ...order,
                    chiTietSanPham: [], // Khởi tạo rỗng, sẽ được update sau
                };
            });

            setOrdersWithDetails(ordersWithSanPhamDetails);
        }
    }, [orders, sanPhams]);

    // Update selected order with chi tiết sản phẩm when data is loaded
    useEffect(() => {
        if (selectedOrder && chiTietSanPham && sanPhams) {
            const enrichedChiTietSanPham = chiTietSanPham.map((ct) => {
                // Get productId from spId
                const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
                const matched = sanPhams.find((sp) => sp.id === productId);

                if (!matched) {
                    return {
                        ...ct,
                        sanPham: {
                            id: productId,
                            maSanPham: "N/A",
                            tenSanPham: "N/A",
                            doTuoi: 0,
                            gia: 0,
                            soLuongTon: 0,
                            trangThai: "N/A",
                            danhMucId: 0,
                            boSuuTapId: 0,
                            soLuongManhGhep: 0,
                            moTa: "",
                        },
                    };
                }

                return {
                    ...ct,
                    sanPham: matched,
                };
            });

            setSelectedOrder(prev => ({
                ...prev,
                chiTietSanPham: enrichedChiTietSanPham
            }));

            // Fetch images for products in detail
            enrichedChiTietSanPham.forEach((item) => {
                if (item.sanPham?.id) {
                    fetchProductImage(item.sanPham.id);
                }
            });
        }
    }, [chiTietSanPham, sanPhams, selectedOrder?.id]);

    const fetchProductImage = async (productId: number) => {
        if (productImages[productId]) return;

        try {
            // Lấy ảnh sản phẩm từ API
            const images = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(productId);
            if (images && images.length > 0) {
                // Tìm ảnh chính hoặc lấy ảnh đầu tiên
                const mainImg = images.find(img => img.anhChinh) || images[0];
                if (mainImg && mainImg.url) {
                    const imageUrl = `http://localhost:8080/api/anhsp/images/${mainImg.url}`;
                    setProductImages(prev => ({
                        ...prev,
                        [productId]: imageUrl
                    }));
                }
            }
        } catch (error) {
            console.error(`Lỗi lấy ảnh sản phẩm ${productId}:`, error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Statistics
    const totalOrders = ordersWithDetails.length;
    const pendingOrders = ordersWithDetails.filter(o => o.trangThai === "Chờ xác nhận").length;
    const deliveredOrders = ordersWithDetails.filter(o => o.trangThai === "Đã giao").length;
    const totalAmount = ordersWithDetails.reduce((sum, order) => sum + (order.tongTien || 0), 0);

    // Status filter options
    const statusOptions = [
        { value: "all", label: "Tất cả", count: totalOrders },
        { value: "Chờ xác nhận", label: "Đang xử lý", count: pendingOrders },
        { value: "Đã xác nhận", label: "Đã xác nhận", count: ordersWithDetails.filter(o => o.trangThai === "Đã xác nhận").length },
        { value: "Đang đóng gói", label: "Đang đóng gói", count: ordersWithDetails.filter(o => o.trangThai === "Đang đóng gói").length },
        { value: "Đang vận chuyển", label: "Đang vận chuyển", count: ordersWithDetails.filter(o => o.trangThai === "Đang vận chuyển").length },
        { value: "Đã giao", label: "Đã giao", count: deliveredOrders },
        { value: "Hoàn tất", label: "Hoàn tất", count: ordersWithDetails.filter(o => o.trangThai === "Hoàn tất").length },
        { value: "Đã hủy", label: "Đã hủy", count: ordersWithDetails.filter(o => o.trangThai === "Đã hủy").length },
    ];

    // Filter orders
    const filteredOrders = ordersWithDetails.filter(order => {
        // Status filter
        const matchesStatus = statusFilter === "all" || order.trangThai === statusFilter;

        // Date filter
        let matchesDateRange = true;
        if (dateFilter) {
            const orderDateStr = formatDateFlexible(order.ngayTao, false);
            if (orderDateStr) {
                matchesDateRange = orderDateStr >= dateFilter;
            } else {
                matchesDateRange = false;
            }
        }

        // Search filter
        let matchesKeyword = true;
        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase().trim();
            const matchesOrderCode = order.maHD?.toLowerCase().includes(keyword);
            const matchesProductName = order.chiTietSanPham?.some((item: any) =>
                item.sanPham?.tenSanPham?.toLowerCase().includes(keyword)
            );
            matchesKeyword = matchesOrderCode || matchesProductName;
        }

        return matchesStatus && matchesDateRange && matchesKeyword;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Chờ xác nhận": return "bg-yellow-100 text-yellow-800";
            case "Đã xác nhận": return "bg-blue-100 text-blue-800";
            case "Đang đóng gói": return "bg-purple-100 text-purple-800";
            case "Đang vận chuyển": return "bg-indigo-100 text-indigo-800";
            case "Đã giao": return "bg-green-100 text-green-800";
            case "Hoàn tất": return "bg-green-100 text-green-800";
            case "Đã hủy": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Handle cancel order
    const handleCancelOrder = async (orderId: number) => {
        try {
            await HoaDonService.updateTrangThai(orderId, "Đã hủy");
            toast.success("Hủy đơn hàng thành công");
            refetch();
        } catch (error) {
            toast.error("Không thể hủy đơn hàng");
        }
    };

    // Handle buy again
    const handleBuyAgain = (order: any) => {
        try {
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

            order.chiTietSanPham?.forEach((item: any) => {
                const existingItemIndex = cartItems.findIndex((cartItem: any) => cartItem.id === item.sanPham?.id);

                if (existingItemIndex >= 0) {
                    cartItems[existingItemIndex].quantity += item.soLuong;
                } else {
                    cartItems.push({
                        id: item.sanPham?.id,
                        tenSanPham: item.sanPham?.tenSanPham,
                        gia: item.sanPham?.gia,
                        quantity: item.soLuong,
                        hinhAnh: item.sanPham?.hinhAnh
                    });
                }
            });

            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            toast.success("Đã thêm sản phẩm vào giỏ hàng");
        } catch (error) {
            toast.error("Không thể thêm vào giỏ hàng");
        }
    };

    // Show order detail
    const handleViewDetail = (order: any) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    // Get action buttons based on order status
    const getActionButtons = (order: any) => {
        const buttons = [];

        // Always show view detail with yellow color
        buttons.push(
            <Button
                key="detail"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => handleViewDetail(order)}
            >
                <Eye className="w-4 h-4" />
                Xem Chi Tiết
            </Button>
        );

        // Cancel button for pending orders
        if (order.trangThai === "Chờ xác nhận") {
            buttons.push(
                <Button
                    key="cancel"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleCancelOrder(order.id)}
                >
                    <XCircle className="w-4 h-4" />
                    Hủy Đơn
                </Button>
            );
        }

        // Buy again button for completed orders
        if (order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất") {
            buttons.push(
                <Button
                    key="buyagain"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleBuyAgain(order)}
                >
                    <RotateCcw className="w-4 h-4" />
                    Mua Lại
                </Button>
            );
        }

        return buttons;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch Sử Đơn Hàng</h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Tổng Đơn Hàng</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Đang Giao</p>
                                    <p className="text-2xl font-bold text-purple-600">{pendingOrders}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Đã Giao</p>
                                    <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Tổng Chi Tiêu</p>
                                    <p className="text-2xl font-bold text-yellow-600">₫{(totalAmount / 1000000).toFixed(1)}M</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {statusOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant={statusFilter === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(option.value)}
                                className={`${statusFilter === option.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 border-gray-300"
                                    } hover:bg-blue-50`}
                            >
                                {option.label} {option.count > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {option.count}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Search and Date Filter */}
                    <div className="flex gap-4">
                        <Input
                            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-48"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                        <Card key={order.id} className="bg-white">
                            <CardContent className="p-6">
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{order.maHD}</h3>
                                            <p className="text-sm text-gray-500">
                                                Đặt ngày {formatDateFlexible(order.ngayTao, false)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={`${getStatusColor(order.trangThai)} px-3 py-1`}>
                                            {order.trangThai}
                                        </Badge>
                                        <p className="text-lg font-bold text-gray-900 mt-1">
                                            ₫{(order.tongTien || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="text-xs text-gray-600 mb-1">Tiến độ đơn hàng</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất" ? "100%" :
                                                    order.trangThai === "Đang vận chuyển" ? "75%" :
                                                        order.trangThai === "Đang đóng gói" ? "50%" :
                                                            order.trangThai === "Đã xác nhận" ? "25%" : "10%"
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất" ? "100%" :
                                            order.trangThai === "Đang vận chuyển" ? "75%" :
                                                order.trangThai === "Đang đóng gói" ? "50%" :
                                                    order.trangThai === "Đã xác nhận" ? "25%" : "10%"}
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        Sản phẩm ({order.chiTietSanPham?.length || 0})
                                    </p>
                                    <div className="space-y-2">
                                        {order.chiTietSanPham?.map((item: any, index: number) => {
                                            const pid = item.sanPham?.id;
                                            return (
                                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                    {productImages[pid] ? (
                                                        <img
                                                            src={productImages[pid]}
                                                            alt={item.sanPham?.tenSanPham}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 text-sm">
                                                            {item.sanPham?.tenSanPham || 'Sản phẩm không tồn tại'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Số lượng: {item.soLuong || 0}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium text-gray-900">
                                                        ₫{((item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {getActionButtons(order)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Detail Modal */}
                <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Chi Tiết Đơn Hàng
                            </DialogTitle>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Order Info and Status Timeline */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Order Information */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-blue-900">Thông Tin Đơn Hàng</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Mã đơn hàng:</span>
                                                <span className="font-medium text-gray-900">{selectedOrder.maHD}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Ngày đặt:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatDateFlexible(selectedOrder.ngayTao, false)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Trạng thái:</span>
                                                <Badge className={`${getStatusColor(selectedOrder.trangThai)} px-2 py-1`}>
                                                    {selectedOrder.trangThai}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tổng tiền:</span>
                                                <span className="font-bold text-blue-600 text-lg">
                                                    ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Status Timeline */}
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-orange-900">Lịch Sử Đơn Hàng</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {/* Timeline items */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">Đặt hàng thành công</p>
                                                    <p className="text-gray-500">{formatDateFlexible(selectedOrder.ngayTao, false)}</p>
                                                </div>
                                            </div>

                                            {selectedOrder.trangThai !== "Chờ xác nhận" && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">Xác nhận đơn hàng</p>
                                                        <p className="text-gray-500">Đã xác nhận</p>
                                                    </div>
                                                </div>
                                            )}

                                            {(selectedOrder.trangThai === "Đang đóng gói" ||
                                                selectedOrder.trangThai === "Đang vận chuyển" ||
                                                selectedOrder.trangThai === "Đã giao" ||
                                                selectedOrder.trangThai === "Hoàn tất") && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Package className="w-3 h-3 text-white" />
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-medium text-gray-900">Đang đóng gói</p>
                                                            <p className="text-gray-500">Đang chuẩn bị hàng</p>
                                                        </div>
                                                    </div>
                                                )}

                                            {(selectedOrder.trangThai === "Đang vận chuyển" ||
                                                selectedOrder.trangThai === "Đã giao" ||
                                                selectedOrder.trangThai === "Hoàn tất") && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Truck className="w-3 h-3 text-white" />
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-medium text-gray-900">Đang vận chuyển</p>
                                                            <p className="text-gray-500">Đang giao hàng</p>
                                                        </div>
                                                    </div>
                                                )}

                                            {(selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất") && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">Giao hàng thành công</p>
                                                        <p className="text-gray-500">Đã giao thành công</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Information */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-green-900">Thông Tin Giao Hàng</h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Địa chỉ:</span>
                                            <p className="font-medium text-gray-900">
                                                {selectedOrder.diaChiGiaoHang || "Chưa có địa chỉ"}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phương thức:</span>
                                            <span className="font-medium text-gray-900">
                                                {selectedOrder.loaiVanChuyen === 1 || selectedOrder.isFast === 1
                                                    ? "Giao hàng nhanh"
                                                    : "Giao hàng thường"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí giao hàng:</span>
                                            <span className="font-medium text-gray-900">
                                                ₫{(selectedOrder.phiShip || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedOrder.tenNguoiNhan && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Người nhận:</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedOrder.tenNguoiNhan}
                                                </span>
                                            </div>
                                        )}
                                        {selectedOrder.sdt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Số điện thoại:</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedOrder.sdt}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Products List */}
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-purple-900">
                                            Sản Phẩm ({selectedOrder.chiTietSanPham?.length || 0})
                                        </h3>
                                    </div>

                                    {selectedOrder.chiTietSanPham && selectedOrder.chiTietSanPham.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedOrder.chiTietSanPham.map((item: any, index: number) => {
                                                const pid = item.sanPham?.id;
                                                return (
                                                    <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                                                        {productImages[pid] ? (
                                                            <img
                                                                src={productImages[pid]}
                                                                alt={item.sanPham?.tenSanPham}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">
                                                                {item.sanPham?.tenSanPham || 'Sản phẩm không tồn tại'}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                Mã SP: {item.sanPham?.maSanPham || 'N/A'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Số lượng: {item.soLuong || 0}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Đơn giá: ₫{(item.gia || item.sanPham?.gia || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-purple-600">
                                                                ₫{((item.gia || item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">Không có sản phẩm nào</p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                            <Wallet className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-blue-900">Thông Tin Thanh Toán</h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tạm tính:</span>
                                            <span className="font-medium">₫{(selectedOrder.tamTinh || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-medium">₫{(selectedOrder.phiShip || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="font-medium text-green-600">-₫{(selectedOrder.soTienGiam || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between">
                                            <span className="font-bold text-gray-900">Tổng cộng:</span>
                                            <span className="font-bold text-blue-600 text-lg">₫{(selectedOrder.tongTien || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phương thức:</span>
                                            <span className="font-medium">{selectedOrder.phuongThucThanhToan || 'COD'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Support Button */}
                                <div className="flex justify-center">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Liên Hệ Hỗ Trợ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ←
                        </Button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        onClick={() => setCurrentPage(page)}
                                        className="w-10"
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            →
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không có đơn hàng nào
                        </h3>
                        <p className="text-gray-500">
                            {statusFilter === "all"
                                ? "Bạn chưa có đơn hàng nào"
                                : `Không có đơn hàng nào với trạng thái "${statusOptions.find(o => o.value === statusFilter)?.label}"`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}









