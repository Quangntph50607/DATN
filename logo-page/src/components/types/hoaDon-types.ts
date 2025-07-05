import { SanPham } from "./product.type";

export interface CartItemDTO {
  idSanPham: number;
  soLuong: number;
}

export interface CreateHoaDonDTO {
  userId?: number;
  loaiHD: number;
  sdt: string;
  diaChiGiaoHang: string;
  phuongThucThanhToan: keyof typeof PaymentMethods;
  cartItems: CartItemDTO[];
  idPhieuGiam?: number;
  nvId?: number;
}

export interface HoaDonDTO {
  id: number;
  maHD: string;
  loaiHD: number;
  tamTinh: number;
  tongTien: number;
  soTienGiam: number;
  diaChiGiaoHang: string;
  maVanChuyen: string;
  ngayGiao: Date;
  ngayTao: number | Date | string;
  trangThai: keyof typeof TrangThaiHoaDon | string;
  phuongThucThanhToan: keyof typeof PaymentMethods | null;
  userId: number;
  ten: string;
  sdt: string;
  nvName: string;
  pggid?: number;
  maPGG?: string;
}
export enum TrangThaiHoaDon {
  PENDING = "Đang xử lý",
  PROCESSING = "Đã xác nhận",
  PACKING = "Đang đóng gói",
  SHIPPED = "Đang vận chuyển",
  DELIVERED = "Đã giao",
  COMPLETED = "Hoàn tất",
  CANCELLED = "Đã hủy",
  FAILED = "Thất bại",
}

export enum PaymentMethods {
  CASH = "Tiền mặt",
  BANK_TRANSFER = "Chuyển khoản",
  CASH_ON_DELIVERY = "COD",
}

export interface HoaDonDetailDTO {
  id: number;
  hdId: number;
  spId: SanPham;
  soLuong: number;
  gia: number;
  tongTien: number;
}
