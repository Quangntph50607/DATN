"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from "lucide-react";
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

export default function SanPhamListNoBox({ ps }: SanPhamListProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Hàm thêm vào giỏ hàng localStorage (giữ nguyên)
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

    // Nút scroll trái/phải
    const handleScroll = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const scrollAmount = carouselRef.current.clientWidth * 0.8;
        let newScrollPosition = scrollPosition;
        if (direction === 'left') {
            newScrollPosition = Math.max(0, scrollPosition - scrollAmount);
        } else {
            newScrollPosition = Math.min(
                carouselRef.current.scrollWidth - carouselRef.current.clientWidth,
                scrollPosition + scrollAmount
            );
        }
        carouselRef.current.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
        setScrollPosition(newScrollPosition);
    };

    const filtered = ps.filter(p => (p.noiBat === 1 || p.noiBat === true) && (!p.trangThai || p.trangThai === 'Đang kinh doanh'));

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
        <div className="relative max-w-7xl mx-auto px-6">
            {/* Nút điều hướng trái/phải */}
            <Button
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-blue-600 rounded-full w-12 h-12 shadow-lg hidden md:flex"
                onClick={() => handleScroll('left')}
            >
                <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-blue-600 rounded-full w-12 h-12 shadow-lg hidden md:flex"
                onClick={() => handleScroll('right')}
            >
                <ChevronRight className="w-6 h-6" />
            </Button>
            {/* Carousel scroll-x mượt, giữ nguyên nội dung card */}
            <div
                ref={carouselRef}
                className="flex space-x-8 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {filtered.map((p, idx) => {
                    const imgToUse = p.anhUrls?.find(img => img.anhChinh) || p.anhUrls?.[0];
                    const mainImageUrl = imgToUse?.url ? `http://localhost:8080/api/anhsp/images/${imgToUse.url}` : '/fallback-image.jpg';
                    const badge = getProductBadge(p);

                    return (
                        <motion.div
                            key={p.id}
                            className="flex-shrink-0 w-[320px] snap-center"
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

                                            <Image
                                                src={mainImageUrl}
                                                alt={p.tenSanPham}
                                                width={320}
                                                height={208}
                                                className="object-contain w-full h-full p-3"
                                                loading="lazy"
                                            />
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
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
} 