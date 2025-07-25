export interface AnhSanPhamChiTiet {
  id: number;
  url: string;
  moTa: string;
  // thuTu: number;
  anhChinh: boolean;
  sanPhamId?: number;
}

export interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  moTa: string;
}

export interface BoSuuTap {
  id: number;
  tenBoSuuTap: string;
  moTa: string;
  namPhatHanh: number;
  ngayTao?: string;
}

export interface XuatXu {
  id: number;
  ten: string;
  moTa?: string;
  sanPhams?: SanPham[];
}

export interface ThuongHieu {
  id: number;
  ten: string;
  moTa?: string;
  sanPhams?: SanPham[];
}

export interface SanPham {
  id: number;
  tenSanPham: string;
  maSanPham?: string;
  doTuoi: number;
  moTa?: string;
  gia: number;
  giaKhuyenMai?: number | null;
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
  noiBat?: boolean | number;
  xuatXuId: number;
  thuongHieuId: number;
}
export interface ProductData {
  tenSanPham: string;
  gia: number;
  soLuongTon: number;
  soLuongManhGhep: number;
  moTa: string;
  doTuoi: number;
  danhMucId: number;
  boSuuTapId: number;
  xuatXuId: number;
  thuongHieuId: number;
  noiBat?: boolean;
  files: FileList;
}

export interface CreateSanPhamResponse {
  sanPham: SanPham;
  anhSps: AnhSanPhamChiTiet[];
}
