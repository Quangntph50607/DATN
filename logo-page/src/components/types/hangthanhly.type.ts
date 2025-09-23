export interface HangThanhLySanPhamDTO {
  id: number;
  maSanPham?: string | null;
  tenSanPham: string;
  gia: number;
}

export interface HangThanhLyItem {
  sanPhamResponseDTO: HangThanhLySanPhamDTO;
  soLuong: number;
  // Backend may return ISO string or array-like [year, month, day, hour, minute, second, nano]
  ngayNhap?: string | number[] | number | Date;
  ghiChu?: string | null;
}


