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
import { ShoppingCart, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDanhMucID } from "@/hooks/useDanhMuc";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

// Component con để hiển thị tên danh mục
function CategoryName({ danhMucId }: { danhMucId: number | null }) {
  const { data: danhMuc } = useDanhMucID(danhMucId || 0);
  if (!danhMucId || !danhMuc) {
    return <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"></div>;
  }
  return (
    <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
      {danhMuc.tenDanhMuc}
    </div>
  );
}

// Hàm lấy ảnh chính từ danh sách ảnh
const getMainImageUrl = (product: KhuyenMaiTheoSanPham) => {
  // Kiểm tra anhUrls thay vì anhSps
  const anhUrls = product.anhUrls;

  if (!anhUrls || anhUrls.length === 0) {
    return '/images/placeholder-product.png';
  }

  // Tìm ảnh chính (anhChinh: true)
  const mainImg = anhUrls.find((img) => img.anhChinh === true);
  const imgToUse = mainImg || anhUrls[0];

  if (imgToUse && imgToUse.url) {
    return `http://localhost:8080/api/anhsp/images/${imgToUse.url}`;
  }

  return '/images/placeholder-product.png';
};

export default function SanPhamList({ ps }: SanPhamListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const itemsPerPage = 6;

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize pagination calculations
  const totalPages = useMemo(() => Math.ceil(ps.length / itemsPerPage), [ps.length]);

  const paginatedProducts = useMemo(() =>
    ps.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [ps, currentPage, itemsPerPage]
  );

  // Hàm thêm vào giỏ hàng localStorage
  const addToCartLocal = (sp: KhuyenMaiTheoSanPham) => {
    if (!isClient) return;

    const cart: Array<{ id: number, name: string, image: string, price: number, quantity: number }> = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const index = cart.findIndex((item: { id: number }) => item.id === sp.id);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      // Sửa lại để lấy từ anhUrls
      const mainImage = sp.anhUrls?.find(img => img.anhChinh) || sp.anhUrls?.[0];
      cart.push({
        id: sp.id,
        name: sp.tenSanPham,
        image: mainImage?.url || "",
        price: sp.giaKhuyenMai || sp.gia,
        quantity: 1,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    toast.success("🛒 Đã thêm vào giỏ hàng!", {
      description: `${sp.tenSanPham} đã được thêm vào giỏ hàng`,
      duration: 3000,
    });
  };

  // Badge logic cải tiến
  const getProductBadge = (product: KhuyenMaiTheoSanPham) => {
    if (product.giaKhuyenMai && product.giaKhuyenMai < product.gia) {
      const discountPercent = Math.round(((product.gia - product.giaKhuyenMai) / product.gia) * 100);
      return { text: `-${discountPercent}%`, color: "bg-red-500" };
    }
    const price = product.giaKhuyenMai || product.gia;
    if (price >= 3000000) {
      return { text: "Premium", color: "bg-purple-600" };
    }
    if (product.noiBat) {
      return { text: "Hot", color: "bg-orange-500" };
    }
    return { text: "New", color: "bg-green-500" };
  };

  // Render loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm nổi bật</h2>
          <p className="text-gray-600">Khám phá những sản phẩm tuyệt vời nhất của chúng tôi</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-80"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm nổi bật</h2>
        <p className="text-gray-600">Khám phá những sản phẩm tuyệt vời nhất của chúng tôi</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
        {paginatedProducts.map((p, idx) => {
          const badge = getProductBadge(p);
          const mainImageUrl = getMainImageUrl(p);

          // Tính phần trăm giảm giá
          const discountPercent = p.giaKhuyenMai && p.giaKhuyenMai < p.gia
            ? Math.round(((p.gia - p.giaKhuyenMai) / p.gia) * 100)
            : 0;

          return (
            <motion.div
              key={`product-${p.id}-${currentPage}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl border-0 bg-white transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="p-0 relative">
                  <div className="relative w-full h-64 overflow-hidden">
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                        {badge.text}
                      </span>
                    </div>

                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3 z-20">
                      <Button
                        className="bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 w-10 h-10 flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        type="button"
                      >
                        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                      </Button>
                    </div>

                    {/* Product Image */}
                    <Link href={`/product/${p.id}`} className="block w-full h-full">
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300">
                        <Image
                          src={mainImageUrl}
                          alt={p.tenSanPham}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="mb-3">
                    <CategoryName danhMucId={p.danhMucId} />
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 font-mono">
                        #{p.maSanPham}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">4.8</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/product/${p.id}`}>
                    <CardTitle className="text-lg font-bold line-clamp-2 h-[56px] text-gray-900 group-hover:text-blue-700 transition-colors duration-200 mb-3 leading-tight">
                      {p.tenSanPham}
                    </CardTitle>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {p.doTuoi}+ tuổi
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <div className="text-xl font-bold text-blue-600">
                        {(p.giaKhuyenMai || p.gia).toLocaleString("vi-VN")}₫
                      </div>
                      {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                        <div className="text-sm text-gray-400 line-through">
                          {p.gia.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <div className="text-sm font-bold text-red-500">
                        Tiết kiệm {discountPercent}%
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <div className="flex gap-3 w-full">
                    <button
                      className="flex-1 bg-gradient-to-r from-violet-50-50 bg-yellow-400 text-blue-800 hover:bg-yellow-500 text-white rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCartLocal(p);
                      }}
                      type="button"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </button>
                    <Button
                      className="h-11 w-11 border border-gray-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      type="button"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12 pb-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 inline-flex items-center gap-1 transition-colors"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl transition-colors ${currentPage === page
                  ? "bg-blue-600 text-white shadow-lg"
                  : "border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                type="button"
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 inline-flex items-center gap-1 transition-colors"
            type="button"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}



