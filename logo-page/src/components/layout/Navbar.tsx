import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <div className="lego-banner-container relative overflow-hidden bg-gradient-to-r from-[#FF1100] to-[#FF6B00]">
      <div className="container mx-auto flex items-center justify-between px-6 py-4 h-48">
        {/* Text content */}
        <div className="z-10 max-w-2xl">
          <h2 className="lego-banner-title text-4xl font-bold text-white mb-4">
            SIÊU SALE THÁNG 8
          </h2>
          <p className="lego-banner-text text-xl text-white mb-6">
            Giảm giá đến 50% trên toàn bộ sản phẩm LEGO
          </p>
          <Button className="lego-banner-button text-lg px-8 py-4">
            MUA NGAY
          </Button>
        </div>

        {/* Hình ảnh LEGO */}
        <div className="relative z-10 w-64 h-64">
          <Image
            src="/images/lego-banner-figure.png"
            alt="LEGO Figure"
            fill
            className="object-contain"
          />
        </div>

        {/* Hiệu ứng nền LEGO */}
        <div className="absolute inset-0 lego-banner-pattern opacity-20" />
      </div>
    </div>
  );
}
