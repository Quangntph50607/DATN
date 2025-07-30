import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CartItem } from "./CartItem";

interface CartMainProps {
  items: any[];
  selectedIds: number[];
  imageUrls: Record<number, string | null>;
  productDetails: any;
  categoryNames: { [key: number]: string };
  brandNames: { [key: number]: string };
  originNames: { [key: number]: string };
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  formatCurrency: (amount: number) => string;
  onDeleteSelected?: () => void;
}

export const CartMain = ({
  items,
  selectedIds,
  imageUrls,
  productDetails,
  categoryNames,
  brandNames,
  originNames,
  onSelect,
  onSelectAll,
  onQuantityChange,
  onRemove,
  formatCurrency,
  onDeleteSelected,
}: CartMainProps) => {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <Card className="flex-1 bg-white border-gray-200 shadow-sm">
      <CardHeader className="bg-white border-b border-gray-100">
        <CardTitle className="flex items-center justify-between text-gray-900">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              className="border-gray-400"
            />
            <span>
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"} ({items.length}{" "}
              sản phẩm)
            </span>
          </div>
          {allSelected && selectedIds.length > 0 && onDeleteSelected && (
            <Button
              className="text-gray-600 hover:text-red-500 hover:bg-red-50"
              size="sm"
              onClick={onDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa đã chọn ({selectedIds.length})
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-4">
        <CartItem
          items={items}
          selectedIds={selectedIds}
          imageUrls={imageUrls}
          productDetails={productDetails}
          categoryNames={categoryNames}
          brandNames={brandNames}
          originNames={originNames}
          onSelect={onSelect}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          formatCurrency={formatCurrency}
        />
      </CardContent>
    </Card>
  );
};
