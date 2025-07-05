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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {ps.map((p) => {
        const anhChinh = p.anhUrls && Array.isArray(p.anhUrls) && p.anhUrls.length > 0
          ? (typeof p.anhUrls[0] === 'string' ? p.anhUrls[0] : p.anhUrls[0]?.url)
          : null;

        return (
          <Card
            key={p.id}
            className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Link href={`/product/${p.id}`} className="block">
              <CardHeader className="p-0">
                <div className="relative w-full h-48 bg-gray-100">
                  {imageUrls[p.id] ? (
                    <Image
                      src={imageUrls[p.id]!}
                      alt={p.tenSanPham}
                      width={200}
                      height={200}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                  ) : anhChinh ? (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">Đang tải ảnh...</span>
                    </div>
                  ) : (
                    <Image
                      src="/fallback-image.jpg" // Đường dẫn đến ảnh dự phòng
                      alt="Không có ảnh"
                      width={200}
                      height={200}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-base font-semibold line-clamp-2 h-12 text-gray-900">
                  {p.tenSanPham}
                </CardTitle>
                <div className="flex items-center justify-between text-sm font-medium mt-2">
                  <span className="text-red-600">
                    {p.giaKhuyenMai?.toLocaleString("vi-VN")}₫
                  </span>
                  {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                    <span className="line-through text-gray-400">
                      {p.gia.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
              </CardContent>
            </Link>
            <CardFooter className="p-4">
              <Button asChild className="w-full">
                <Link href={`/product/${p.id}`}>Xem chi tiết</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}