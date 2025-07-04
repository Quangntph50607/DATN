export interface AnhSanPhamChiTiet {
  id: number;
  url: string;
  moTa: string;
  thuTu: number;
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

export interface SanPham {
  id: number;
  tenSanPham: string;
  maSanPham?: string;
  doTuoi?: number;
  moTa?: string;
  gia: number;
  giaKhuyenMai?: number | null;
  soLuong?: number; //
  soLuongManhGhep?: number;
  soLuongTon: number;
  anhDaiDien?: string | null;
  soLuongVote?: number;
  danhGiaTrungBinh?: number;
  ngayTao?: number | string;
  ngaySua?: number | string;
  khuyenMaiId?: number | null;
  trangThai: string;
<<<<<<< HEAD
  idDanhMuc: number;
  idBoSuuTap: number;
=======
  danhMucId: number;
  boSuuTapId: number;
>>>>>>> 959bb71c003f55a9ebd637224587965b6aa7977f
  anhSps?: AnhSanPhamChiTiet[];
}
