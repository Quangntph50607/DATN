"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Memoize pagination calculations
  const totalPages = useMemo(() => Math.ceil(ps.length / itemsPerPage), [ps.length]);

  const paginatedProducts = useMemo(() =>
    ps.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [ps, currentPage, itemsPerPage]
  );

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
    const timeoutId = setTimeout(() => {
      if (paginatedProducts.length > 0) {
        loadImages(paginatedProducts);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [paginatedProducts]);

  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      Object.values(imageUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

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
    <div className="min-h-screen flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl flex-grow">
        {paginatedProducts.map((p) => {
          const anhChinh = p.anhUrls && Array.isArray(p.anhUrls) && p.anhUrls.length > 0
            ? (typeof p.anhUrls[0] === 'string' ? p.anhUrls[0] : p.anhUrls[0]?.url)
            : null;

          // Tính phần trăm giảm giá
          const discountPercent = p.giaKhuyenMai && p.giaKhuyenMai < p.gia
            ? Math.round(((p.gia - p.giaKhuyenMai) / p.gia) * 100)
            : 0;

          return (
            <Card
              key={p.id}
              className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl border border-gray-200 bg-white transition-all duration-300 group relative"
            >
              <Link href={`/product/${p.id}`} className="block">
                <CardHeader className="p-0 relative">


                  {/* Heart Icon - Top Right */}
                  <div className="absolute top-3 right-3 z-10">
                    <Button className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-md">
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                  </div>

                  <div className="relative w-full h-52 bg-gray-100">
                    {imageUrls[p.id] ? (
                      <Image
                        src={imageUrls[p.id]!}
                        alt={p.tenSanPham}
                        width={220}
                        height={220}
                        className="object-cover w-full h-52 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : anhChinh ? (
                      <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Đang tải ảnh...</span>
                      </div>
                    ) : (
                      <Image
                        src="/fallback-image.jpg"
                        alt="Không có ảnh"
                        width={220}
                        height={220}
                        className="object-cover w-full h-52"
                        loading="lazy"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 bg-white">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      {p.danhMucId || 'LEGO SET'}
                    </span>
                  </div>

                  {/* Product Title */}
                  <CardTitle className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[48px] group-hover:text-blue-600 transition-colors">
                    {p.tenSanPham}
                  </CardTitle>

                  {/* Product Details */}
                  <div className="text-xs text-gray-500 mb-3 flex items-center gap-3">
                    <span>{p.soLuongManhGhep || 0} chi tiết</span>
                    <span>•</span>
                    <span>Tuổi {p.doTuoi || 6}+</span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-medium text-gray-700">
                      {(p.danhGiaTrungBinh || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({p.soLuongVote || 0} đánh giá)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-600 text-white text-lg font-bold px-3 py-1 rounded-full">
                        {(p.giaKhuyenMai || p.gia).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                      <div className="text-sm text-gray-400 line-through">
                        {p.gia.toLocaleString("vi-VN")}₫
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>

              <CardFooter className="p-4 pt-0 bg-white">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCartLocal(p);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <ShoppingCart size={16} />
                  Thêm vào giỏ
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pb-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            ← Trước
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="px-3 py-1"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            Sau →
          </Button>
        </div>
      )}
    </div>
  );
}





