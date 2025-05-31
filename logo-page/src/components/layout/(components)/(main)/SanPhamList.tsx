import { SanPham } from "@/components/types/product.type";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SanPhamListProps {
  products: SanPham[];
}

export default function SanPhamList({ products }: SanPhamListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => {
        const discountPercent =
          product.gia && product.giaKhuyenMai
            ? Math.round(
                ((product.gia - product.giaKhuyenMai) / product.gia) * 100
              )
            : 0;
        return (
          <div
            key={product.id}
            className="border border-gray-300 rounded-lg hover:shadow-lg transition-shadow p-4 relative"
          >
            <Link href={`/product/${product.id}`}>
              {product.anhDaiDien ? (
                <Image
                  src={product.anhDaiDien}
                  alt={product.tenSanPham}
                  width={200}
                  height={200}
                  className="object-cover w-full h-48"
                />
              ) : (
                <div className="w-full h-48 bg-gray-400 flex items-center justify-center">
                  <span>Không có ảnh</span>
                </div>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white font-bold rounded py-2 px-2 text-sm">
                  {" "}
                  -{discountPercent}%
                </span>
              )}
            </Link>
            <div className="flex flex-col gap-2 mr-2">
              <h3 className="text-lg font-semibold mt-2">
                {product.tenSanPham}
              </h3>
              <p className="text-gray-600">{product.moTa}</p>
              <div className="text-red-500 font-bold flex gap-4 justify-between">
                {product.giaKhuyenMai?.toLocaleString()}₫{" "}
                {product.gia && (
                  <span className="text-gray-400 line-through ml-2">
                    {product.gia.toLocaleString()}₫
                  </span>
                )}
              </div>
              <Button className="lego-login-button mt-2">
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
