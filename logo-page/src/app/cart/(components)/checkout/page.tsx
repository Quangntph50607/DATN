"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HoaDonService } from "@/services/hoaDonService";
import { useUserStore } from "@/context/authStore.store";
import type { CreateHoaDonDTO } from "@/components/types/hoaDon-types";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { ShippingCalculator } from "@/utils/shippingCalculator";

import ProgressBar from "./components/ProgressBar";
import CustomerInfoSection from "./components/CustomerInfoSection";

import AddressSection from "./components/AddressSection";
import OrderSummary from "./components/OrderSummary";
import VoucherModal from "./components/VoucherModal";
import AddressModal from "./components/AddressModal";
import PhuongThucThanhToan from "./components/PhuongThucThanhToan";
import PhuongThucVanChuyen from "./components/PhuongThucVanChuyen";

export default function CheckoutPage() {
  const { user } = useUserStore();
  const router = useRouter();

  // States
  const [products, setProducts] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [tenNguoiNhan, setTenNguoiNhan] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState<number | null>(null);
  const [ward, setWard] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState("Nhanh");
  const [shippingFee, setShippingFee] = useState(0);
  const [soNgayGiao, setSoNgayGiao] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(
    null
  );
  const [discount, setDiscount] = useState(0);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedWardName, setSelectedWardName] = useState<string>("");

  // Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [allWards, setAllWards] = useState<any>({});

  // Fetch provinces/wards
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

  // Load products and images
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    setProducts(items);
    loadImages(items);
  }, []);

  useEffect(() => {
    if (user) {
      setTenNguoiNhan((user as any)?.ten || "");
      setPhoneNumber((user as any)?.sdt || "");
    }
  }, [user]);

  const loadImages = async (products: any[]) => {
    const urls: Record<number, string | null> = {};
    for (const product of products) {
      if (product.image) {
        try {
          const imageBlob = await getAnhByFileName(
            product.image.replace(/^\//, "")
          );
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

  // Đồng bộ tên tỉnh/xã khi đổi
  const handleProvinceChange = (provinceCode: number | null) => {
    setProvince(provinceCode);
    setWard(null);

    // Tìm tên tỉnh/thành
    if (provinceCode && provinces.length > 0) {
      const selectedProv = provinces.find((p) => p.code === provinceCode);
      if (selectedProv) {
        setSelectedProvinceName(selectedProv.name);
      }
    } else {
      setSelectedProvinceName("");
    }
  };

  const handleWardChange = (wardCode: number | null) => {
    setWard(wardCode);

    if (wardCode && wards.length > 0) {
      const selectedWardObj = wards.find((w) => w.code === wardCode);
      if (selectedWardObj) {
        setSelectedWardName(selectedWardObj.name);
      }
    } else {
      setSelectedWardName("");
    }
  };

  // Tự động tính phí ship khi đủ dữ kiện
  useEffect(() => {
    if (!selectedProvinceName || !selectedWardName || !address) {
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
        address,
        selectedWardName,
        selectedProvinceName,
        isFast,
        totalWeight
      );

      setShippingFee(result.phiShip);
      setSoNgayGiao(result.soNgayGiao);
    } catch (error) {
      setShippingFee(0);
      setSoNgayGiao(0);
    }
  }, [
    selectedProvinceName,
    selectedWardName,
    address,
    shippingMethod,
    products,
  ]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white text-black">
        <div className="max-w-6xl mx-auto p-6">
          <ProgressBar />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái - Form */}
            <div className="lg:col-span-2 space-y-6">
              <CustomerInfoSection
                tenNguoiNhan={tenNguoiNhan}
                phoneNumber={phoneNumber}
                onTenNguoiNhanChange={setTenNguoiNhan}
                onPhoneNumberChange={setPhoneNumber}
              />

              <AddressSection
                address={address}
                province={province}
                ward={ward}
                onAddressChange={setAddress}
                onProvinceChange={handleProvinceChange}
                onWardChange={handleWardChange}
                onShowAddressForm={() => setShowAddressForm(true)}
                products={products}
                shippingMethod={shippingMethod}
                onTenNguoiNhanChange={setTenNguoiNhan}
                onPhoneNumberChange={setPhoneNumber}
                provinces={provinces}
                wards={wards}
                allWards={allWards}
              />

              <PhuongThucThanhToan
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />

              <PhuongThucVanChuyen
                shippingMethod={shippingMethod}
                onShippingMethodChange={setShippingMethod}
              />
            </div>

            {/* Cột phải - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                products={products}
                imageUrls={imageUrls}
                total={total}
                discount={discount}
                shippingFee={shippingFee}
                totalAfterDiscount={totalAfterDiscount}
                selectedVoucher={selectedVoucher}
                onShowVoucherModal={() => setShowVoucherModal(true)}
                onOrder={handleOrder}
                isLoadingOrder={isLoadingOrder}
                orderError={orderError}
                onGoBack={() => router.back()}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        <VoucherModal
          show={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          onVoucherSelect={setSelectedVoucher}
          onDiscountChange={setDiscount}
          total={total}
        />

        <AddressModal
          show={showAddressForm}
          onClose={() => setShowAddressForm(false)}
          onAddressSelect={(addressData) => {
            setAddress(addressData.address);
            setProvince(addressData.province);
            setWard(addressData.ward);
            setTenNguoiNhan(addressData.tenNguoiNhan);
            setPhoneNumber(addressData.phoneNumber);

            // update tên cho phí ship
            if (addressData.province && provinces.length > 0) {
              const selectedProv = provinces.find(
                (p) => p.code === addressData.province
              );
              if (selectedProv) setSelectedProvinceName(selectedProv.name);
            }
            if (addressData.ward && wards.length > 0) {
              const selectedWardObj = wards.find(
                (w) => w.code === addressData.ward
              );
              if (selectedWardObj) setSelectedWardName(selectedWardObj.name);
            }
          }}
        />
      </div>
      <Footer />
    </>
  );
}
