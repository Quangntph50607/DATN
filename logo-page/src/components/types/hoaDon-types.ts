import { DTOUser, DTOUserWithId } from "./account.type";
import { PhieuGiamGia } from "./phieugiam.type";
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
  maVanChuyen: string;
  qrCodeUrl?: string;
}

// Interface cũ - có thể xóa sau khi kiểm tra không còn sử dụng
export interface HoaDonDTOOld {
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
  qrCodeUrl?: string;
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

export interface HoaDonDTO {
  id: number;
  maHD: string;
  loaiHD: number;
  tamTinh: number;
  tongTien: number;
  soTienGiam: number;
  diaChiGiaoHang: string;
  maVanChuyen: string;
  ngayGiao: string | null;
  ngayTao: string;
  trangThai: TrangThaiHoaDon | string;
  phuongThucThanhToan: keyof typeof PaymentMethods | null;
  sdt: string;
  user: DTOUser;
  ten: string;
  nvId?: DTOUserWithId;
  nvName?: string;
  phieuGiamGia?: PhieuGiamGia;
  qrCodeUrl?: string;
}

export interface HoaDonChiTietDTO {
  id: number;
  hdId: number;
  spId: SanPham;
  soLuong: number;
  gia: number;
  tongTien: number;
}
