"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ConfirmDialog";
import { CartItemType } from "@/components/types/cart";
import { CartItem } from "./(components)/CartItem";
import CartSummary from "./(components)/CartSummary";
import { useUserStore } from "@/context/authStore.store";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [discount, setDiscount] = useState(0);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const { user } = useUserStore();
  const userId = user?.id;

  // Load images
  const loadImages = async (products: CartItemType[]) => {
    const urls = await Promise.all(
      products.map(async (product) => {
        try {
          const images = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(
            product.id
          );
          const mainImg = images?.find((img) => img.anhChinh) || images?.[0];
          return [
            product.id,
            mainImg?.url
              ? `http://localhost:8080/api/anhsp/images/${mainImg.url}`
              : "/images/placeholder-product.png",
          ];
        } catch {
          return [product.id, "/images/placeholder-product.png"];
        }
      })
    );
    setImageUrls(Object.fromEntries(urls));
  };

  useEffect(() => {
    try {
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
        maxQuantity: Number(item.maxQuantity) || Number(item.soLuongTon) || 20,
      }));

      setItems(fixedCart);
      setSelectedIds(fixedCart.map((item: CartItemType) => item.id));
      loadImages(fixedCart);
    } catch (err) {
      console.error("Lỗi khi parse localStorage:", err);
    }
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.maxQuantity ?? 20,
                Math.max(1, item.quantity + delta)
              ),
            }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemove = (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    toast.success("Đã xóa sản phẩm!");
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
      toast.error("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    const updatedItems = selectedItems.map((item) => ({
      ...item,
      finalPrice:
        discount > 0
          ? item.price - item.price * (discount / subtotal)
          : item.price,
    }));

    localStorage.setItem("checkoutItems", JSON.stringify(updatedItems));
    localStorage.setItem("checkoutDiscount", String(totalAfterDiscount));
    router.push("/cart/checkout");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để xóa!");
      return;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Button
                variant="ghost"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
              >
                {selectedIds.length === items.length && items.length > 0
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>

              {selectedIds.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa đã chọn
                </Button>
              )}
            </div>

            <CartItem
              items={items}
              selectedIds={selectedIds}
              imageUrls={imageUrls}
              onSelect={handleSelect}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
              formatCurrency={formatCurrency}
            />
          </div>

          <div className="lg:w-96 w-full">
            <CartSummary
              selectedItems={selectedItems}
              onCheckout={handleCheckout}
              formatCurrency={formatCurrency}
              userId={userId}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteSelectedOpen}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setDeleteSelectedOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
