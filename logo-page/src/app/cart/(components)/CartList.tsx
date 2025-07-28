import React from "react";
import { CartItem } from "./CartItem";

interface CartListProps {
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

export const CartList = ({
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
}: CartListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-white">
        <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          imageUrl={imageUrls[item.id]}
          productDetails={productDetails}
          categoryNames={categoryNames}
          brandNames={brandNames}
          originNames={originNames}
          onSelect={onSelect}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  );
};


