const API_URL = "http://localhost:8080/api/giohang";

export const cartService = {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (sanPhamId: number, soLuong: number) => {
        const res = await fetch(`${API_URL}/Create?sanPhamId=${sanPhamId}&soLuong=${soLuong}`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Cập nhật số lượng sản phẩm trong giỏ
    updateCartItem: async (itemId: number, soLuong: number) => {
        const res = await fetch(`${API_URL}/update/${itemId}?soLuong=${soLuong}`, {
            method: "PUT",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Xóa sản phẩm khỏi giỏ
    removeCartItem: async (itemId: number) => {
        const res = await fetch(`${API_URL}/remove/${itemId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Lấy giỏ hàng của user
    getCart: async (userId: number) => {
        const res = await fetch(`${API_URL}/${userId}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Áp dụng phiếu giảm giá
    applyDiscount: async (phieuGiamGiaId: number) => {
        const res = await fetch(`${API_URL}/apply-discount?phieuGiamGiaId=${phieuGiamGiaId}`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
}; 