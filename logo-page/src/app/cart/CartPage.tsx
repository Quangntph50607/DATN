"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { CartMain } from "./(components)/CartMain";
import { CartSummary } from "./(components)/CartSummary";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ConfirmDialog";
import { CartItemType } from "@/components/types/cart";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});

  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(
    null
  );
  const [voucherInput, setVoucherInput] = useState("");

  const { data: voucherList = [] } = useGetPhieuGiam();

  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const loadImages = async (products: any[]) => {
    const urls: Record<number, string | null> = {};
    for (const product of products) {
      try {
        const images = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(
          product.id
        );
        const mainImg = images?.find((img) => img.anhChinh) || images?.[0];
        urls[product.id] = mainImg?.url
          ? `http://localhost:8080/api/anhsp/images/${mainImg.url}`
          : "/images/placeholder-product.png";
      } catch (error) {
        urls[product.id] = "/images/placeholder-product.png";
        console.error(`Lỗi lấy ảnh sản phẩm ${product.id}:`, error);
      }
    }
    setImageUrls(urls);
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const fixedCart = cart.map((item: any) => ({
      id: Number(item.id) || 0,
      name: item.name || item.tenSanPham || "Sản phẩm không tên",
      price:
        Number(item.price) ||
        Number(item.gia) ||
        Number(item.giaKhuyenMai) ||
        0,
      quantity: Number(item.quantity) || Number(item.soLuong) || 1,
    }));

    setItems(fixedCart);
    setSelectedIds(fixedCart.map((item: CartItemType) => item.id));
    loadImages(fixedCart);
  }, []);

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
    setItemToDelete(id);
    setDeleteItemOpen(true);
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allSelected = items.length > 0 && selectedIds.length === items.length;
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalAfterDiscount = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    localStorage.setItem("checkoutDiscount", String(totalAfterDiscount));
    router.push("/cart/checkout");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  // const handleApplyVoucher = () => {
  //   const voucher = voucherList.find((v) => v.maPhieu === voucherInput);
  //   if (!voucher) return setVoucherMessage("Mã voucher không hợp lệ!");

  //   const discountAmount =
  //     voucher.loaiGiam === "PERCENT"
  //       ? (subtotal * voucher.giaTriGiam) / 100
  //       : voucher.giaTriGiam;

  //   setDiscount(Math.min(discountAmount, voucher.giamToiDa || discountAmount));
  //   setSelectedVoucher(voucher);
  //   setVoucherMessage("Áp dụng voucher thành công!");
  // };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return alert("Chọn sản phẩm để xóa!");
    setDeleteSelectedOpen(true);
  };

  const confirmDeleteSelected = () => {
    const updated = items.filter((item) => !selectedIds.includes(item.id));
    setItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setSelectedIds([]);
    setDeleteSelectedOpen(false);
    toast.success(`Đã xóa ${selectedItems.length} sản phẩm!`);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    const updated = items.filter((item) => item.id !== itemToDelete);
    setItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setSelectedIds((prev) => prev.filter((sid) => sid !== itemToDelete));
    setDeleteItemOpen(false);
    setItemToDelete(null);
    toast.success("Đã xóa sản phẩm!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
        </div>

        <div className="flex gap-6">
          <CartMain
            items={items}
            selectedIds={selectedIds}
            imageUrls={imageUrls}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            formatCurrency={formatCurrency}
            onDeleteSelected={handleDeleteSelected}
          />

          <CartSummary
            selectedItems={selectedItems}
            discount={discount}
            selectedVoucher={selectedVoucher}
            voucherInput={voucherInput}
            voucherMessage={voucherMessage}
            onVoucherInputChange={setVoucherInput}
            // onApplyVoucher={handleApplyVoucher}
            onShowVoucherModal={() => setShowVoucherModal(true)}
            onCheckout={handleCheckout}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* <CartVoucherModal
        show={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        voucherList={voucherList}
        loadingVouchers={false}
        total={subtotal}
        selectedVoucherCode={selectedVoucher?.maPhieu || ""}
        onSelectVoucherRadio={(code) => {
          const voucher = voucherList.find((v) => v.maPhieu === code);
          if (voucher) {
            setSelectedVoucher(voucher);
            setVoucherInput(code);
          }
        }}
        voucherInput={voucherInput}
        setVoucherInput={setVoucherInput}
        // handleApplyVoucher={handleApplyVoucher}
        handleOkVoucher={() => setShowVoucherModal(false)}
      /> */}

      <ConfirmDialog
        open={deleteSelectedOpen}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setDeleteSelectedOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng? Hành động này không thể hoàn tác.`}
      />

      <ConfirmDialog
        open={deleteItemOpen}
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
