"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { toast } from "sonner";
import { HoaDonService } from "@/services/hoaDonService";
import { useUserStore } from "@/context/authStore.store";
import type { CreateHoaDonDTO, PaymentMethods } from "@/components/types/hoaDon-types";
import type { DTOUser } from "@/components/types/account.type";

export default function CheckoutPage() {
    const { user } = useUserStore();

    // State mẫu cho thông tin nhận hàng
    const [address, setAddress] = useState("");
    const [province, setProvince] = useState("");
    const [ward, setWard] = useState("");
    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [allWards, setAllWards] = useState<any>({});

    // Fetch danh sách tỉnh và xã/phường từ public/data
    useEffect(() => {
        fetch("/data/province.json")
            .then((res) => res.json())
            .then((provinceData) => {
                fetch("/data/ward.json")
                    .then((res) => res.json())
                    .then((wardData) => {
                        setAllWards(wardData);
                        // Lấy tất cả parent_code từ ward (object phẳng)
                        const parentCodes = new Set();
                        Object.values(wardData as Record<string, any>).forEach((w: any) => {
                            if (w.parent_code) parentCodes.add(w.parent_code);
                        });
                        // Lọc tỉnh có trong parent_code
                        const filteredProvinces = Object.entries(provinceData as Record<string, any>)
                            .filter(([code]) => parentCodes.has(code))
                            .map(([code, info]) => ({
                                code,
                                ...info,
                            }));
                        setProvinces(filteredProvinces);
                    });
            });
    }, []);

    // Khi chọn tỉnh, cập nhật danh sách xã/phường theo parent_code
    useEffect(() => {
        if (province) {
            // Lọc các xã có parent_code === province
            const wardsArr = Object.entries(allWards as Record<string, any>)
                .filter(([_, info]) => (info as any).parent_code === province)
                .map(([code, info]) => ({ code, ...(info as any) }));
            setWards(wardsArr);
        } else {
            setWards([]);
        }
        setWard("");
    }, [province, allWards]);

    // State mẫu cho sản phẩm
    const [products, setProducts] = useState<any[]>([]);
    const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
    const router = useRouter();

    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [voucherInput, setVoucherInput] = useState("");
    const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
    const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");
    const [voucherMessage, setVoucherMessage] = useState("");
    const [discount, setDiscount] = useState(0);
    const { data: voucherList = [], isLoading: loadingVouchers } = useGetPhieuGiam();

    const [shippingMethod, setShippingMethod] = useState("Nhanh");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");
    const [shippingFee, setShippingFee] = useState(0);
    const [soNgayGiao, setSoNgayGiao] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [vnpayUrl, setVnpayUrl] = useState<string | null>(null);

    // Hàm helper để xóa sản phẩm đã đặt hàng khỏi giỏ hàng
    const removeOrderedItemsFromCart = () => {
        const currentCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const orderedProductIds = products.map(p => p.id);
        const updatedCart = currentCart.filter((item: any) => !orderedProductIds.includes(item.id));
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));

        // KHÔNG xóa checkoutItems để trang success vẫn hiển thị được
        // Chỉ xóa thông tin voucher
        localStorage.removeItem("selectedVoucher");
        localStorage.removeItem("checkoutDiscount");
        localStorage.removeItem("selectedVoucherCode");

        console.log("Đã xóa sản phẩm khỏi giỏ hàng:", {
            orderedProducts: orderedProductIds,
            remainingCart: updatedCart,
            checkoutItems: "Giữ lại để hiển thị trên trang success"
        });
    };

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
        setProducts(items);
        loadImages(items);
    }, []);

    const loadImages = async (products: any[]) => {
        const urls: Record<number, string | null> = {};
        for (const product of products) {
            if (product.image) {
                try {
                    const imageBlob = await getAnhByFileName(product.image.replace(/^\//, ""));
                    urls[product.id] = URL.createObjectURL(imageBlob);
                } catch (error) {
                    urls[product.id] = null;
                }
            } else {
                urls[product.id] = null;
            }
        }
        setImageUrls(urls);
    };

    const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const shipping = shippingFee;

    // Áp dụng voucher
    const handleApplyVoucher = () => {
        const v = voucherList.find(v => v.maPhieu?.toLowerCase() === voucherInput.trim().toLowerCase());
        if (v) {
            setSelectedVoucher(v);
            setSelectedVoucherCode(v.maPhieu || "");
            setVoucherMessage(`Áp dụng: ${v.tenPhieu}`);
            if (v.loaiPhieuGiam === 'Theo %') setDiscount((v.giaTriGiam || 0) / 100);
            else if (v.loaiPhieuGiam === 'Theo số tiền') setDiscount(v.giaTriGiam || 0);
        } else {
            setDiscount(0);
            setVoucherMessage("Mã giảm giá không hợp lệ.");
            setSelectedVoucher(null);
            setSelectedVoucherCode("");
        }
        setShowVoucherModal(false);
        setVoucherInput("");
    };
    const handleSelectVoucherRadio = (code: string) => {
        setSelectedVoucherCode(code);
    };
    const handleOkVoucher = () => {
        const v = voucherList.find(v => v.maPhieu === selectedVoucherCode);
        if (v) {
            setSelectedVoucher(v);
            setVoucherMessage(`Áp dụng: ${v.tenPhieu}`);
            if (v.loaiPhieuGiam === 'Theo %') setDiscount((v.giaTriGiam || 0) / 100);
            else if (v.loaiPhieuGiam === 'Theo số tiền') setDiscount(v.giaTriGiam || 0);
        }
        setShowVoucherModal(false);
    };

    // Tính tổng sau giảm giá
    let totalAfterDiscount = total;
    if (discount > 0 && discount < 1) {
        totalAfterDiscount = total + shipping - (total * discount);
    } else if (discount >= 1) {
        totalAfterDiscount = total + shipping - discount;
    } else {
        totalAfterDiscount = total + shipping;
    }
    if (totalAfterDiscount < 0) totalAfterDiscount = 0;

    // Log để debug số tiền
    console.log("Tính toán số tiền:", {
        total,
        shipping,
        discount,
        totalAfterDiscount,
        products: products.map(p => ({ name: p.name, price: p.price, quantity: p.quantity, subtotal: p.price * p.quantity }))
    });

    // Tự động tính phí ship khi chọn tỉnh, xã hoặc phương thức vận chuyển
    useEffect(() => {
        // Chỉ tính phí ship khi đã chọn tỉnh, xã và có địa chỉ
        if (!province || !ward || !address) {
            setShippingFee(0);
            setSoNgayGiao(0);
            return;
        }

        // Tính phí ship theo logic backend
        const calculateShippingFee = () => {
            const provinceName = provinces.find(p => p.code === province)?.name || "";
            const wardName = wards.find(w => w.code === ward)?.name || "";

            // Tỉnh xuất phát (cố định là Hà Nội)
            const fromProvince = "Hà Nội";

            // Xác định loại vận chuyển
            const getLoaiVanChuyen = (from: string, to: string) => {
                if (from === to) return "NOI_TINH";
                if (from === "Hà Nội" && to === "Đà Nẵng") return "DAC_BIET";
                if (from === "Hà Nội" && isMienBac(to)) return "NOI_MIEN";
                return "LIEN_MIEN";
            };

            // Kiểm tra miền Bắc
            const isMienBac = (province: string) => {
                const mienBac = ["Hà Nội", "Bắc Ninh", "Cao Bằng", "Điện Biên", "Hải Phòng", "Lai Châu", "Lạng Sơn",
                    "Lào Cai", "Ninh Bình", "Phú Thọ", "Quảng Ninh", "Sơn La", "Thái Nguyên", "Tuyên Quang"];
                return mienBac.includes(province);
            };

            // Kiểm tra nội thành Hà Nội
            const isNoiThanh = (province: string, district: string) => {
                if (province === "Hà Nội") {
                    const noiThanhHN = ["Ba Đình", "Hoàn Kiếm", "Đống Đa", "Hai Bà Trưng", "Cầu Giấy", "Thanh Xuân",
                        "Hoàng Mai", "Long Biên", "Tây Hồ", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông"];
                    return noiThanhHN.includes(district);
                }
                return false;
            };

            // Tính phí ship
            const tinhPhiShip = (loaiVanChuyen: string, khuVuc: string, weightKg: number) => {
                let base = 0;
                let extraWeight = 0;

                switch (loaiVanChuyen) {
                    case "NOI_TINH":
                        if (khuVuc === "Nội thành") {
                            base = 22000;
                            extraWeight = Math.max(0, weightKg - 3);
                            base += 2500 * Math.ceil(extraWeight / 0.5);
                        } else {
                            base = 30000;
                            extraWeight = Math.max(0, weightKg - 3);
                            base += 2500 * Math.ceil(extraWeight / 0.5);
                        }
                        break;
                    case "NOI_MIEN":
                        if (khuVuc === "Nội thành") {
                            base = 30000;
                        } else {
                            base = 35000;
                        }
                        extraWeight = Math.max(0, weightKg - 0.5);
                        base += 2500 * Math.ceil(extraWeight / 0.5);
                        break;
                    case "DAC_BIET":
                        if (khuVuc === "Nội thành") {
                            base = 30000;
                        } else {
                            base = 40000;
                        }
                        extraWeight = Math.max(0, weightKg - 0.5);
                        base += 5000 * Math.ceil(extraWeight / 0.5);
                        break;
                    case "LIEN_MIEN":
                        if (khuVuc === "Nội thành") {
                            base = 32000;
                        } else {
                            base = 37000;
                        }
                        extraWeight = Math.max(0, weightKg - 0.5);
                        base += 5000 * Math.ceil(extraWeight / 0.5);
                        break;
                }
                return base;
            };

            // Tính số ngày giao hàng
            const tinhSoNgayGiao = (loaiVanChuyen: string) => {
                switch (loaiVanChuyen) {
                    case "NOI_TINH": return 1;
                    case "NOI_MIEN": return 2;
                    case "DAC_BIET": return 4;
                    case "LIEN_MIEN": return 4;
                    default: return 3;
                }
            };

            // Thực hiện tính toán
            const loaiVanChuyen = getLoaiVanChuyen(fromProvince, provinceName);
            const khuVuc = isNoiThanh(provinceName, wardName) ? "Nội thành" : "Ngoại thành";

            // Tính trọng lượng (mặc định mỗi sản phẩm 0.5kg)
            const totalWeight = products.reduce((sum, p) => sum + p.quantity * 0.5, 0);

            let phiShip = tinhPhiShip(loaiVanChuyen, khuVuc, totalWeight);
            let soNgayGiao = tinhSoNgayGiao(loaiVanChuyen);

            // Áp dụng phí nhanh nếu chọn vận chuyển nhanh
            if (shippingMethod === "Nhanh" && (loaiVanChuyen === "DAC_BIET" || loaiVanChuyen === "LIEN_MIEN")) {
                phiShip += 15000;
                soNgayGiao -= 1;
            }

            console.log("Tính phí ship:", {
                fromProvince,
                toProvince: provinceName,
                ward: wardName,
                loaiVanChuyen,
                khuVuc,
                totalWeight,
                phiShip,
                soNgayGiao,
                shippingMethod
            });

            setShippingFee(phiShip);
            setSoNgayGiao(soNgayGiao);
        };

        calculateShippingFee();
    }, [province, ward, address, shippingMethod, products]);

    const handleOrder = async () => {
        setOrderError("");

        console.log("[DEBUG] paymentMethod value:", paymentMethod);

        // Validate form
        if (!address || !province || !ward) {
            setOrderError("Vui lòng nhập đầy đủ thông tin nhận hàng!");
            toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng!");
            return;
        }

        // Validate user và số điện thoại
        if (!user) {
            setOrderError("Vui lòng đăng nhập để đặt hàng!");
            toast.error("Vui lòng đăng nhập để đặt hàng!");
            return;
        }

        // Lấy số điện thoại từ user hoặc input
        const userSdt = (user as any)?.sdt || phoneNumber || "";
        console.log("Số điện thoại user:", userSdt);

        if (!userSdt || userSdt.trim() === "") {
            setOrderError("Vui lòng nhập số điện thoại!");
            toast.error("Vui lòng nhập số điện thoại!");
            return;
        }

        // Validate định dạng số điện thoại (10-11 số)
        const phoneRegex = /^[0-9]{10,11}$/;
        const cleanPhone = userSdt.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            setOrderError("Số điện thoại không đúng định dạng (10-11 số)!");
            toast.error("Số điện thoại không đúng định dạng (10-11 số)!");
            return;
        }

        if (!window.confirm("Bạn xác nhận muốn đặt hàng với thông tin này?")) {
            return;
        }

        setIsLoadingOrder(true);

        try {
            // Chuẩn bị dữ liệu tạo hóa đơn
            const cartItems = products.map(product => ({
                idSanPham: product.id,
                soLuong: product.quantity
            }));

            // Ghép địa chỉ đầy đủ
            const diaChiGiaoHang = `${address}, ${wards.find(w => w.code === ward)?.name || ""}, ${provinces.find(p => p.code === province)?.name || ""}`;

            // Xác định phương thức thanh toán
            let phuongThucThanhToan: string;
            if (paymentMethod === "COD") {
                phuongThucThanhToan = "COD";
            } else if (paymentMethod === "Chuyển khoản") {
                phuongThucThanhToan = "Chuyển khoản";
            } else {
                phuongThucThanhToan = "COD";
                console.warn("[DEBUG] paymentMethod không phải 'COD' hoặc 'Chuyển khoản', giá trị:", paymentMethod);
            }


            // Tính ngày đặt hàng (hôm nay) và ngày giao hàng dự kiến
            const ngayDatHang = new Date();
            const ngayGiaoHang = new Date();
            ngayGiaoHang.setDate(ngayGiaoHang.getDate() + soNgayGiao);

            // Format ngày theo định dạng Việt Nam
            const formatDateVN = (date: Date) => {
                return date.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                });
            };

            const orderData: CreateHoaDonDTO = {
                userId: user.id,
                loaiHD: 2,
                sdt: cleanPhone,
                diaChiGiaoHang,
                phuongThucThanhToan, // "COD" hoặc "BANK"
                cartItems,
                idPhieuGiam: selectedVoucher?.id,
                phiShip: shippingFee, // Chỉ phí vận chuyển
                loaiVanChuyen: shippingMethod === "Nhanh" ? 1 : 2, // 1 = nhanh, 2 = chậm
                isFast: shippingMethod === "Nhanh" ? 1 : 0, // 1 = nhanh, 0 = chậm (cho backend)
                ngayDatHang: ngayDatHang.toISOString(), // Ngày đặt hàng với giờ cụ thể
                ngayGiaoHangDuKien: ngayGiaoHang.toISOString() // Ngày giao hàng dự kiến
            };

            console.log("Dữ liệu tạo hóa đơn:", orderData);
            console.log("Phương thức thanh toán:", phuongThucThanhToan);
            console.log("Ngày đặt hàng:", formatDateVN(ngayDatHang));
            console.log("Ngày giao hàng dự kiến:", formatDateVN(ngayGiaoHang));
            console.log("Số ngày giao:", soNgayGiao);
            console.log("Ngày đặt hàng ISO:", ngayDatHang.toISOString());
            console.log("Ngày giao hàng dự kiến ISO:", ngayGiaoHang.toISOString());

            // Tạo hóa đơn
            const hoaDon = await HoaDonService.createHoaDon(orderData);
            console.log("Hóa đơn đã tạo:", hoaDon);
            console.log("Ngày lập hóa đơn từ backend:", hoaDon.ngayTao);
            console.log("Ngày giao hàng từ backend:", hoaDon.ngayGiao);

            // Xử lý thanh toán theo phương thức
            if (paymentMethod === "COD") {
                setIsLoadingOrder(false);
                toast.success("Đặt hàng thành công! Đơn hàng sẽ được giao và thanh toán khi nhận hàng.");

                // Xóa sản phẩm đã đặt hàng khỏi giỏ hàng
                removeOrderedItemsFromCart();

                // Chuyển đến trang success với ID hóa đơn và thông tin ngày
                const successUrl = `/cart/checkout/success?hoaDonId=${hoaDon.id}&ngayLap=${encodeURIComponent(formatDateVN(ngayDatHang))}&ngayGiao=${encodeURIComponent(formatDateVN(ngayGiaoHang))}`;
                console.log("Chuyển đến trang success:", successUrl);
                router.push(successUrl);
            } else if (paymentMethod === "Chuyển khoản") {
                const amountInVND = Math.round(totalAfterDiscount);
                console.log("[DEBUG] Bắt đầu gọi API VNPAY với amount:", amountInVND);

                try {
                    const res = await fetch(`http://localhost:8080/api/lego-store/payment/create-payment?amount=${amountInVND}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    });
                    console.log("[DEBUG] VNPAY response status:", res.status);
                    const data = await res.json();
                    console.log("[DEBUG] VNPAY response data:", data);

                    if (data && data.status === "OK" && data.url) {
                        removeOrderedItemsFromCart();
                        toast.success("Đặt hàng thành công! Đang chuyển sang cổng thanh toán VNPAY...");
                        setIsLoadingOrder(false);
                        console.log("[DEBUG] Chuyển hướng sang:", data.url);
                        window.location.href = data.url;
                    } else {
                        setOrderError("Không lấy được link thanh toán VNPAY!");
                        toast.error("Không lấy được link thanh toán VNPAY!");
                        setIsLoadingOrder(false);
                        console.error("[DEBUG] Không lấy được link VNPAY", data);
                    }
                } catch (err) {
                    setIsLoadingOrder(false);
                    setOrderError("Lỗi khi gọi API VNPAY!");
                    toast.error("Lỗi khi gọi API VNPAY!");
                    console.error("[DEBUG] Lỗi khi gọi API VNPAY:", err);
                }
            } else {
                setIsLoadingOrder(false);
                setOrderError("Phương thức thanh toán không hợp lệ! Hãy chọn lại.");
                toast.error("Phương thức thanh toán không hợp lệ! Hãy chọn lại.");
                console.error("[DEBUG] paymentMethod không hợp lệ:", paymentMethod);
            }
        } catch (err) {
            setIsLoadingOrder(false);
            setOrderError("Lỗi khi tạo hóa đơn!");
            toast.error("Lỗi khi tạo hóa đơn!");
            console.error("[DEBUG] Lỗi khi tạo hóa đơn:", err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white rounded shadow mt-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Cột trái: Danh sách sản phẩm */}
                <div className="md:w-3/5 w-full order-1 md:order-none">
                    <div className="mb-4">
                        <div className="font-bold text-lg mb-2 text-gray-800">Sản phẩm trong đơn hàng</div>
                        <table className="w-full text-sm border rounded overflow-hidden">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2 text-left">Ảnh</th>
                                    <th className="p-2 text-left">Sản phẩm</th>
                                    <th className="p-2 text-center">Đơn giá</th>
                                    <th className="p-2 text-center">Số lượng</th>
                                    <th className="p-2 text-center">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b">
                                        <td className="p-2 text-black">
                                            {(imageUrls[p.id] || p.image) ? (
                                                <img src={imageUrls[p.id] || p.image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">No Image</div>
                                            )}
                                        </td>
                                        <td className="p-2 text-black">{p.name}</td>
                                        <td className="p-2 text-center text-red-500 font-semibold">{p.price.toLocaleString()}đ</td>
                                        <td className="p-2 text-center text-black">{p.quantity}</td>
                                        <td className="p-2 text-center font-bold text-black">{(p.price * p.quantity).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Lời nhắn cho shop */}
                    <div className="mt-4">
                        <label className="block font-semibold mb-1 text-gray-800">Lời nhắn cho Người bán:</label>
                        <input className="border rounded px-3 py-2 w-full" placeholder="Lưu ý cho Người bán..." />
                    </div>
                </div>
                {/* Cột phải: Thông tin nhận hàng, tổng tiền, thanh toán */}
                <div className="md:w-2/5 w-full order-2 md:order-none flex flex-col gap-4">
                    {/* Số điện thoại */}
                    <div className="border-b pb-4 mb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-600 font-semibold">📞 Số Điện Thoại</span>
                        </div>
                        <div className="flex flex-col gap-2 text-black">
                            <input
                                className="border rounded px-3 py-2 w-full"
                                placeholder="Nhập số điện thoại (10-11 số)"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                type="tel"
                            />
                            {(user as any)?.sdt && (
                                <div className="text-sm text-gray-600">
                                    Số điện thoại hiện tại: {(user as any).sdt}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Địa chỉ nhận hàng */}
                    <div className="border-b pb-4 mb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-600 font-semibold">📍 Địa Chỉ Nhận Hàng</span>
                            <button className="text-blue-600 text-sm font-semibold">Thay Đổi</button>
                        </div>
                        <div className="flex flex-col gap-2 text-black">
                            <div className="flex gap-2">
                                <select
                                    className="border rounded px-3 py-2 w-1/2"
                                    value={province}
                                    onChange={e => setProvince(e.target.value)}
                                    aria-label="Chọn tỉnh/thành phố"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded px-3 py-2 w-1/2"
                                    value={ward}
                                    onChange={e => setWard(e.target.value)}
                                    disabled={!province}
                                    aria-label="Chọn xã/phường"
                                >
                                    <option value="">Chọn xã/phường</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                className="border rounded px-3 py-2 w-full"
                                placeholder="Địa chỉ chi tiết (số nhà, tên đường...)"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Phương thức vận chuyển */}
                    <div>
                        <label className="block font-semibold mb-1 text-gray-800 flex items-center gap-2">
                            <span>🚚</span> Phương thức vận chuyển:
                        </label>
                        <select
                            className="border border-gray-300 rounded px-3 py-2 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-400 transition"
                            value={shippingMethod}
                            onChange={e => setShippingMethod(e.target.value)}
                            aria-label="Chọn phương thức vận chuyển"
                        >
                            <option value="Nhanh" className="text-black">Nhanh</option>
                            <option value="Chậm" className="text-black">Chậm</option>
                        </select>
                        <div className="mt-2 text-sm text-gray-700">
                            Đã chọn: <span className="font-semibold text-orange-600">{shippingMethod}</span>
                        </div>
                    </div>
                    {/* Voucher */}
                    <div>
                        <label className="block font-semibold mb-1 text-gray-800">Voucher của Shop:</label>
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => setShowVoucherModal(true)}
                                className="flex items-center gap-2 border px-4 py-2 rounded text-orange-600 font-semibold"
                            >
                                <span>🧧</span> Chọn Voucher
                            </button>
                            {selectedVoucher && (
                                <span className="ml-2 text-green-600">{selectedVoucher.tenPhieu}</span>
                            )}
                            {voucherMessage && (
                                <span className="ml-2 text-sm text-green-600">{voucherMessage}</span>
                            )}
                        </div>
                        <div className="border rounded px-3 py-2 bg-gray-50 text-orange-600">
                            {selectedVoucher ? `Đã áp dụng -${discount < 1 ? (total * discount).toLocaleString() : discount.toLocaleString()}đ` : "Chưa áp dụng"}
                        </div>
                    </div>
                    {/* Modal chọn voucher */}
                    {showVoucherModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                                <h2 className="text-xl font-bold mb-4">Chọn Voucher</h2>
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                                    onClick={() => setShowVoucherModal(false)}
                                    aria-label="Đóng"
                                >✕</button>
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={voucherInput}
                                        onChange={e => setVoucherInput(e.target.value)}
                                        placeholder="Mã Voucher"
                                        className="border rounded px-3 py-2 flex-1"
                                    />
                                    <button
                                        onClick={handleApplyVoucher}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                                <div className="mb-2 font-semibold">Danh sách Voucher</div>
                                <div className="max-h-60 overflow-y-auto">
                                    {loadingVouchers ? (
                                        <div className="text-center text-gray-500 py-4">Đang tải phiếu giảm giá...</div>
                                    ) : (
                                        voucherList.map((v) => {
                                            const notEnough = total < (v.giaTriToiThieu || 0);
                                            return (
                                                <label
                                                    key={v.id}
                                                    className={`flex items-center gap-3 border rounded-lg p-3 mb-2 cursor-pointer transition ${selectedVoucherCode === v.maPhieu
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-200'
                                                        } ${notEnough ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span className="text-2xl">🧧</span>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-orange-600">{v.tenPhieu}</div>
                                                        <div className="text-xs text-gray-500">HSD: {v.ngayKetThuc || '31.12.2025'}</div>
                                                        <div className="text-xs text-gray-500">{v.loaiPhieuGiam === 'Theo %' ? `Giảm ${v.giaTriGiam}%` : `Giảm ${v.giaTriGiam?.toLocaleString()}đ`}</div>
                                                        {notEnough && (
                                                            <div className="text-xs text-red-500 mt-1">
                                                                Đơn tối thiểu {v.giaTriToiThieu?.toLocaleString()}đ
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="voucher"
                                                        checked={selectedVoucherCode === v.maPhieu}
                                                        onChange={() => handleSelectVoucherRadio(v.maPhieu || "")}
                                                        className="accent-orange-500"
                                                        disabled={notEnough}
                                                    />
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                                        onClick={() => setShowVoucherModal(false)}
                                    >
                                        Trở lại
                                    </button>
                                    <button
                                        className="px-6 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600"
                                        onClick={handleOkVoucher}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Phương thức thanh toán */}
                    <div>
                        <label className="block font-semibold mb-1 text-gray-800 flex items-center gap-2">
                            <span>💳</span> Phương thức thanh toán:
                        </label>
                        <select
                            className="border border-gray-300 rounded px-3 py-2 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-400 transition"
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            aria-label="Chọn phương thức thanh toán"
                        >
                            <option value="COD" className="text-black">Thanh toán khi nhận hàng (COD)</option>
                            <option value="Chuyển khoản" className="text-black">Chuyển khoản ngân hàng</option>
                        </select>
                        <div className="mt-2 text-sm text-gray-700">
                            Đã chọn: <span className="font-semibold text-orange-600">
                                {paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng"}
                            </span>
                        </div>
                    </div>
                    {/* Tổng tiền và đặt hàng */}
                    <div className="bg-gray-50 rounded p-4 mt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">Tổng tiền hàng:</span>
                            <span className="text-black">{total.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">Phí vận chuyển:</span>
                            {soNgayGiao > 0 && (
                                <span className="text-xs text-gray-500">Dự kiến {soNgayGiao} ngày</span>
                            )}
                            <span className="text-black ml-2">{shipping.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">Voucher giảm giá:</span>
                            <span className="text-green-600">-{selectedVoucher ? (discount < 1 ? (total * discount).toLocaleString() : discount.toLocaleString()) : 0}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-lg mb-2">
                            <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                            <span className="text-black font-bold text-2xl">{totalAfterDiscount.toLocaleString()}đ</span>
                        </div>
                        {orderError && (
                            <div className="text-red-500 text-sm mb-2">{orderError}</div>
                        )}
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded text-lg w-full mt-4 disabled:bg-orange-300 disabled:cursor-not-allowed"
                            onClick={handleOrder}
                            disabled={isLoadingOrder}
                        >
                            {isLoadingOrder ? "Đang xử lý..." : "Đặt Hàng"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}