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
import { ShoppingCart, ChevronLeft, ChevronRight, Heart } from "lucide-react";
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
    return <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1"></div>;
  }
  return (
    <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">
      {danhMuc.tenDanhMuc}
    </div>
  );
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
      if (product.anhSps && Array.isArray(product.anhSps) && product.anhSps.length > 0) {
        try {
          const mainImage = typeof product.anhSps[0] === 'string'
            ? product.anhSps[0]
            : product.anhSps[0]?.url;
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
        image: sp.anhSps?.[0]?.url || "",
        price: sp.giaKhuyenMai || sp.gia,
        quantity: 1,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng!");
  };

  // Badge logic giống NoBox
  const getProductBadge = (product: KhuyenMaiTheoSanPham) => {
    if (product.giaKhuyenMai && product.giaKhuyenMai < product.gia) {
      return "Khuyến mãi";
    }
    const price = product.giaKhuyenMai || product.gia;
    if (price >= 3000000) {
      return "Hàng hiếm";
    }
    if (product.noiBat) {
      return "Nổi bật";
    }
    return "Hàng mới";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-2xl flex-grow">
        {paginatedProducts.map((p, idx) => {
          let anhChinh = null;
          if (p.anhSps && Array.isArray(p.anhSps) && p.anhSps.length > 0) {
            const mainImg = p.anhSps.find(img => img.anhChinh);
            anhChinh = mainImg ? mainImg.url : p.anhSps[0].url;
          }
          const badge = getProductBadge(p);

          // Tính phần trăm giảm giá
          const discountPercent = p.giaKhuyenMai && p.giaKhuyenMai < p.gia
            ? Math.round(((p.gia - p.giaKhuyenMai) / p.gia) * 100)
            : 0;

          return (
            <motion.div
              key={p.id}
              className="flex-shrink-0 w-full"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <Link href={`/product/${p.id}`} className="block">
                <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-200 group relative w-full mx-auto">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-52">
                      {/* Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {badge}
                        </span>
                      </div>
                      {/* Heart Icon - Top Right */}
                      <div className="absolute top-3 right-3 z-10">
                        <Button className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-md">
                          <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                      <div className="relative w-full h-52 bg-gray-100">
                        {imageUrls[p.id] ? (
                          <Image
                            src={imageUrls[p.id]!}
                            alt={p.tenSanPham}
                            width={320}
                            height={208}
                            className="object-contain w-full h-full p-3"
                            loading="lazy"
                          />
                        ) : anhChinh ? (
                          <Image
                            src={`http://localhost:8080/api/anhsp/images/${anhChinh}`}
                            alt={p.tenSanPham}
                            width={320}
                            height={208}
                            className="object-contain w-full h-full p-3"
                            loading="lazy"
                          />
                        ) : (
                          <Image
                            src="/fallback-image.jpg"
                            alt="Không có ảnh"
                            width={320}
                            height={208}
                            className="object-contain w-full h-full p-3"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pb-1">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <CategoryName danhMucId={p.danhMucId} />
                        <div className="text-xs text-gray-400">
                          {p.maSanPham}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-2 h-[44px] text-gray-900 group-hover:text-blue-700 transition mb-2">
                      {p.tenSanPham}
                    </CardTitle>
                    <div className="text-xs text-gray-600 mb-2">
                      Độ tuổi: {p.doTuoi}+
                    </div>
                    <div className="flex items-center justify-between mb-0 pb-0">
                      <div className="text-lg font-bold text-blue-800">
                        {(p.giaKhuyenMai || p.gia).toLocaleString("vi-VN")}₫
                      </div>
                      {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                        <div className="text-xs text-gray-400 line-through">
                          {p.gia.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <CardFooter className="p-1 pt-0">
                <div className="flex gap-2 w-full justify-center">
                  <Button
                    className="w-60 bg-yellow-400 text-blue-800 hover:bg-yellow-500 rounded-xl font-bold text-base h-9 min-h-0"
                    style={{ marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCartLocal(p);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 border-gray-300 hover:bg-red-50 hover:border-red-300"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </CardFooter>
            </motion.div>
          );
        })}
      </div>
      {/* Pagination giữ nguyên */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pb-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
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
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}





