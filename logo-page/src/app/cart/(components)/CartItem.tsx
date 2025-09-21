"use client";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCartIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItemType } from "@/components/types/cart";
import { updateCartItem } from "@/context/cartLocal";

interface CartProps {
  items: CartItemType[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

export function CartItem({
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onRemove,
  formatCurrency,
}: CartProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  console.log("ListCart:", items);
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCartIcon className="w-10 h-10 text-gray-600" />
          <p className="text-gray-800 font-semibold text-2xl">
            Giỏ hàng của bạn đang trống
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => router.push("/product")}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (id: number, delta: number) => {
    const item = items.find((item) => item.id === id);
    if (!item) return;

    // Không cho phép thay đổi số lượng nếu sản phẩm hết hàng
    if (item.isOutOfStock) {
      showError("Sản phẩm này đã hết hàng!");
      return;
    }

    const newQty = item.quantity + delta;
    const result = updateCartItem(
      { ...item, quantity: newQty },
      item.maxQuantity ?? 20,
      { override: true }
    );

    if (!result.success) {
      showError(result.message || "Có lỗi xảy ra!");
    } else {
      onQuantityChange(id, delta);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-200 text-red-600 p-3 rounded-lg shadow-md animate-fade-in">
          {errorMessage}
        </div>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-4 p-4 bg-white rounded-lg border transition-shadow duration-200 ${
            item.isOutOfStock
              ? "border-red-200 bg-red-50 opacity-75"
              : "border-gray-200 hover:shadow-md"
          }`}
        >
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onCheckedChange={() => onSelect(item.id)}
            disabled={item.isOutOfStock}
            className="border-gray-400 w-5 h-5 data-[state=checked]:bg-orange-500 disabled:opacity-50"
            aria-label={`Chọn sản phẩm ${item.name}`}
          />

          <Link
            href={`/product/${item.id}`}
            className="w-20 h-20 relative group flex-shrink-0"
          >
            <Image
              src={item.image || "/images/placeholder-product.png"}
              alt={item.name}
              fill
              className="object-cover rounded-md group-hover:opacity-90 transition-opacity duration-200"
            />
          </Link>

          <div className="flex-1 min-w-0 space-y-1">
            <Link href={`/product/${item.id}`}>
              <h3
                className={`font-medium line-clamp-2 transition-colors duration-200 ${
                  item.isOutOfStock
                    ? "text-gray-500"
                    : "text-gray-800 hover:text-orange-600"
                }`}
              >
                {item.name}
                {item.isOutOfStock && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    Hết hàng
                  </span>
                )}
              </h3>
            </Link>
            <div
              className={`text-lg font-semibold ${
                item.isOutOfStock ? "text-gray-500" : "text-orange-600"
              }`}
            >
              {formatCurrency(item.price)}
            </div>
            {item.isOutOfStock && item.currentStock !== undefined && (
              <div className="text-sm text-red-600">
                Tồn kho hiện tại: {item.currentStock} sản phẩm
              </div>
            )}
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg p-1 ${
              item.isOutOfStock ? "bg-gray-100" : "bg-yellow-100"
            }`}
          >
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, -1)}
              disabled={item.quantity <= 1 || item.isOutOfStock}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md w-8 h-8 transition-colors duration-200 disabled:opacity-50"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span
              className={`w-8 text-center font-medium ${
                item.isOutOfStock ? "text-gray-500" : "text-gray-800"
              }`}
            >
              {item.quantity}
            </span>
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, 1)}
              disabled={
                item.quantity >= (item.maxQuantity ?? 20) || item.isOutOfStock
              }
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-md w-8 h-8 transition-colors duration-200 disabled:opacity-50"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => onRemove(item.id)}
            className="bg-red-100 hover:bg-red-200 text-red-600 rounded-md w-8 h-8 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
