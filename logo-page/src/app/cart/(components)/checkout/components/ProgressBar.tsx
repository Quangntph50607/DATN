import React from 'react';

export default function ProgressBar() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
          <span className="text-white">📦</span>
        </div>
        <h1 className="text-xl font-bold text-black">Thanh toán đơn hàng</h1>
      </div>

      <div className="flex items-center gap-4 text-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-black">Giỏ hàng</span>
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
            <span className="text-gray-600 text-xs">3</span>
          </div>
          <span className="text-gray-500">Hoàn tất</span>
        </div>
      </div>
    </div>
  );
}