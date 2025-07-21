import React from "react";
import CartItem from "./CartItem";

interface Item {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartListProps {
  items: Item[];
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  imageUrls: Record<number, string | null>;
}

export default function CartList({
  items,
  onRemove,
  onQuantityChange,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  imageUrls,
}: CartListProps) {
  return (
    <div className="overflow-x-auto">
      {items.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded mb-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            aria-label="Chọn tất cả sản phẩm"
          />
          <span className="font-medium">Chọn tất cả ({items.length} sản phẩm)</span>
        </div>
      )}

      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                aria-label="Chọn tất cả sản phẩm"
              />
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Ảnh</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Sản phẩm</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Đơn giá</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Số lượng</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Thành tiền</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItem
              key={item.id}
              {...item}
              onRemove={onRemove}
              onQuantityChange={onQuantityChange}
              selectedIds={selectedIds}
              onSelect={onSelect}
              imageUrls={imageUrls}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
