import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className="w-full">
      {/* Banner */}
      {/* <div className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="/images/banner1.jpg"
          alt="Banner"
          fill
          priority
          quality={100}
          className="object-cover"
          sizes="100vw"
        /> */}

      {/* Nội dung trên banner */}
      {/* <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 drop-shadow-lg">
            Siêu khuyến mãi
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-black drop-shadow md:text-2xl">
            Giảm giá lên đến 30% toàn bộ sản phẩm lego
          </p>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105">
            <Link href="/product">MUA NGAY</Link>
          </Button>
        </div>
      </div> */}

      {/* Đường dẫn dưới banner */}
      <div className="w-full bg-orange-300 flex gap-6 justify-center py-4">
        {[
          { href: "/product", label: "Sản phẩm" },
          { href: "/1", label: "Cửa hàng" },
          { href: "/2", label: "Giới thiệu" },
          { href: "/3", label: "Phần thưởng" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative text-lg md:text-xl font-semibold text-gray-800 transition-all duration-300 hover:text-black group"
          >
            {item.label}
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
