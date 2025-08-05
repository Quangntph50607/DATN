import { fetchWithAuth } from './fetchWithAuth';
import { WishList, WishListProduct, CreateWishListRequest, AddToWishListRequest } from '@/components/types/wishlist-type';

const BASE_URL = 'http://localhost:8080/api/lego-store/san-pham-yeu-thich';

export const wishListService = {
    // Lấy danh sách wish list của user
    getWishLists: async (userId: number): Promise<WishList[]> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/get-wishlist`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Lọc chỉ lấy wish list của user hiện tại
            const userWishLists = data.filter((wishList: WishList) => wishList.user.id === userId);
            return userWishLists;
        } catch (error) {
            console.error('getWishLists error:', error);
            throw error;
        }
    },

    // Lấy tất cả wish list (không filter theo user)
    getAllWishLists: async (): Promise<WishList[]> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/get-wishlist`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('getAllWishLists error:', error);
            throw error;
        }
    },

    // Lấy sản phẩm trong wish list
    getWishListProducts: async (wishlistId: number): Promise<WishListProduct[]> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/user/${wishlistId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('getWishListProducts error:', error);
            throw error;
        }
    },

    // Tạo wish list mới
    createWishList: async (data: CreateWishListRequest): Promise<WishList> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/create-wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create wishlist');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('createWishList error:', error);
            throw error;
        }
    },

    // Cập nhật tên wish list
    updateWishList: async (id: number, ten: string): Promise<WishList> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/update-wishlist/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ten }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update wishlist');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('updateWishList error:', error);
            throw error;
        }
    },

    // Xóa wish list
    deleteWishList: async (id: number): Promise<void> => {
        try {
            // Kiểm tra ID
            if (!id || isNaN(id)) {
                throw new Error('Invalid wishlist ID');
            }

            const response = await fetchWithAuth(`${BASE_URL}/delete-wishlist/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to delete wishlist: ${response.status} ${response.statusText}`);
            }

            await response.json();
        } catch (error) {
            console.error('deleteWishList error:', error);
            throw error;
        }
    },

    // Thêm sản phẩm vào wish list
    addToWishList: async (data: AddToWishListRequest): Promise<WishListProduct> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/them-yeu_thich`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add product to wishlist');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('addToWishList error:', error);
            throw error;
        }
    },

    // Xóa sản phẩm khỏi wish list
    removeFromWishList: async (wishlistId: number, spId: number): Promise<void> => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/delete?wish_list_id=${wishlistId}&sp_id=${spId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to remove product from wishlist');
            }

            await response.json();
        } catch (error) {
            console.error('removeFromWishList error:', error);
            throw error;
        }
    },
}; 