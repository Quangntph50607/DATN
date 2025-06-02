// src/types/product.type.ts
export interface AnhSanPham {
    id: number;
    url: string;
    moTa: string;
    thuTu: number;
    anhChinh: boolean;
  }
  
  export interface DanhMuc {
    id: number;
    tenDanhMuc: string;
    moTa: string;
  }
  
  export interface BoSuTap {
    id: number;
    tenBoSuuTap: string;
    moTa: string;
    namPhatHanh: number;
    ngayTao: number;
  }
  
  export interface SanPham {
    id: number;
    tenSanPham: string;
    maSanPham: string;
    doTuoi: number;
    moTa: string;
    gia: number;
    giaKhuyenMai: number | null;
    soLuong: number;
    soLuongManhGhep: number;
    soLuongTon: number;
    anhDaiDien: string | null;
    soLuongVote: number;
    danhGiaTrungBinh: number;
    danhMucId: number;
    boSuuTapId: number;
    khuyenMaiId: number | null;
    trangThai: string;
    anhSanPhams?: AnhSanPham[];
  }