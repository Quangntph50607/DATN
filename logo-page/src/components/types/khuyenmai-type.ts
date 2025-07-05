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
  maSanPham: string;
  doTuoi: number;
  moTa: string | null;
  gia: number;
  soLuongManhGhep: number | null;
  soLuongTon: number;
  soLuongVote: number;
  danhGiaTrungBinh: number;
  danhMucId: number | null;
  boSuuTapId: number | null;
  trangThai: string;
  trangThaiKM: string;
  anhUrls: { url: string; anhChinh: boolean }[];
  giaKhuyenMai: number | null;
  phanTramKhuyenMai: number | null;
}
