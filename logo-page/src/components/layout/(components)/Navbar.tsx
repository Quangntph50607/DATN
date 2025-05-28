import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

export default function Navbar() {
  return (
    <div className="w-full relative h-[calc(100vh-96px)] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/banner1.jpg"
          alt="Baner"
          fill
          priority
          quality={100}
          className="object-cover "
          sizes="100vw"
        />
        {/* Nội dung */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 drop-shadow-lg">
            Siêu khuyến mãi
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-black drop-shadow  md:text-2xl">
            Giảm giá lên đến 30% toàn bộ sản phẩm lego
          </p>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105">
            MUA NGAY
          </Button>
        </div>
      </div>
    </div>
  );
}
