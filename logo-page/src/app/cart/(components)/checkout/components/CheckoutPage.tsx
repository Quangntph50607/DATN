"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShippingCalculator } from "@/utils/shippingCalculator";
import AddressSection from "./AddressSection";
import PhuongThucThanhToan from "./PhuongThucThanhToan";
import PhuongThucVanChuyen from "./PhuongThucVanChuyen";
import { CreateHoaDonDTO } from "@/components/types/hoaDon-types";
import { useUserStore } from "@/context/authStore.store";
import { useRouter } from "next/navigation";
import { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { SanPhamCheckout } from "./SanPhamCheckout";
import { useCreateHoaDon, useGuiEmail } from "@/hooks/useHoaDon";
import { GuiHoaDonRequest } from "@/components/types/hoadondientu.type";
import { CartItemType } from "@/components/types/cart";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";

export default function CheckoutPage() {
  const { user } = useUserStore();
  const userId = user?.id;
  const router = useRouter();

  // States - Chỉ giữ lại những state thực sự được sử dụng
  const [products, setProducts] = useState<CartItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState("Nhanh");
  const [shippingFee, setShippingFee] = useState(0);
  const [soNgayGiao, setSoNgayGiao] = useState(0);
  const [selectedVoucher, setSelectedVoucher] =
    useState<PhieuGiamGiaResponse | null>(null);
  const [selectedAddress, setSelectedAddress] =
    useState<ThongTinNguoiNhan | null>(null);

  // Hooks
  const createHoaDonMutation = useCreateHoaDon();
  const { mutate: guiEmail } = useGuiEmail();

  // State để nhận data từ SanPhamCheckout
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  console.log("Voucher chọn:", selectedVoucher);
  console.log("id gửi lên BE:", selectedVoucher?.id);
  useEffect(() => {
    // Load products for checkout from localStorage
    try {
      const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
      setProducts(items || []);
    } catch (e) {
      setProducts([]);
    }
  }, []);

  // Tự động tính phí ship khi đủ dữ kiện
  useEffect(() => {
    if (!selectedAddress) {
      setShippingFee(0);
      setSoNgayGiao(0);
      return;
    }

    try {
      const isFast = shippingMethod === "Nhanh" ? 1 : 0;
      const totalWeight = products.reduce(
        (sum, p) => sum + p.quantity * 0.5,
        0
      );

      const result = ShippingCalculator.calculateShipping(
        selectedAddress.xa,
        selectedAddress.thanhPho,
        isFast,
        totalWeight
      );

      setShippingFee(result.phiShip);
      setSoNgayGiao(result.soNgayGiao);
    } catch (error) {
      setShippingFee(0);
      setSoNgayGiao(0);
    }
  }, [selectedAddress, shippingMethod, products]);

  // Hàm callback để nhận dữ liệu từ SanPhamCheckout
  const handleCheckoutDataChange = (total: number, discount: number) => {
    setCheckoutTotal(total);
    setCheckoutDiscount(discount);
  };

  const removeOrderedItemsFromCart = () => {
    const currentCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const orderedProductIds = products.map((p) => p.id);
    const updatedCart = currentCart.filter(
      (item: CartItemType) => !orderedProductIds.includes(item.id)
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    localStorage.removeItem("checkoutItems");
    localStorage.removeItem("selectedVoucher");
    localStorage.removeItem("checkoutDiscount");
    localStorage.removeItem("selectedVoucherCode");
  };

  const handleOrder = async () => {
    console.log("Voucher chọn:", selectedVoucher);
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = String(selectedAddress.sdt || "").replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Số điện thoại không đúng định dạng (10-11 số)!");
      return;
    }

    // Ensure products list is populated (fallback to localStorage)
    let checkoutProducts = products;
    if (!checkoutProducts || checkoutProducts.length === 0) {
      try {
        checkoutProducts = JSON.parse(
          localStorage.getItem("checkoutItems") || "[]"
        );
      } catch {
        checkoutProducts = [] as CartItemType[];
      }
    }

    const cartItems = (checkoutProducts || []).map((product: CartItemType) => ({
      idSanPham: product.id,
      soLuong: product.quantity,
    }));

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    const diaChiGiaoHang = `${selectedAddress.duong}, ${selectedAddress.xa}, ${selectedAddress.thanhPho}`;
    const orderData: CreateHoaDonDTO = {
      userId: user.id,
      loaiHD: 2,
      tenNguoiNhan: selectedAddress.hoTen,
      sdt: cleanPhone,
      diaChiGiaoHang,
      phuongThucThanhToan:
        paymentMethod === "COD"
          ? "COD"
          : paymentMethod === "VNPay"
          ? "VNPay"
          : "Chuyển khoản",
      cartItems,
      idPhieuGiam: selectedVoucher?.id,
      loaiVanChuyen: shippingMethod === "Nhanh" ? 1 : 2,
      isFast: shippingMethod === "Nhanh" ? 1 : 0,
      phiShip: shippingFee,
      ngayDatHang: new Date().toISOString(),
      ngayGiaoHangDuKien: new Date(
        Date.now() + soNgayGiao * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    // Xử lý COD - tạo hóa đơn ngay lập tức
    if (paymentMethod === "COD") {
      try {
        const hoaDon = await createHoaDonMutation.mutateAsync(orderData as any);
        const emailData: GuiHoaDonRequest = {
          idHD: hoaDon.id,
          toEmail: user?.email || "",
          tenKH: selectedAddress.hoTen,
          maHD: hoaDon.maHD,
          ngayTao: new Date().toLocaleDateString("vi-VN"),
          diaChi: diaChiGiaoHang,
          pttt: "Thanh toán khi nhận hàng",
          ptvc: shippingMethod === "Nhanh" ? "GIAO NHANH" : "GIAO TIẾT KIỆM",
          listSp: checkoutProducts.map((item) => ({
            ten: item.name,
            ma: item.id.toString(),
            gia: item.price.toString(),
            soLuong: item.quantity,
            tongTien: (item.price * item.quantity).toString(),
          })),
          phiShip: shippingFee.toString(),
          totalAmount: checkoutTotal.toString(),
          tienGiam: checkoutDiscount.toString(),
        };

        guiEmail(emailData, {
          onSuccess: () => console.log("Gửi email thành công"),
          onError: (err) => console.error("Gửi email thất bại:", err),
        });

        toast.success(
          "Đặt hàng thành công! Đơn hàng sẽ được giao và thanh toán khi nhận hàng."
        );
        removeOrderedItemsFromCart();
        router.push(`/thanh-toan-thanh-cong?hoaDonId=${hoaDon.id}`);
        return;
      } catch (err: any) {
        console.error("Lỗi khi tạo hóa đơn COD:", err);

        // Xác định loại lỗi và chuyển hướng phù hợp
        let errorType = "system_error";
        let errorMessage = "Có lỗi xảy ra khi tạo đơn hàng";

        if (
          err.message?.includes("hết hàng") ||
          err.message?.includes("out of stock")
        ) {
          errorType = "out_of_stock";
          errorMessage = "Một số sản phẩm đã hết hàng";
        } else if (
          err.message?.includes("validation") ||
          err.message?.includes("thông tin")
        ) {
          errorType = "validation_error";
          errorMessage = "Thông tin đơn hàng không hợp lệ";
        }

        toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");

        // Chuyển hướng đến trang lỗi với thông tin chi tiết
        setTimeout(() => {
          router.push(
            `/thanh-toan-that-bai?type=${errorType}&message=${encodeURIComponent(
              errorMessage
            )}`
          );
        }, 1000);

        return;
      }
    }

    // Xử lý VN Pay - KHÔNG tạo hóa đơn ngay, chỉ lưu thông tin tạm
    if (paymentMethod === "VNPay" || paymentMethod === "Chuyển khoản") {
      const amountInVND = Math.round(checkoutTotal);

      try {
        // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi thanh toán thành công
        localStorage.setItem("pendingOrder", JSON.stringify(orderData));
        localStorage.setItem("checkoutTotal", checkoutTotal.toString());
        localStorage.setItem("checkoutDiscount", checkoutDiscount.toString());
        localStorage.setItem(
          "checkoutProducts",
          JSON.stringify(checkoutProducts)
        );
        localStorage.setItem(
          "selectedAddress",
          JSON.stringify(selectedAddress)
        );
        localStorage.setItem("shippingMethod", shippingMethod);
        localStorage.setItem("shippingFee", shippingFee.toString());
        localStorage.setItem("soNgayGiao", soNgayGiao.toString());
        localStorage.setItem("userEmail", user.email || "");

        const res = await fetch(
          `http://localhost:8080/api/lego-store/payment/create-payment?amount=${amountInVND}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const data = await res.json();

        if (data && data.status === "OK" && data.url) {
          toast.success("Đang chuyển sang cổng thanh toán VNPAY...");
          window.location.href = data.url;
        } else {
          toast.error("Không lấy được link thanh toán VNPAY!");
          // Xóa dữ liệu tạm nếu không lấy được URL
          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("checkoutTotal");
          localStorage.removeItem("checkoutDiscount");
          localStorage.removeItem("checkoutProducts");
          localStorage.removeItem("selectedAddress");
          localStorage.removeItem("shippingMethod");
          localStorage.removeItem("shippingFee");
          localStorage.removeItem("soNgayGiao");
          localStorage.removeItem("userEmail");
        }
      } catch (err) {
        toast.error("Lỗi khi gọi API VNPAY!");
        // Xóa dữ liệu tạm nếu có lỗi
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("checkoutTotal");
        localStorage.removeItem("checkoutDiscount");
        localStorage.removeItem("checkoutProducts");
        localStorage.removeItem("selectedAddress");
        localStorage.removeItem("shippingMethod");
        localStorage.removeItem("shippingFee");
        localStorage.removeItem("soNgayGiao");
        localStorage.removeItem("userEmail");
      }
    }
  };

  return (
    <>
      <div className="w-full flex min-h-screen bg-orange-50 text-gray-900">
        <div className="flex flex-col w-2/3 gap-6 p-6">
          <AddressSection onAddressChange={setSelectedAddress} />

          <PhuongThucThanhToan
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          <PhuongThucVanChuyen
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
          />
        </div>

        <SanPhamCheckout
          userId={userId}
          shippingFee={shippingFee}
          onPlaceOrder={handleOrder}
          onDataChange={handleCheckoutDataChange}
          onVoucherChange={setSelectedVoucher}
        />
      </div>
    </>
  );
}
