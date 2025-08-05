'use client';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishList } from '@/hooks/useWishList';
import { useUserStore } from '@/context/authStore.store';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WishListModal } from './WishListModal';
import { WishList, WishListProduct } from '@/components/types/wishlist-type';
import { createPortal } from 'react-dom';
import { SuccessNotification } from '@/components/ui/success-notification';

interface WishListMenuItemProps {
    wishList: WishList;
    productId: number;
    isInWishList: boolean;
    onToggle: (wishlistId: number) => void;
    isLoading: boolean;
}

const WishListMenuItem = ({ wishList, isInWishList, onToggle, isLoading }: WishListMenuItemProps) => {
    const { useGetWishListProducts } = useWishList();
    const { data: products, isLoading: loadingProducts } = useGetWishListProducts(wishList.id);
    const productCount = products?.length || 0;

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(wishList.id);
            }}
            disabled={isLoading}
            className="flex items-center justify-between cursor-pointer text-gray-700 hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700"
            style={{
                backgroundColor: 'transparent',
                transition: 'none'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff7ed';
                e.currentTarget.style.color = '#c2410c';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
            }}
        >
            <div className="flex items-center space-x-2">
                <Heart className={cn("w-4 h-4", isInWishList ? "text-red-500 fill-current" : "text-gray-400")} />
                <span className="font-medium">{wishList.ten}</span>
            </div>
            <span className="text-xs text-gray-500">
                {loadingProducts ? '...' : `(${productCount})`}
            </span>
        </DropdownMenuItem>
    );
};

interface AddToWishListButtonProps {
    productId: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const AddToWishListButton = ({ productId, className, size = 'md' }: AddToWishListButtonProps) => {
    const { user } = useUserStore();
    const { useGetWishLists, useAddToWishList, useRemoveFromWishList } = useWishList();
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [wishListsWithProduct, setWishListsWithProduct] = useState<Set<number>>(new Set());
    const [isChecking, setIsChecking] = useState(true);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data: wishLists, refetch: refetchWishLists } = useGetWishLists(user?.id || 0);
    const addToWishList = useAddToWishList();
    const removeFromWishList = useRemoveFromWishList();

    // Kiểm tra sản phẩm có trong wishlist nào - sử dụng fetch trực tiếp
    useEffect(() => {
        if (wishLists && user && wishLists.length > 0) {
            setIsChecking(true);
            const checkProductInWishLists = async () => {
                const wishListsWithProductSet = new Set<number>();

                for (const wishList of wishLists) {
                    try {
                        const response = await fetch(`http://localhost:8080/api/lego-store/san-pham-yeu-thich/user/${wishList.id}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            },
                        });

                        if (response.ok) {
                            const products: WishListProduct[] = await response.json();
                            const hasProduct = products.some((p: WishListProduct) => p.spId === productId);

                            if (hasProduct) {
                                wishListsWithProductSet.add(wishList.id);
                            }
                        }
                    } catch (error) {
                        console.error(`Error checking product in wishlist ${wishList.id}:`, error);
                    }
                }

                setWishListsWithProduct(wishListsWithProductSet);
                setIsChecking(false);
            };

            checkProductInWishLists();
        } else {
            setIsChecking(false);
        }
    }, [wishLists, productId, user]);

    const handleToggleWishList = async (wishlistId: number) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào wish list');
            return;
        }

        setIsLoading(true);
        try {
            const isInWishList = wishListsWithProduct.has(wishlistId);

            if (isInWishList) {
                // Xóa khỏi wishlist
                await removeFromWishList.mutateAsync({
                    wishlistId,
                    spId: productId,
                });

                setWishListsWithProduct(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(wishlistId);
                    return newSet;
                });
                toast.success('Đã xóa sản phẩm khỏi wish list');
            } else {
                // Thêm vào wishlist
                await addToWishList.mutateAsync({
                    wishlistId,
                    sanPhamId: productId,
                });

                setWishListsWithProduct(prev => {
                    const newSet = new Set(prev);
                    newSet.add(wishlistId);
                    return newSet;
                });
                toast.success('Đã thêm sản phẩm vào wish list');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Có lỗi xảy ra khi thêm/xóa sản phẩm');
        } finally {
            setIsLoading(false);
        }
    };



    const handleCreateWishList = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowCreateModal(true);
        setIsOpen(false);
    };

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    if (!user) {
        return null;
    }

    // Kiểm tra sản phẩm có trong bất kỳ wishlist nào không
    const hasProductInAnyWishList = wishListsWithProduct.size > 0;

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={isLoading || isChecking}
                        className={cn(
                            'transition-all duration-200 hover:scale-105 border-gray-200 bg-white',
                            sizeClasses[size],
                            className
                        )}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Heart className={cn("w-4 h-4", hasProductInAnyWishList ? "text-red-500 fill-current" : "text-gray-600")} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-40 bg-white border border-gray-200 shadow-lg p-3"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div className="space-y-1">
                        {isChecking ? (
                            <p className="text-gray-500 text-sm py-2">Đang kiểm tra...</p>
                        ) : wishLists && wishLists.length > 0 ? (
                            <>
                                {wishLists.map((wishList) => (
                                    <WishListMenuItem
                                        key={wishList.id}
                                        wishList={wishList}
                                        productId={productId}
                                        isInWishList={wishListsWithProduct.has(wishList.id)}
                                        onToggle={handleToggleWishList}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm py-2">Chưa có danh sách yêu thích nào</p>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                            onClick={handleCreateWishList}
                            className="w-full bg-orange-600 hover:bg-orange-600 text-white text-sm py-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo yêu thích
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {showCreateModal && createPortal(
                <WishListModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    userId={user.id}
                    onSuccess={(message) => {
                        setSuccessMessage(message);
                        setShowSuccessNotification(true);
                        // Auto close notification after 3 seconds
                        setTimeout(() => {
                            setShowSuccessNotification(false);
                        }, 3000);
                        // Refresh danh sách wishlist sau khi tạo thành công
                        refetchWishLists();
                        // Force re-check sản phẩm trong wishlist
                        setTimeout(() => {
                            setIsChecking(true);
                            setTimeout(() => {
                                setIsChecking(false);
                            }, 1000);
                        }, 500);
                    }}
                />,
                document.body
            )}

            {showSuccessNotification && createPortal(
                <SuccessNotification
                    isVisible={showSuccessNotification}
                    message={successMessage}
                    onClose={() => setShowSuccessNotification(false)}
                />,
                document.body
            )}
        </>
    );
}; 