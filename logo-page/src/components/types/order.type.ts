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