import { SanPham } from "./product.type";

//  Doanh thu
export type DoanhThuTheoNgayResponse = number;
export type DoanhThuPTThanhToanResponse = Record<string, number>;
export type DoanhThuDanhMucResponse = Record<string, number>;
export type DoanhThuXuatXuResponse = Record<string, number>;
export type TiLeHoanResponse = number;

//  Khuyến mãi hiệu quả
export interface KhuyenMaiHieuQua {
  idKhuyenMai: number;
  tenKhuyenMai: string;
  soDonApDung: number;
  tongDoanhThuGoc: number;
  tongDoanhThuSauGiam: number;
  tongTienGiam: number;
}
export type KhuyenMaiHieuQuaResponse = KhuyenMaiHieuQua[];

//  Sản phẩm
export interface TopSanPham {
  id: number;
  tenSanPham: string;
  soLuongBan: number;
  doanhThu: number;
}
export type TopSanPhamBanChayResponse = TopSanPham[];

export interface SanPhamHetHangRequest {
  soLuongCanhBao: number;
}
export type SanPhamHetHangResponse = SanPham[];

//  Top khách hàng
export interface TopKhachHang {
  id: number;
  ten: string;
  soDon: number;
  tongTien: number;
}
export type TopKhachHangResponse = TopKhachHang[];

//  Đơn hoàn
export type LyDoHoanHoang = {
  lyDo: string;
  soLan: number;
  tongTien: number;
};

//  Dashboard stats
export interface TongNguoiDung {
  user_tong: number;
  ti_le_tang_User: number;
  don_Hang_hom_nay: number;
  ti_le_tang_DonHang: number;
  doanhThuThang: number;
  ti_Le_tang_DoanhThu: number;
}

//  Sự kiện người dùng
export interface HoatDongGanDay {
  type: "Hủy đơn hàng" | "Đơn hàng mới" | "Người dùng mới đăng ký";
  userName: string;
  time: string; // ISO string
}

//  Doanh thu theo ngày
export interface BayNgayGanDay {
  date: string; // ISO string: 'YYYY-MM-DD'
  total: number;
}
