
"use client";

import { useHoaDonByUserId, useChiTietSanPhamHoaDon } from "@/hooks/useHoaDon";
import { useSanPham } from "@/hooks/useSanPham";
import { useAnhSanPhamTheoSanPhamId } from "@/hooks/useAnhSanPham";
import { useUserStore } from "@/context/authStore.store";
import { useState, useEffect } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Search, Calendar, X, Trash2 } from "lucide-react";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { TrangThaiHoaDon } from "@/components/types/hoaDon-types";

export default function OrderHistoryPage() {
    const { user } = useUserStore();
    const { data: orders, isLoading, error } = useHoaDonByUserId(user?.id || 0);
    const { data: sanPhams } = useSanPham();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [ordersWithDetails, setOrdersWithDetails] = useState<any[]>([]);
    const [productImages, setProductImages] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);

    // Advanced search states
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);

    // Lấy chi tiết sản phẩm và ảnh cho từng hóa đơn
    useEffect(() => {
        if (orders && orders.length > 0 && sanPhams) {
            const fetchOrderDetails = async () => {
                const ordersWithDetailsData = await Promise.all(
                    orders.map(async (order) => {
                        try {
                            const chiTietSanPham = await HoaDonService.getChiTietSanPhamByHoaDonId(order.id);

                            // Enrich chi tiết với thông tin sản phẩm
                            const enrichedChiTiet = chiTietSanPham.map((item: any) => {
                                const productId = typeof item.spId === "object" ? item.spId.id : item.spId;
                                const sanPham = sanPhams.find(sp => sp.id === productId);

                                return {
                                    ...item,
                                    sanPham: sanPham || {
                                        id: productId,
                                        tenSanPham: "Sản phẩm không tồn tại",
                                        gia: 0
                                    }
                                };
                            });

                            return {
                                ...order,
                                chiTietSanPham: enrichedChiTiet || []
                            };
                        } catch (error) {
                            console.error(`Lỗi lấy chi tiết hóa đơn ${order.id}:`, error);
                            return {
                                ...order,
                                chiTietSanPham: []
                            };
                        }
                    })
                );
                setOrdersWithDetails(ordersWithDetailsData);

                // Lấy ảnh cho các sản phẩm (đảm bảo fetch cho mọi productId duy nhất)
                const fetchedProductIds = new Set<number>();
                ordersWithDetailsData.forEach(order => {
                    order.chiTietSanPham?.forEach((item: any) => {
                        const productId = item.sanPham?.id;
                        if (productId && !productImages[productId] && !fetchedProductIds.has(productId)) {
                            fetchedProductIds.add(productId);
                            fetchProductImage(productId);
                        }
                    });
                });
            };

            fetchOrderDetails();
        }
    }, [orders, sanPhams]);

    const fetchProductImage = async (productId: number) => {
        try {
            // Lấy danh sách ảnh theo id sản phẩm (giống SanPhamList)
            const response = await fetch(`http://localhost:8080/api/anhsp/sanpham/${productId}`);
            if (response.ok) {
                const images = await response.json();
                if (images && images.length > 0) {
                    const mainImage = typeof images[0] === 'string' ? images[0] : images[0]?.tenAnh || images[0]?.url;
                    if (mainImage) {
                        const blob = await getAnhByFileName(mainImage);
                        const imageUrl = URL.createObjectURL(blob);
                        setProductImages(prev => ({
                            ...prev,
                            [productId]: imageUrl
                        }));
                    }
                }
            }
        } catch (error) {
            console.error(`Lỗi lấy ảnh sản phẩm ${productId}:`, error);
        }
    };

    if (isLoading) return <div className="text-black bg-white p-4">Đang tải lịch sử mua hàng...</div>;
    if (error) return <div className="text-black bg-white p-4">Lỗi tải dữ liệu</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Đã giao":
                return "text-green-600";
            case "Đang vận chuyển":
                return "text-orange-500";
            case "Chờ xác nhận":
                return "text-blue-600";
            case "Đã hủy":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Đã giao":
                return "✅";
            case "Đang vận chuyển":
                return "🚚";
            default:
                return "";
        }
    };

    const filteredOrders = ordersWithDetails?.filter(order => {
        // Filter by status
        const matchesStatus = statusFilter === "all" || order.trangThai === statusFilter;

        // Filter by date range (ngày đặt hàng)
        let matchesDateRange = true;
        if (fromDate || toDate) {
            // Handle different date formats from backend
            let orderDateStr = "";
            if (Array.isArray(order.ngayTao)) {
                // Backend array format: [year, month, day, hour, minute, second, nano]
                const [year, month, day] = order.ngayTao;
                if (year && month && day) {
                    orderDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                }
            } else if (order.ngayTao) {
                // String format
                const orderDate = new Date(order.ngayTao);
                if (!isNaN(orderDate.getTime())) {
                    orderDateStr = orderDate.toISOString().split('T')[0];
                }
            }

            if (orderDateStr) {
                if (fromDate && toDate) {
                    matchesDateRange = orderDateStr >= fromDate && orderDateStr <= toDate;
                } else if (fromDate) {
                    matchesDateRange = orderDateStr >= fromDate;
                } else if (toDate) {
                    matchesDateRange = orderDateStr <= toDate;
                }
            } else {
                matchesDateRange = false; // Invalid date should not match
            }
        }

        // Filter by search keyword
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
    }) || [];

    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    if (!ordersWithDetails || ordersWithDetails.length === 0) {
        return (
            <div className="bg-gray-100 min-h-screen p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch Sử Mua Hàng</h1>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header với gradient đẹp */}
                {/* <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        📦 Quản Lý Đơn Hàng
                    </h1>
                    <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
                </div> */}

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-8">
                    {/* Status Tabs với số lượng */}
                    <div className="mb-8">
                        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-xl">
                                <TabsTrigger
                                    value="all"
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Tất cả</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.PENDING}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đang xử lý</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.PENDING).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.PROCESSING}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đã xác nhận</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.PROCESSING).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.PACKING}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đang đóng gói</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.PACKING).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.SHIPPED}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đang vận chuyển</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.SHIPPED).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.DELIVERED}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đã giao</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.DELIVERED).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.COMPLETED}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Hoàn tất</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.COMPLETED).length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={TrangThaiHoaDon.CANCELLED}
                                    className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <span> Đã hủy</span>
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                                        {ordersWithDetails?.filter(o => o.trangThai === TrangThaiHoaDon.CANCELLED).length || 0}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Advanced Search với design đẹp hơn */}
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                Tìm kiếm nâng cao
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            >
                                {showAdvancedSearch ? " Thu gọn" : " Mở rộng"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder=" Tìm theo mã đơn hàng hoặc tên sản phẩm..."
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 text-black bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                />
                            </div>

                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="date"
                                    placeholder=" Từ ngày đặt"
                                    value={fromDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 text-black bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                />
                            </div>

                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="date"
                                    placeholder=" Đến ngày đặt"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 text-black bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchKeyword("");
                                    setFromDate("");
                                    setToDate("");
                                    setCurrentPage(1);
                                }}
                                className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-105"
                                disabled={!searchKeyword && !fromDate && !toDate}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                        </div>

                        {showAdvancedSearch && (
                            <div className="border-t border-blue-200 pt-4 mt-4">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-sm text-gray-600 font-medium">🏷️ Bộ lọc đang áp dụng:</span>

                                    {searchKeyword && (
                                        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                            <span>Từ khóa: "{searchKeyword}"</span>
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-blue-600 transition-colors"
                                                onClick={() => setSearchKeyword("")}
                                            />
                                        </div>
                                    )}

                                    {fromDate && (
                                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                            <span> Từ: {fromDate}</span>
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-green-600 transition-colors"
                                                onClick={() => setFromDate("")}
                                            />
                                        </div>
                                    )}

                                    {toDate && (
                                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                            <span> Đến: {toDate}</span>
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-green-600 transition-colors"
                                                onClick={() => setToDate("")}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-blue-500 text-xl font-medium mb-2">
                                {statusFilter === "all"
                                    ? " Bạn chưa có đơn hàng nào"
                                    : ` Không có đơn hàng ở trạng thái này`
                                }
                            </p>
                            <p className="text-blue-400 text-sm">
                                {statusFilter !== "all" && " Hãy thử chọn tab khác để xem đơn hàng"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-semibold">Mã Đơn</th>
                                                <th className="text-left py-4 px-6 font-semibold">Ngày Đặt</th>
                                                <th className="text-left py-4 px-6 font-semibold">Sản Phẩm</th>
                                                <th className="text-left py-4 px-6 font-semibold">Số Lượng</th>
                                                <th className="text-left py-4 px-6 font-semibold">Tổng Tiền</th>
                                                {statusFilter === "all" && (
                                                    <th className="text-left py-4 px-6 font-semibold">Trạng Thái</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedOrders.map((order, index) => (
                                                <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-150`}>
                                                    <td className="py-4 px-6 text-gray-900 font-bold">
                                                        <span className="bg-gray-50 text-gray-800 px-3 py-1 rounded text-sm font-bold">
                                                            #{order.maHD}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-800">
                                                        <span className="bg-gray-50 px-3 py-1 rounded text-sm">
                                                            {formatDateFlexible(order.ngayTao, false)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-900">
                                                        {order.chiTietSanPham && order.chiTietSanPham.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {order.chiTietSanPham.map((item: any, index: number) => {
                                                                    const pid = item.sanPham?.id;
                                                                    return (
                                                                        <div key={index} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200">
                                                                            {productImages[pid] ? (
                                                                                <img
                                                                                    src={productImages[pid]}
                                                                                    alt={item.sanPham?.tenSanPham}
                                                                                    className="w-10 h-10 object-cover rounded border"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border">
                                                                                    <span className="text-gray-300 text-xs font-bold">No Image</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium text-gray-900 text-sm">
                                                                                    {item.sanPham?.tenSanPham || 'Tên sản phẩm không có'}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    Giá: {(item.sanPham?.gia || 0).toLocaleString()}₫
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic bg-gray-50 px-3 py-1 rounded">Không có sản phẩm</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-blue-900">
                                                        {order.chiTietSanPham && order.chiTietSanPham.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {order.chiTietSanPham.map((item: any, index: number) => (
                                                                    <div className="center">
                                                                        <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                                                            {item.soLuong || 0}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-blue-400 bg-blue-50 px-3 py-1 rounded-lg">➖</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-900">
                                                        <span className="bg-gray-50 text-gray-900 px-4 py-2 rounded font-bold text-base">
                                                            {(order.tongTien || 0).toLocaleString()}₫
                                                        </span>
                                                    </td>
                                                    {statusFilter === "all" && (
                                                        <td className="py-4 px-6">
                                                            <span className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(order.trangThai)} bg-gray-50 border`}>
                                                                {getStatusIcon(order.trangThai)} {order.trangThai}
                                                            </span>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                    {/* PHÂN TRANG + CHỌN SỐ BẢNG GHI */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-800 font-semibold">Hiển thị:</span>
                            <select
                                aria-label="Chọn số bản ghi mỗi trang"
                                value={itemPerPage}
                                onChange={e => {
                                    setItemPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rounded-full border border-blue-200 px-4 py-2 bg-white text-blue-700 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            <span className="text-blue-600">bản ghi/trang</span>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-full font-bold text-blue-700 border border-blue-200 bg-white shadow-sm transition-all duration-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    ←
                                </button>
                                <div className="flex gap-1">
                                    {((): React.ReactNode => {
                                        const pages: (number | string)[] = [];
                                        if (totalPages <= 2) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            pages.push(1);
                                            if (2 <= totalPages) pages.push(2);
                                            if (3 <= totalPages) pages.push(3);
                                            if (currentPage > 4) pages.push('...');
                                            if (currentPage > 3 && currentPage < totalPages - 1) pages.push(currentPage);
                                            if (currentPage < totalPages - 2) pages.push('...');
                                            if (totalPages > 3) pages.push(totalPages);
                                        }
                                        // Loại bỏ trùng lặp số trang
                                        const uniquePages = pages.filter((v, i, a) => a.indexOf(v) === i);
                                        return uniquePages.map((page, idx) =>
                                            page === '...'
                                                ? <span key={"ellipsis-" + idx} className="px-2 text-blue-400 font-bold">...</span>
                                                : <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(Number(page))}
                                                    className={`px-4 py-2 rounded-full font-bold border transition-all duration-200 ${currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                                                >
                                                    {page}
                                                </button>
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-full font-bold text-blue-700 border border-blue-200 bg-white shadow-sm transition-all duration-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
