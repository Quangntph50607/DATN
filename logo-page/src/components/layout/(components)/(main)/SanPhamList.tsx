"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

export default function SanPhamList({ ps }: SanPhamListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {ps.map((p) => {
        const anhChinh = p.anhUrls;

        return (
          <Card key={p.id} className="overflow-hidden shadow-md rounded-2xl">
            <Link href={`/product/${p.id}`}>
              <div className="relative w-full h-48 bg-gray-100">
                {anhChinh ? (
                  <Image
                    src={anhChinh}
                    alt={p.tenSanPham}
                    width={200}
                    height={200}
                    className="object-cover w-full h-48"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                    <span>Không có ảnh</span>
                  </div>
                )}
              </div>
            </Link>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold line-clamp-2 h-12">
                {p.tenSanPham}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 py-2">
              <div className="flex items-center justify-between text-sm font-medium">
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

            <CardFooter className="px-4 pb-4">
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
