import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishListService } from '@/services/wishListService';

export const useWishList = () => {
    const queryClient = useQueryClient();

    // Lấy danh sách wish list của user
    const useGetWishLists = (userId: number) => {
        return useQuery({
            queryKey: ['wishlists', userId],
            queryFn: () => wishListService.getWishLists(userId),
            enabled: !!userId,
        });
    };

    // Lấy tất cả wish list (không filter theo user)
    const useGetAllWishLists = () => {
        return useQuery({
            queryKey: ['all-wishlists'],
            queryFn: () => wishListService.getAllWishLists(),
        });
    };

    // Lấy sản phẩm trong wish list
    const useGetWishListProducts = (wishlistId: number) => {
        return useQuery({
            queryKey: ['wishlist-products', wishlistId],
            queryFn: () => wishListService.getWishListProducts(wishlistId),
            enabled: !!wishlistId,
        });
    };

    // Tạo wish list mới
    const useCreateWishList = () => {
        return useMutation({
            mutationFn: wishListService.createWishList,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            },
        });
    };

    // Cập nhật tên wish list
    const useUpdateWishList = () => {
        return useMutation({
            mutationFn: ({ id, ten }: { id: number; ten: string }) =>
                wishListService.updateWishList(id, ten),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            },
        });
    };

    // Xóa wish list
    const useDeleteWishList = () => {
        return useMutation({
            mutationFn: wishListService.deleteWishList,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wishlists'] });
                queryClient.invalidateQueries({ queryKey: ['all-wishlists'] });
                queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
            },
        });
    };

    // Thêm sản phẩm vào wish list
    const useAddToWishList = () => {
        return useMutation({
            mutationFn: wishListService.addToWishList,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
            },
        });
    };

    // Xóa sản phẩm khỏi wish list
    const useRemoveFromWishList = () => {
        return useMutation({
            mutationFn: ({ wishlistId, spId }: { wishlistId: number; spId: number }) =>
                wishListService.removeFromWishList(wishlistId, spId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
            },
        });
    };

    return {
        useGetWishLists,
        useGetAllWishLists,
        useGetWishListProducts,
        useCreateWishList,
        useUpdateWishList,
        useDeleteWishList,
        useAddToWishList,
        useRemoveFromWishList,
    };
}; 