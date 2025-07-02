"use client";
import React from "react";
import CartList from "./(components)/CartList";
import CartSummary from "./(components)/CartSummary";
import { useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/useCart";

const userId = 1; // TODO: Lấy userId thực tế từ context/auth

export default function CartPage() {
  const { data: cart, isLoading } = useCart(userId);
  const updateCartItem = useUpdateCartItem(userId);
  const removeCartItem = useRemoveCartItem(userId);

  if (isLoading) return <div>Đang tải giỏ hàng...</div>;
  if (!cart) return <div>Không có dữ liệu giỏ hàng</div>;

  // Map dữ liệu backend sang UI
  const items = (cart.gioHangChiTiets || []).map((item: any): {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  } => ({
    id: item.id,
    name: item.sanPham?.tenSanPham || "",
    image: item.sanPham?.anhDaiDien || "/no-image.png",
    price: item.gia,
    quantity: item.soLuong,
  }));

  const handleQuantityChange = (id: number, delta: number) => {
    const found = items.find((item: { id: number }) => item.id === id);
    if (!found) return;
    const newQuantity = found.quantity + delta;
    if (newQuantity < 1) return;
    updateCartItem.mutate({ itemId: id, soLuong: newQuantity });
  };
  const handleRemove = (id: number) => {
    removeCartItem.mutate({ itemId: id });
  };
  const total = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <div className="max-w-6xl text-black mx-auto p-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8  ">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Giỏ Hàng</h1>
          <CartList
            items={items}
            onRemove={handleRemove}
            onQuanlityChange={handleQuantityChange}
          />
        </div>
        <CartSummary total={total} />
      </div>
    </>
  );
}
