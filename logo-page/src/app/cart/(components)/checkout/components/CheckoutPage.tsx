"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShippingCalculator } from "@/utils/shippingCalculator";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import ProgressBar from "./ProgressBar";
import AddressSection from "./AddressSection";
import PhuongThucThanhToan from "./PhuongThucThanhToan";
import PhuongThucVanChuyen from "./PhuongThucVanChuyen";
import OrderSummary from "./OrderSummary";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { CreateHoaDonDTO } from "@/components/types/hoaDon-types";
import { useUserStore } from "@/context/authStore.store";
import { HoaDonService } from "@/services/hoaDonService";
import { useRouter } from "next/navigation";
import { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { SanPhamCheckout } from "./SanPhamCheckout";

export default function CheckoutPage() {
  const { user } = useUserStore();
  const userId = user?.id;
  const router = useRouter();

  // States
  const [products, setProducts] = useState<any[]>([]);
  const [province, setProvince] = useState<number | null>(null);
  const [ward, setWard] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState("Nhanh");
  const [shippingFee, setShippingFee] = useState(0);
  const [soNgayGiao, setSoNgayGiao] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(
    null
  );
  const [address, setAddress] = useState("");

  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedWardName, setSelectedWardName] = useState<string>("");
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tenNguoiNhan, setTenNguoiNhan] = useState("");
  const [selectedAddress, setSelectedAddress] =
    useState<ThongTinNguoiNhan | null>(null);
  // Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [allWards, setAllWards] = useState<any>({});
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [provinceRes, wardRes] = await Promise.all([
          fetch("/data/province.json"),
          fetch("/data/ward.json"),
        ]);
        const provinceData = await provinceRes.json();
        const wardData = await wardRes.json();

        setAllWards(wardData);

        // Lọc provinces có wards
        const parentCodes = new Set();
        Object.values(wardData as Record<string, any>).forEach((w: any) => {
          if (w.parent_code) parentCodes.add(w.parent_code);
        });

        const filteredProvinces = Object.entries(
          provinceData as Record<string, any>
        )
          .filter(([code]) => parentCodes.has(code))
          .map(([code, info]) => ({ code: Number(code), ...info }));

        setProvinces(filteredProvinces);
      } catch (error) {
        toast.error("Không thể tải dữ liệu tỉnh/thành phố");
      }
    };
    loadLocationData();
  }, []);

  // Update wards khi province thay đổi
  useEffect(() => {
    if (province && allWards) {
      const wardsArr = Object.entries(allWards as Record<string, any>)
        .filter(([_, info]) => (info as any).parent_code === province)
        .map(([code, info]) => ({ code: Number(code), ...(info as any) }));
      setWards(wardsArr);
    } else {
      setWards([]);
    }
  }, [province, allWards]);

  // Calculate totals
  const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  let totalAfterDiscount = total;
  if (discount > 0 && discount < 1) {
    totalAfterDiscount = total + shippingFee - total * discount;
  } else if (discount >= 1) {
    totalAfterDiscount = total + shippingFee - discount;
  } else {
    totalAfterDiscount = total + shippingFee;
  }
  if (totalAfterDiscount < 0) totalAfterDiscount = 0;

  const removeOrderedItemsFromCart = () => {
    const currentCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const orderedProductIds = products.map((p) => p.id);
    const updatedCart = currentCart.filter(
      (item: any) => !orderedProductIds.includes(item.id)
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    localStorage.removeItem("selectedVoucher");
    localStorage.removeItem("checkoutDiscount");
    localStorage.removeItem("selectedVoucherCode");
  };

  const handleOrder = async () => {
    setOrderError("");

    // Validation
    if (!address || !province || !ward) {
      setOrderError("Vui lòng nhập đầy đủ thông tin nhận hàng!");
      toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng!");
      return;
    }

    if (!tenNguoiNhan.trim()) {
      setOrderError("Vui lòng nhập họ và tên người nhận!");
      toast.error("Vui lòng nhập họ và tên người nhận!");
      return;
    }

    if (!user) {
      setOrderError("Vui lòng đăng nhập để đặt hàng!");
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === "") {
      setOrderError("Vui lòng nhập số điện thoại!");
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setOrderError("Số điện thoại không đúng định dạng (10 số)!");
      toast.error("Số điện thoại không đúng định dạng (10số)!");
      return;
    }

    setIsLoadingOrder(true);

    try {
      const cartItems = products.map((product) => ({
        idSanPham: product.id,
        soLuong: product.quantity,
      }));

      const diaChiGiaoHang = `${address}, ${selectedWardName}, ${selectedProvinceName}`;

      const orderData: CreateHoaDonDTO = {
        userId: user.id,
        loaiHD: 2,
        tenNguoiNhan: tenNguoiNhan,
        sdt: cleanPhone,
        diaChiGiaoHang,
        phuongThucThanhToan: paymentMethod === "COD" ? "COD" : "Chuyển khoản",
        cartItems,
        idPhieuGiam: selectedVoucher?.id,
        loaiVanChuyen: shippingMethod === "Nhanh" ? 1 : 2,
        isFast: shippingMethod === "Nhanh" ? 1 : 0,
        ngayDatHang: new Date().toISOString(),
        ngayGiaoHangDuKien: new Date(
          Date.now() + soNgayGiao * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const hoaDon = await HoaDonService.createHoaDon(orderData);

      if (paymentMethod === "COD") {
        setIsLoadingOrder(false);
        toast.success(
          "Đặt hàng thành công! Đơn hàng sẽ được giao và thanh toán khi nhận hàng."
        );
        removeOrderedItemsFromCart();
        router.push(`/cart/checkout/success?hoaDonId=${hoaDon.id}`);
      } else if (paymentMethod === "Chuyển khoản") {
        const amountInVND = Math.round(totalAfterDiscount);

        try {
          const res = await fetch(
            `http://localhost:8080/api/lego-store/payment/create-payment?amount=${amountInVND}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          const data = await res.json();

          if (data && data.status === "OK" && data.url) {
            removeOrderedItemsFromCart();
            toast.success(
              "Đặt hàng thành công! Đang chuyển sang cổng thanh toán VNPAY..."
            );
            setIsLoadingOrder(false);
            window.location.href = data.url;
          } else {
            setOrderError("Không lấy được link thanh toán VNPAY!");
            toast.error("Không lấy được link thanh toán VNPAY!");
            setIsLoadingOrder(false);
          }
        } catch (err) {
          setIsLoadingOrder(false);
          setOrderError("Lỗi khi gọi API VNPAY!");
          toast.error("Lỗi khi gọi API VNPAY!");
        }
      }
    } catch (err) {
      setIsLoadingOrder(false);
      setOrderError("Lỗi khi tạo hóa đơn!");
      toast.error("Lỗi khi tạo hóa đơn!");
    }
  };

  // // Tự động tính phí ship khi đủ dữ kiện
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

  return (
    <div className="w-full flex min-h-screen bg-orange-50 text-gray-900">
      <div className=" flex flex-col w-2/3 gap-6 p-6">
        {/* Cột trái: thông tin nhận hàng */}
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

      {/* Cột phải: giỏ hàng */}
      <SanPhamCheckout userId={userId} shippingFee={shippingFee} />
    </div>
  );
}
