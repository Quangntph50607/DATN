import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCartIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductBadges } from "./ProductBadges";
import { useRouter } from "next/navigation";

interface CartProps {
  items: any[];
  selectedIds: number[];
  imageUrls: Record<number, string | null>;
  productDetails: any;
  categoryNames: { [key: number]: string };
  brandNames: { [key: number]: string };
  originNames: { [key: number]: string };
  onSelect: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

export const CartItem = ({
  items,
  selectedIds,
  imageUrls,
  productDetails,
  categoryNames,
  brandNames,
  originNames,
  onSelect,
  onQuantityChange,
  onRemove,
  formatCurrency,
}: CartProps) => {
  const [quantityChangeOpen, setQuantityChangeOpen] = useState(false);
  const [quantityAction, setQuantityAction] = useState<{
    id: number;
    delta: number;
  } | null>(null);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <>
        <div className="flex-col flex justify-center items-center gap-5">
          <div className="flex nb-5 gap-2">
            <ShoppingCartIcon className=" size-8 text-black" />
            <p className="text-gray-800 font-bold text-2xl">
              Giỏ hàng của bạn đang trống
            </p>
          </div>
          <Button
            className="lego-login-button"
            onClick={() => router.push("/product")}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </>
    );
  }

  const handleQuantityChange = (id: number, delta: number) => {
    const item = items.find((item) => item.id === id);
    if (delta < 0 && item?.quantity <= 1) {
      return; // Prevent going below 1
    }
    setQuantityAction({ id, delta });
    setQuantityChangeOpen(true);
    onQuantityChange(id, delta);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onCheckedChange={() => onSelect(item.id)}
            className="border-gray-400"
          />

          <Link
            href={`/product/${item.id}`}
            className="w-20 h-20 relative hover:opacity-80 transition-opacity"
          >
            <Image
              src={imageUrls[item.id] || "/images/placeholder-product.png"}
              alt={item.name}
              fill
              className="object-cover rounded-md"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.id}`}>
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                {item.name}
              </h3>
            </Link>
            <ProductBadges
              productDetails={productDetails}
              categoryNames={categoryNames}
              brandNames={brandNames}
              originNames={originNames}
              itemId={item.id}
            />
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(item.price)}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, -1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center text-gray-900 font-medium">
              {item.quantity}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleQuantityChange(item.id, 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-gray-600 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
