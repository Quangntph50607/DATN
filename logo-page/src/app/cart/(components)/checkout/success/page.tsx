"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/context/authStore.store";
import { HoaDonService } from "@/services/hoaDonService";
import type { HoaDonDTO } from "@/components/types/hoaDon-types";
import { toast } from "sonner";
import { getAnhByFileName } from "@/services/anhSanPhamService";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUserStore();
    const [hoaDon, setHoaDon] = useState<HoaDonDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ngayLap, setNgayLap] = useState<string>("");
    const [ngayGiao, setNgayGiao] = useState<string>("");
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    const [remainingCartCount, setRemainingCartCount] = useState(0);

    useEffect(() => {
        const hoaDonId = searchParams.get("hoaDonId");
        const ngayLapParam = searchParams.get("ngayLap");
        const ngayGiaoParam = searchParams.get("ngayGiao");

        console.log("URL Parameters:", { hoaDonId, ngayLapParam, ngayGiaoParam });

        if (hoaDonId) {
            // Lưu thông tin ngày từ URL parameters
            if (ngayLapParam) setNgayLap(decodeURIComponent(ngayLapParam));
            if (ngayGiaoParam) setNgayGiao(decodeURIComponent(ngayGiaoParam));

            // Lấy danh sách sản phẩm từ localStorage làm fallback
            try {
                const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
                setCartItems(items);
                console.log("Sản phẩm từ localStorage:", items);

                // Tải ảnh cho sản phẩm từ localStorage nếu không có dữ liệu backend
                if (items && items.length > 0) {
                    loadImages(items);
                }

                // Kiểm tra số lượng sản phẩm còn lại trong giỏ hàng
                const remainingCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
                setRemainingCartCount(remainingCart.length);
                console.log("Số sản phẩm còn lại trong giỏ hàng:", remainingCart.length);
            } catch (err) {
                console.error("Lỗi đọc localStorage:", err);
                setCartItems([]);
            }

            loadHoaDon(parseInt(hoaDonId));
        } else {
            setError("Không tìm thấy thông tin đơn hàng");
            setLoading(false);
        }
    }, [searchParams]);

    const loadImages = async (products: any[]) => {
        const urls: Record<string, string | null> = {};
        for (const product of products) {
            try {
                // Lấy ảnh từ backend hoặc localStorage
                let imageUrl = null;

                if (product.spId?.anhSps && Array.isArray(product.spId.anhSps) && product.spId.anhSps.length > 0) {
                    // Từ backend
                    const mainImage = typeof product.spId.anhSps[0] === 'string'
                        ? product.spId.anhSps[0]
                        : product.spId.anhSps[0]?.url;
                    if (mainImage) {
                        console.log("Đang tải ảnh từ backend:", mainImage);
                        const imageBlob = await getAnhByFileName(mainImage);
                        urls[product.spId.id] = URL.createObjectURL(imageBlob);
                        continue;
                    }
                } else if (product.image) {
                    // Từ localStorage
                    console.log("Đang tải ảnh từ localStorage:", product.image);
                    const imageBlob = await getAnhByFileName(product.image.replace(/^\//, ""));
                    urls[product.id] = URL.createObjectURL(imageBlob);
                    continue;
                }

                // Nếu không có ảnh
                urls[product.spId?.id || product.id] = null;
            } catch (error) {
                console.error(`Lỗi tải ảnh cho sản phẩm:`, error);
                urls[product.spId?.id || product.id] = null;
            }
        }
        setImageUrls(urls);
    };

    const loadHoaDon = async (hoaDonId: number) => {
        try {
            const data = await HoaDonService.getHoaDonById(hoaDonId);
            console.log("Dữ liệu hóa đơn nhận được:", data);
            console.log("Phi ship:", data.phiShip);
            console.log("Ngày tạo:", data.ngayTao);
            console.log("Ngày giao:", data.ngayGiao);
            console.log("Mã vận chuyển:", data.maVanChuyen);
            console.log("Hóa đơn chi tiết:", data.hoaDonChiTiet);
            console.log("Số lượng sản phẩm:", data.hoaDonChiTiet?.length || 0);
            if (data.hoaDonChiTiet && data.hoaDonChiTiet.length > 0) {
                console.log("Chi tiết sản phẩm đầu tiên:", data.hoaDonChiTiet[0]);
                console.log("Thông tin sản phẩm:", data.hoaDonChiTiet[0].spId);
                console.log("Ảnh sản phẩm:", data.hoaDonChiTiet[0].spId?.anhSps);
            }
            setHoaDon(data);

            // Tải ảnh cho sản phẩm từ backend
            if (data.hoaDonChiTiet && data.hoaDonChiTiet.length > 0) {
                loadImages(data.hoaDonChiTiet);
            }
        } catch (err) {
            console.error("Lỗi tải thông tin đơn hàng:", err);
            setError("Không thể tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm kiểm tra thanh toán online
    // --- BẮT ĐẦU: Giao diện thành công riêng cho thanh toán tài khoản (chuyển khoản/VNPAY) ---
    const isOnlinePayment = (hoaDon: any) => {
        if (!hoaDon) return false;
        const pt = (hoaDon.phuongThucThanhToan || '').toLowerCase();
        return pt.includes('chuyển khoản') || pt.includes('vnpay') || pt.includes('online');
    };
    // --- KẾT THÚC: Giao diện thành công riêng cho thanh toán tài khoản (chuyển khoản/VNPAY) ---

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getTrangThaiColor = (trangThai: string) => {
        switch (trangThai) {
            case "Đang xử lý":
                return "text-blue-600";
            case "Đã xác nhận":
                return "text-green-600";
            case "Đang đóng gói":
                return "text-orange-600";
            case "Đang vận chuyển":
                return "text-purple-600";
            case "Đã giao":
                return "text-green-700";
            case "Hoàn tất":
                return "text-green-800";
            case "Đã hủy":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !hoaDon) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/account")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Về trang tài khoản
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl p-8">
                {/* Thông báo thành công riêng cho thanh toán tài khoản */}
                {/* --- BẮT ĐẦU: Giao diện thành công riêng cho thanh toán tài khoản (chuyển khoản/VNPAY) --- */}
                {hoaDon && isOnlinePayment(hoaDon) && (
                    <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-lg flex flex-col items-center">
                        <div className="text-5xl mb-2">🎉</div>
                        <h2 className="text-2xl font-bold mb-2">Thanh toán thành công qua tài khoản!</h2>
                        <p className="text-lg mb-2">Cảm ơn bạn đã sử dụng phương thức thanh toán online.</p>
                        <p className="text-base">Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý ngay khi hệ thống xác nhận thanh toán.</p>
                        <p className="text-base mt-2">Bạn có thể kiểm tra trạng thái đơn hàng trong mục <span className="font-semibold">Tài khoản &gt; Lịch sử mua hàng</span>.</p>
                    </div>
                )}
                {/* --- KẾT THÚC: Giao diện thành công riêng cho thanh toán tài khoản (chuyển khoản/VNPAY) --- */}
                {/* Thông báo thành công chung (giữ nguyên phần còn lại) */}
                {/* Header thành công với animation */}
                <div className="text-center mb-12">
                    <div className="relative inline-block">
                        <div className="text-green-500 text-7xl mb-6 animate-bounce">✅</div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                    </p>

                </div>

                {/* Danh sách sản phẩm - ĐƯA LÊN ĐẦU */}
                {(hoaDon.hoaDonChiTiet && hoaDon.hoaDonChiTiet.length > 0) || (cartItems && cartItems.length > 0) ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xl">🛍️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm đã mua</h2>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Sản phẩm</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Đơn giá</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Số lượng</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {/* Hiển thị từ backend nếu có */}
                                        {hoaDon.hoaDonChiTiet && hoaDon.hoaDonChiTiet.length > 0 ? (
                                            hoaDon.hoaDonChiTiet.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                                {imageUrls[item.spId?.id] && imageUrls[item.spId.id] !== null ? (
                                                                    <img
                                                                        src={imageUrls[item.spId.id]!}
                                                                        alt={item.spId?.tenSanPham || "Sản phẩm"}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : item.spId?.anhSps?.[0]?.url ? (
                                                                    <div className="w-full h-16 bg-gray-300 flex items-center justify-center">
                                                                        <span className="text-gray-500 text-xs">Đang tải...</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src="/images/default-product.jpg"
                                                                        alt="Không có ảnh"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-lg">{item.spId?.tenSanPham || "Sản phẩm"}</p>
                                                                <p className="text-sm text-gray-500">SKU: {item.spId?.maSanPham || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-semibold text-gray-800">{item.gia?.toLocaleString() || 0}đ</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                                            {item.soLuong || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-bold text-lg text-orange-600">{item.tongTien?.toLocaleString() || 0}đ</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            /* Fallback từ localStorage */
                                            cartItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                                {imageUrls[item.id] && imageUrls[item.id] !== null ? (
                                                                    <img
                                                                        src={imageUrls[item.id]!}
                                                                        alt={item.name || "Sản phẩm"}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : item.image ? (
                                                                    <div className="w-full h-16 bg-gray-300 flex items-center justify-center">
                                                                        <span className="text-gray-500 text-xs">Đang tải...</span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src="/images/default-product.jpg"
                                                                        alt="Không có ảnh"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-lg">{item.name || "Sản phẩm"}</p>
                                                                <p className="text-sm text-gray-500">SKU: {item.id || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-semibold text-gray-800">{item.price?.toLocaleString() || 0}đ</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                                            {item.quantity || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-bold text-lg text-orange-600">
                                                            {((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 mb-8">
                        <div className="text-center">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có thông tin sản phẩm</h2>
                            <p className="text-gray-600">Không thể tải thông tin chi tiết sản phẩm đã mua.</p>
                        </div>
                    </div>
                )}

                {/* Thông tin đơn hàng */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xl">📋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Thông tin đơn hàng</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-orange-700 mb-2">Mã đơn hàng</label>
                                <p className="text-2xl font-bold text-orange-600 tracking-wider">{hoaDon.maHD}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Ngày đặt hàng</label>
                                <p className="text-gray-800 font-medium">
                                    {ngayLap || (hoaDon.ngayTao ? formatDate(hoaDon.ngayTao) : "Đang cập nhật...")}
                                </p>
                            </div>


                            <div className="bg-blue-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Trạng thái</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getTrangThaiColor(hoaDon.trangThai).replace('text-', 'bg-')}`}></div>
                                    <p className={`font-semibold ${getTrangThaiColor(hoaDon.trangThai)}`}>
                                        {hoaDon.trangThai}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-purple-700 mb-2">Phương thức thanh toán</label>
                                <p className="text-gray-800 font-medium">{hoaDon.phuongThucThanhToan}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Tổng tiền hàng</label>
                                <p className="text-xl font-bold text-gray-800">{hoaDon.tamTinh?.toLocaleString()}đ</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Phí vận chuyển</label>
                                <p className="text-xl font-bold text-blue-600">
                                    {hoaDon.phiShip ? hoaDon.phiShip.toLocaleString() : 0}đ
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-green-700 mb-2">Giảm giá</label>
                                <p className="text-xl font-bold text-green-600">-{hoaDon.soTienGiam?.toLocaleString() || 0}đ</p>
                            </div>

                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white">
                                <label className="block text-sm font-semibold text-orange-100 mb-2">Tổng thanh toán</label>
                                <p className="text-3xl font-bold">{hoaDon.tongTien?.toLocaleString()}đ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin người nhận */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xl">👤</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Thông tin người nhận</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Họ tên</label>
                                <p className="text-lg font-semibold text-gray-800">{hoaDon.ten}</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-green-700 mb-2">Số điện thoại</label>
                                <p className="text-lg font-semibold text-gray-800">{hoaDon.sdt}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-purple-700 mb-2">Địa chỉ giao hàng</label>
                                <p className="text-gray-800 leading-relaxed">{hoaDon.diaChiGiaoHang}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Thông tin vận chuyển</label>
                                <p className="text-gray-800 font-medium">
                                    {hoaDon.maVanChuyen === "FAST" ? "Vận chuyển nhanh" : "Vận chuyển thường"}
                                </p>
                                {ngayGiao && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Dự kiến giao: {ngayGiao}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                        onClick={() => router.push("/account")}
                        className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            📋 Xem tất cả đơn hàng
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    {remainingCartCount > 0 && (
                        <button
                            onClick={() => router.push("/cart")}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                🛒 Xem giỏ hàng ({remainingCartCount})
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    )}

                    <button
                        onClick={() => router.push("/")}
                        className="group relative px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            🛍️ Tiếp tục mua sắm
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
} 