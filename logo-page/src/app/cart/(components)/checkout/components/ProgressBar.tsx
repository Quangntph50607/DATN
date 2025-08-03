import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProgressBar() {
  return (
    <Card className="mb-6 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4 px-6 pt-6">
          <h1 className="text-xl font-bold">Thanh toán đơn hàng</h1>
        </div>

        <div className="flex items-center gap-4 text-sm mb-6 px-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>Giỏ hàng</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">2</span>
            </div>
            <span className="text-orange-500 font-medium">Thanh toán</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-black/40 text-xs">3</span>
            </div>
            <span className="text-black/40">Hoàn tất</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
