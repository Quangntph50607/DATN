// Wish List Types
export interface WishList {
    id: number;
    ten: string;
    user: {
        id: number;
    };
}

export interface WishListProduct {
    id: number;
    wishListId: number;
    spId: number;
    maSP: string;
    tenSP: string;
    gia: number;
    giaKM: number;
    doTuoi: number;
    soLuongTon: number;
    danhMucId: number;
    tenDanhMuc: string;
    boSuuTapId: number;
    tenBoSuuTap: string;
    xuatXuId: number;
    tenXuatXu: string;
    thuongHieuId: number;
    tenThuongHieu: string;
    anhSps: Array<{
        id: number;
        url: string;
    }>;
    trangThai: string;
}

export interface CreateWishListRequest {
    ten: string;
    userId: number;
}

export interface AddToWishListRequest {
    wishlistId: number;
    sanPhamId: number;
}

// San Pham Yeu Thich Types (cũ)
export interface SPYeuThichDTO {
    wishlistId: number;
    sanPhamId: number;
}

export interface SpYeuThichResponse {
    id: number;
    wishListId: number;
    spId: number;
    maSP: string;
    tenSP: string;
    gia: number;
    giaKM: number;
    doTuoi: number;
    soLuongTon: number;
    danhMucId: number;
    tenDanhMuc: string;
    boSuuTapId: number;
    tenBoSuuTap: string;
    xuatXuId: number;
    tenXuatXu: string;
    thuongHieuId: number;
    tenThuongHieu: string;
    anhSps: Array<{
        id: number;
        url: string;
    }>;
    trangThai: string;
} 