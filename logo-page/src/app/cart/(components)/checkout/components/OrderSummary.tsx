import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { CartItemType } from "@/components/types/cart";
import { ShoppingCartIcon } from "lucide-react";

interface OrderSummaryProps {
  products: CartItemType[];
  onGoBack: () => void;
}

export default function OrderSummary({
  products,
  onGoBack,
}: OrderSummaryProps) {
  const [openAlert, setOpenAlert] = useState(false);

  return (
    <Card className="p-6 sticky top-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCartIcon />
          <h2 className="text-lg font-semibold">Đơn hàng của bạn</h2>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 border-b border-gray-100"
            >
              <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0 border border-gray-200">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {product.name}
                </div>
                <div className="text-xs">SL: {product.quantity}</div>
              </div>
              <div className="text-sm font-medium">
                {(
                  (product.finalPrice ?? product.price) * product.quantity
                ).toLocaleString()}
                đ
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt giá */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Giảm giá</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Phí ship</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-bold">
              <span>Tổng cộng</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-6 space-y-3">
          <Button
            className="w-full border border-gray-300 text-black py-2 rounded-lg hover:bg-gray-100 transition-colors bg-white"
            onClick={onGoBack}
            type="button"
          >
            ← Quay lại giỏ hàng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
