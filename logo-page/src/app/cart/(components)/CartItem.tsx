import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductBadges } from "./ProductBadges";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CartItemProps {
  item: any;
  isSelected: boolean;
  imageUrl: string | null;
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
  item,
  isSelected,
  imageUrl,
  productDetails,
  categoryNames,
  brandNames,
  originNames,
  onSelect,
  onQuantityChange,
  onRemove,
  formatCurrency,
}: CartItemProps) => {
  const [quantityChangeOpen, setQuantityChangeOpen] = useState(false);
  const [quantityAction, setQuantityAction] = useState<{ id: number; delta: number } | null>(null);

  const handleQuantityChange = (id: number, delta: number) => {
    if (delta < 0 && item.quantity <= 1) {
      return; // Prevent going below 1
    }
    setQuantityAction({ id, delta });
    setQuantityChangeOpen(true);
  };

  const confirmQuantityChange = () => {
    if (quantityAction) {
      onQuantityChange(quantityAction.id, quantityAction.delta);
      setQuantityChangeOpen(false);
      setQuantityAction(null);
      toast.success(
        quantityAction.delta > 0
          ? "Đã tăng số lượng sản phẩm!"
          : "Đã giảm số lượng sản phẩm!"
      );
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.id)}
          className="border-gray-400"
        />

        <Link href={`/product/${item.id}`} className="w-20 h-20 relative hover:opacity-80 transition-opacity">
          <Image
            src={imageUrl || "/images/placeholder-product.png"}
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
          <div className="text-sm text-gray-500 line-through">
            {formatCurrency(Math.floor(item.price * 1.2))}
          </div>
          <div className="text-sm text-green-600">
            Tiết kiệm {formatCurrency(Math.floor(item.price * 0.2))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.id, -1)}
            disabled={item.quantity <= 1}
            className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center text-gray-900 font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.id, 1)}
            className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-red-500 hover:bg-red-50"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-gray-600 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AlertDialog for quantity change confirmation */}
      <AlertDialog open={quantityChangeOpen} onOpenChange={setQuantityChangeOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Xác nhận thay đổi số lượng</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn {quantityAction?.delta && quantityAction.delta > 0 ? "tăng" : "giảm"} số lượng sản phẩm này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black border-gray-300">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmQuantityChange}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


