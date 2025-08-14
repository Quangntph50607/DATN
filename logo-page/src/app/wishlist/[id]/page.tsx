'use client';
import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { WishListProduct } from '@/components/types/wishlist-type';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/(components)/(pages)/Header';
import Footer from '@/components/layout/(components)/(pages)/Footer';

interface WishListData {
    id: number;
    ten: string;
    userId: number;
    tenUser: string;
    ngayTao: string;
}

interface WishListResponse {
    id: number;
    ten: string;
    user: {
        id: number;
        ten: string;
    };
    ngayTao: string;
}

export default function SharedWishListPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [wishList, setWishList] = useState<WishListData | null>(null);
    const [products, setProducts] = useState<WishListProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false); // Thêm state

    useEffect(() => {
        const fetchWishList = async () => {
            try {
                setLoading(true);

                // Fetch all wishlists to find the one with matching ID
                const allWishlistsResponse = await fetch(`http://localhost:8080/api/lego-store/san-pham-yeu-thich/get-wishlist`);

                if (allWishlistsResponse.ok) {
                    const allWishlists: WishListResponse[] = await allWishlistsResponse.json();
                    console.log('All wishlists:', allWishlists);
                    console.log('Looking for ID:', resolvedParams.id);

                    const targetWishlist = allWishlists.find((wl: WishListResponse) => wl.id === parseInt(resolvedParams.id));
                    console.log('Target wishlist:', targetWishlist);

                    if (targetWishlist) {
                        setWishList({
                            id: targetWishlist.id,
                            ten: targetWishlist.ten,
                            userId: targetWishlist.user.id,
                            tenUser: targetWishlist.user.ten,
                            ngayTao: targetWishlist.ngayTao
                        });

                        // Fetch products for this wishlist
                        const productsResponse = await fetch(`http://localhost:8080/api/lego-store/san-pham-yeu-thich/user/${resolvedParams.id}`);

                        if (productsResponse.ok) {
                            const productsData = await productsResponse.json();
                            console.log('Products data:', productsData);
                            setProducts(productsData);
                        } else {
                            console.log('Products response not ok:', productsResponse.status);
                            setProducts([]);
                        }
                    } else {
                        setError('Không tìm thấy wish list này');
                    }
                } else {
                    console.log('Wishlists response not ok:', allWishlistsResponse.status);
                    setError('Không tìm thấy wish list này');
                }
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                setError('Có lỗi xảy ra khi tải wish list');
            } finally {
                setLoading(false);
            }
        };

        if (resolvedParams.id) {
            fetchWishList();
        }
    }, [resolvedParams.id]);

    const addToCart = (product: WishListProduct) => {
        let cart: Array<{ id: number; name: string; image: string; price: number; quantity: number }> = [];
        try {
            const cartData = localStorage.getItem("cartItems");
            cart = cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
            cart = [];
        }

        const index = cart.findIndex((item) => item.id === product.spId);
        if (index !== -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({
                id: product.spId,
                name: product.tenSP,
                image: product.anhSps?.[0]?.url || "",
                price: product.giaKM || product.gia,
                quantity: 1,
            });
        }
        localStorage.setItem("cartItems", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        setShowAddToCartSuccess(true); // Hiện popup
        setTimeout(() => setShowAddToCartSuccess(false), 2000); // Ẩn sau 2s
    };

    const addAllToCart = () => {
        let cart: Array<{ id: number; name: string; image: string; price: number; quantity: number }> = [];
        try {
            const cartData = localStorage.getItem("cartItems");
            cart = cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
            cart = [];
        }

        products.forEach(product => {
            const index = cart.findIndex((item) => item.id === product.spId);
            if (index !== -1) {
                cart[index].quantity += 1;
            } else {
                cart.push({
                    id: product.spId,
                    name: product.tenSP,
                    image: product.anhSps?.[0]?.url || "",
                    price: product.giaKM || product.gia,
                    quantity: 1,
                });
            }
        });

        localStorage.setItem("cartItems", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        setShowAddToCartSuccess(true); // Hiện popup
        setTimeout(() => setShowAddToCartSuccess(false), 2000); // Ẩn sau 2s
    };

    const totalCost = products.reduce((total, product) => total + (product.giaKM || product.gia), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Skeleton className="h-8 w-64 mb-4" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="mx-auto h-12 w-12 text-orange-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
                    <Link href="/">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Yêu thích: {wishList?.ten}
                        </h1>
                        <p className="text-gray-600">
                            Được chia sẻ bởi người dùng {wishList?.tenUser} • {products.length} sản phẩm
                        </p>
                    </div>

                    {/* Summary Card */}
                    <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Tổng giá: {formatPrice(totalCost)}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Xem và thêm sản phẩm từ wish list này vào giỏ hàng của bạn
                                    </p>
                                    {products.length > 0 && (
                                        <Button
                                            onClick={addAllToCart}
                                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Thêm tất cả vào giỏ hàng
                                        </Button>
                                    )}
                                </div>
                                <div className="hidden md:block">
                                    <Heart className="w-12 h-12 text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <Card key={product.id} className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1">
                                    <CardHeader className="p-0 relative">
                                        <div className="relative w-full h-48 overflow-hidden">
                                            {/* Badge */}
                                            <div className="absolute top-2 left-2 z-20">
                                                <Badge className="bg-red-500 text-white text-xs font-medium shadow-sm">
                                                    Yêu thích
                                                </Badge>
                                            </div>
                                            {/* Product Image */}
                                            <Link href={`/product/${product.spId}`} className="relative w-full h-full block">
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={product.anhSps?.[0]?.url ? `http://localhost:8080/api/anhsp/images/${product.anhSps[0].url}` : '/images/placeholder.jpg'}
                                                        alt={product.tenSP}
                                                        fill
                                                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
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
                                        <Link href={`/product/${product.spId}`} className="block">
                                            <h5 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem] flex-1 hover:text-blue-600 transition-colors">
                                                {product.tenSP}
                                            </h5>
                                        </Link>
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
                                                onClick={() => addToCart(product)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="mx-auto h-12 w-12 text-orange-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Yêu thích trống
                            </h3>
                            <p className="text-gray-600">
                                Không có sản phẩm nào trong yêu thích này
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Popup thông báo thêm giỏ hàng thành công */}
            {showAddToCartSuccess && (
                <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-xl font-semibold text-white text-center leading-tight">
                            Sản phẩm đã được thêm vào Giỏ hàng
                        </p>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
} 