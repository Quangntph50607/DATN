'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { WishListProduct } from '@/components/types/wishlist-type';

interface WishListProductCardProps {
    product: WishListProduct;
    wishlistId: number;
    onRemove: (spId: number) => void;
    onAddToCart: (product: WishListProduct) => void;
}

export function WishListProductCard({ product, onRemove, onAddToCart }: WishListProductCardProps) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsRemoving(true);
        try {
            await onRemove(product.spId);
        } catch (error) {
            console.error('Error removing product:', error);
            toast.error('Có lỗi xảy ra khi xóa sản phẩm');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(product);
    };

    return (
        <Link href={`/product/${product.spId}`} className="block h-full">
            <Card className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <CardHeader className="p-0 relative">
                    <div className="relative w-full h-48 overflow-hidden">
                        {/* Badge */}
                        <div className="absolute top-2 left-2 z-20">
                            <Badge className="bg-red-500 text-white text-xs font-medium shadow-sm">
                                Yêu thích
                            </Badge>
                        </div>

                        {/* Remove Button */}
                        <div className="absolute top-2 right-2 z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                                disabled={isRemoving}
                                className="h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Product Image */}
                        <div className="relative w-full h-full">
                            <Image
                                src={product.anhSps?.[0]?.url ? `http://localhost:8080/api/anhsp/images/${product.anhSps[0].url}` : '/images/placeholder.jpg'}
                                alt={product.tenSP}
                                fill
                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="default" className="text-xs font-medium text-blue-600">
                                {product.tenDanhMuc}
                            </Badge>
                            <span className="text-xs text-gray-400">
                                {product.maSP}
                            </span>
                        </div>
                    </div>

                    <h5 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] flex-1">
                        {product.tenSP}
                    </h5>

                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="text-xs text-gray-600">
                            Độ tuổi: {product.doTuoi}+
                        </Badge>
                        <Badge variant="default" className="text-xs text-gray-600">
                            Còn: {product.soLuongTon}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-800">
                                {formatPrice(product.giaKM || product.gia)}
                            </span>
                            {product.giaKM && product.giaKM < product.gia && (
                                <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(product.gia)}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
} 