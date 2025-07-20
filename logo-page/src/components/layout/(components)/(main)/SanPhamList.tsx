"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { getAnhByFileName } from "@/services/anhSanPhamService";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

export default function SanPhamList({ ps }: SanPhamListProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  const loadImages = async (products: KhuyenMaiTheoSanPham[]) => {
    const urls: Record<string, string | null> = {};
    for (const product of products) {
      if (product.anhUrls && Array.isArray(product.anhUrls) && product.anhUrls.length > 0) {
        try {
          const mainImage = typeof product.anhUrls[0] === 'string'
            ? product.anhUrls[0]
            : product.anhUrls[0]?.url;
          if (!mainImage) {
            throw new Error('Không tìm thấy URL ảnh hợp lệ');
          }
          console.log("Đang tải ảnh:", mainImage);
          const imageBlob = await getAnhByFileName(mainImage);
          urls[product.id] = URL.createObjectURL(imageBlob);
        } catch (error) {
          console.error(`Lỗi tải ảnh cho sản phẩm ID ${product.id}:`, error);
          urls[product.id] = null;
        }
      } else {
        urls[product.id] = null;
      }
    }
    setImageUrls(urls);
  };

  useEffect(() => {
    if (ps && ps.length > 0) {
      loadImages(ps);
    }
  }, [ps]);

  // Hàm thêm vào giỏ hàng localStorage
  const addToCartLocal = (sp: KhuyenMaiTheoSanPham) => {
    const cart: Array<{ id: number, name: string, image: string, price: number, quantity: number }> = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const index = cart.findIndex((item: { id: number }) => item.id === sp.id);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: sp.id,
        name: sp.tenSanPham,
        image: sp.anhUrls?.[0]?.url || "",
        price: sp.giaKhuyenMai || sp.gia,
        quantity: 1,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      {ps.map((p) => {
        const anhChinh = p.anhUrls && Array.isArray(p.anhUrls) && p.anhUrls.length > 0
          ? (typeof p.anhUrls[0] === 'string' ? p.anhUrls[0] : p.anhUrls[0]?.url)
          : null;

        return (
          <Card
            key={p.id}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-200 group relative"
          >
            <Link href={`/product/${p.id}`} className="block">
              <CardHeader className="p-0">
                <div className="relative w-full h-52 bg-gray-50 group-hover:bg-blue-50 transition">
                  {imageUrls[p.id] ? (
                    <Image
                      src={imageUrls[p.id]!}
                      alt={p.tenSanPham}
                      width={220}
                      height={220}
                      className="object-cover w-full h-52 rounded-t-2xl"
                      loading="lazy"
                    />
                  ) : anhChinh ? (
                    <div className="w-full h-52 bg-gray-200 flex items-center justify-center rounded-t-2xl">
                      <span className="text-gray-400 text-base">Đang tải ảnh...</span>
                    </div>
                  ) : (
                    <Image
                      src="/fallback-image.jpg"
                      alt="Không có ảnh"
                      width={220}
                      height={220}
                      className="object-cover w-full h-52 rounded-t-2xl"
                      loading="lazy"
                    />
                  )}
                  {/* Icon giỏ hàng hiển thị khi hover */}
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCartLocal(p);
                    }}
                    className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700 z-10"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart size={22} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <CardTitle className="text-lg font-bold line-clamp-2 h-12 text-gray-900 group-hover:text-blue-700 transition">
                  {p.tenSanPham}
                </CardTitle>
                <div className="flex items-center justify-between text-base font-semibold mt-3">
                  <span className="text-red-500">
                    {p.giaKhuyenMai?.toLocaleString("vi-VN")}₫
                  </span>
                  {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                    <span className="line-through text-gray-400 text-sm">
                      {p.gia.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
              </CardContent>
            </Link>
            <CardFooter className="p-5 pt-0">
              <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-semibold shadow-md transition">
                <Link href={`/product/${p.id}`}>Xem chi tiết</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}