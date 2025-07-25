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
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface SanPhamListProps {
    ps: KhuyenMaiTheoSanPham[];
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

    // Lọc chỉ lấy sản phẩm nổi bật và đang hoạt động
    const filtered = ps.filter(p => (p.noiBat === 1 || p.noiBat === true) && (!p.trangThai || p.trangThai === 'Đang kinh doanh'));

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
                    return (
                        <motion.div
                            key={p.id}
                            className="flex-shrink-0 w-[320px] snap-center"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.08 }}
                        >
                            <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-200 group relative w-full mx-auto">
                                <Link href={`/product/${p.id}`} className="block">
                                    <CardHeader className="p-0">
                                        <div className="relative w-full h-52 bg-gray-50 group-hover:bg-blue-50 transition">
                                            <Image
                                                src={mainImageUrl}
                                                alt={p.tenSanPham}
                                                width={220}
                                                height={220}
                                                className="object-cover w-full h-52 rounded-t-2xl"
                                                loading="lazy"
                                            />
                                            {/* Nút giỏ hàng khi hover */}
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
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
} 