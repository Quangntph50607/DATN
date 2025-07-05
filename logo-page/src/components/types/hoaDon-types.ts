import { DTOUser, DTOUserWithId } from "./account.type";
import { PhieuGiamGia } from "./phieugiam.type";
import { SanPham } from "./product.type";

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
}

export interface HoaDonChiTietDTO {
  id: number;
  hdId: number;
  spId: SanPham;
  soLuong: number;
  gia: number;
  tongTien: number;
}
