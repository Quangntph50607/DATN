import { AnhSanPhamChiTiet } from "./product.type";

export interface KhuyenMaiDTO {
  id: number;
  maKhuyenMai?: string;
  tenKhuyenMai: string;
  phanTramKhuyenMai: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayTao?: string;
  trangThai: string;
}

export interface KhuyenMaiSanPhamDTO {
  khuyenMaiId: number;
  listSanPhamId: number[];
}

export interface KhuyenMaiTheoSanPham {
  id: number;
  tenSanPham: string;
  maSanPham?: string;
  doTuoi: number;
  moTa?: string;
  gia: number;
  soLuongManhGhep?: number;
  soLuongTon: number;
  soLuongVote?: number;
  danhGiaTrungBinh?: number;
  ngayTao?: number | string;
  ngaySua?: number | string;
  khuyenMaiId?: number | null;
  trangThai: string;
  danhMucId: number;
  boSuuTapId: number;
  anhSps?: AnhSanPhamChiTiet[];
  anhUrls?: AnhSanPhamChiTiet[];
  giaKhuyenMai: number | null;
  phanTramKhuyenMai: number | null;
  noiBat?: number | boolean;
  xuatXuId?: number;
  thuongHieuId?: number;
}
export interface SanPhamApDungTuple extends Array<string | number> {
  0: string; // maSanPham
  1: string; // tenSanPham
  2: string; // trangThai
  3: number; // giaGoc
  4: number; // giaSauGiam
}

export interface ChiTietKhuyenMai {
  id: number;
  tenKhuyenMai: string;
  phanTramKhuyenMai: number;

  // Ngày theo dạng [năm, tháng, ngày, giờ, phút, giây?]
  ngayBatDau: number[];
  ngayKetThuc: number[];

  soSanPhamApDung: number;
  tongSoLuongBan: number;
  tongTienTruocGiam: number;
  tongSoTienGiam: number;
  tongTienSauGiam: number;
  soHoaDon: number;

  sanPhamDaApDung: SanPhamApDungTuple[];
}
