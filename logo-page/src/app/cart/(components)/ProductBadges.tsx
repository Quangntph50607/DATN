import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductBadgesProps {
  productDetails: any;
  categoryNames: { [key: number]: string };
  brandNames: { [key: number]: string };
  originNames: { [key: number]: string };
  itemId: number;
}

export const ProductBadges = ({
  productDetails,
  categoryNames,
  brandNames,
  originNames,
  itemId,
}: ProductBadgesProps) => {
  const product = productDetails[itemId];

  if (!product) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {product.danhMucId && categoryNames[product.danhMucId] && (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
          {categoryNames[product.danhMucId]}
        </Badge>
      )}
      {product.thuongHieuId && brandNames[product.thuongHieuId] && (
        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
          {brandNames[product.thuongHieuId]}
        </Badge>
      )}
      {product.xuatXuId && originNames[product.xuatXuId] && (
        <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
          {originNames[product.xuatXuId]}
        </Badge>
      )}
    </div>
  );
};
