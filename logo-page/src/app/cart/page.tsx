"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CartSummary from "./(components)/CartSummary";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import CartVoucherModal from "./(components)/CartVoucherModal";

import CartTotalBar from "./(components)/CartTotalBar";
import CartMain from "./(components)/CartMain";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");
  const { data: voucherList = [], isLoading: loadingVouchers } = useGetPhieuGiam();
  const router = useRouter();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const fixedCart = cart.map((item: any) => ({
      ...item,
      image: item.image && !item.image.startsWith("/") && !item.image.startsWith("http")
        ? "/" + item.image
        : item.image,
    }));
    setItems(fixedCart);
    setSelectedIds(fixedCart.map((item: any) => item.id));
    loadImages(fixedCart);
  }, []);

  const loadImages = async (products: any[]) => {
    const urls: Record<number, string | null> = {};
    for (const product of products) {
      let fileName = product.image;
      if (!fileName && product.anhUrls && product.anhUrls.length > 0) {
        fileName = product.anhUrls[0].url;
      }
      if (fileName) {
        try {
          if (fileName.startsWith("/")) fileName = fileName.slice(1);
          console.log("Đang lấy ảnh cho:", fileName);
          const imageBlob = await getAnhByFileName(fileName);
          urls[product.id] = URL.createObjectURL(imageBlob);
        } catch (error) {
          console.log("Không lấy được ảnh cho:", fileName, error);
          urls[product.id] = "/fallback.jpg";
        }
      } else {
        urls[product.id] = "/fallback.jpg";
      }
    }
    setImageUrls(urls);
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemove = (id: number) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("cartItems", JSON.stringify(updated));
      setSelectedIds((prevIds) => prevIds.filter((sid) => sid !== id));
      return updated;
    });
  };

  // Chọn/bỏ chọn từng sản phẩm
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Chọn/bỏ chọn tất cả sản phẩm
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  // Tổng tiền chỉ tính các sản phẩm được chọn
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Hàm kiểm tra mã giảm giá (ví dụ đơn giản, bạn có thể thay bằng API)
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

      // Lưu vào localStorage để đồng bộ với checkout
      localStorage.setItem("selectedVoucher", JSON.stringify(v));
      localStorage.setItem(
        "checkoutDiscount",
        String(
          v.loaiPhieuGiam === 'Theo %'
            ? (v.giaTriGiam || 0) / 100
            : v.giaTriGiam || 0
        )
      );
      localStorage.setItem("selectedVoucherCode", v.maPhieu || "");
    }
    setShowVoucherModal(false);
  };

  // Tính tổng sau giảm giá
  let totalAfterDiscount = total;
  if (discount > 0 && discount < 1) {
    totalAfterDiscount = total - total * discount;
  } else if (discount >= 1) {
    totalAfterDiscount = total - discount;
  }
  if (totalAfterDiscount < 0) totalAfterDiscount = 0;

  // Thêm hàm xử lý khi nhấn Mua Hàng
  const handleCheckout = () => {
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    router.push("/cart/checkout");
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4 mt-8 text-black">
        <h1 className="text-2xl font-bold mb-4">Giỏ Hàng</h1>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => router.push("/product")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <CartVoucherModal
              show={showVoucherModal}
              onClose={() => setShowVoucherModal(false)}
              voucherList={voucherList}
              loadingVouchers={loadingVouchers}
              total={total}
              selectedVoucherCode={selectedVoucherCode}
              onSelectVoucherRadio={handleSelectVoucherRadio}
              voucherInput={voucherInput}
              setVoucherInput={setVoucherInput}
              handleApplyVoucher={handleApplyVoucher}
              handleOkVoucher={handleOkVoucher}
            />
            <CartMain
              items={items}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              allSelected={allSelected}
              imageUrls={imageUrls}
            />
            <CartTotalBar
              selectedItems={selectedItems}
              total={total}
              totalAfterDiscount={totalAfterDiscount}
              selectedVoucher={selectedVoucher}
              onShowVoucherModal={() => setShowVoucherModal(true)}
              onCheckout={handleCheckout}
            />
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
