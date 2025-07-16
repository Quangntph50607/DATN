import { PhieuGiamGia } from './phieugiam.type';
import { SanPham } from './product.type';

export interface CartItem extends SanPham {
    quantity: number;
    anhDaiDien?: string;
}

export interface PendingOrder {
    id: string;
    items: CartItem[];
    totalAmount: number;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    discount: number;
    discountAmount: number;
    timestamp: Date;
}

export interface gioHang {
    id: number;
    sotiengiam: number;
    tongtien: number;
    trangthai: string;
    userId: number;
    phieuGiamId: number | null;
}

export interface gioHangChiTiet {
    id: number;
    soLuong: number;
    sanPhamId: number;
    gioHangId: number;
    tongTien: number;
    gia: number;
}

// Interface cho response từ API giỏ hàng
export interface CartResponse {
    gioHang: gioHang;
    gioHangChiTiets: gioHangChiTiet[];
}

// Interface kết hợp thông tin sản phẩm với giỏ hàng
export interface CartItemWithProduct extends gioHangChiTiet {
    sanPham?: SanPham;
}



