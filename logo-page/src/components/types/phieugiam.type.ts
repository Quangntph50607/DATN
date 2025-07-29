export interface PhieuGiamGia {
  id: number;
  maPhieu?: string;
  tenPhieu: string;
  soLuong: number;
  loaiPhieuGiam: "theo_phan_tram" | "theo_so_tien";
  giaTriGiam: number;
  giamToiDa?: number;
  giaTriToiThieu: number;
  ngayBatDau: string; // ISO hoặc custom string
  ngayKetThuc: string;
  trangThai?: string;
  noiBat?: number | boolean; // dùng khi gọi API
}

// Dành riêng cho form xử lý với DatePicker
export interface PhieuGiamGiaFormValues
  extends Omit<PhieuGiamGia, "ngayBatDau" | "ngayKetThuc" | "noiBat"> {
  ngayBatDau: Date | null;
  ngayKetThuc: Date | null;
  noiBat?: boolean;
}

// Khi tạo
export type PhieuGiamGiaCreate = Omit<
  PhieuGiamGia,
  "id" | "maPhieu" | "trangThai"
>;

// Chi tiết
export interface ChitietPhieuGiamGia {
  id: number;
  maPhieu: string;
  tenPhieu: string;
  giaTriGiam: number;
  trangThai: string;
  soLuongPhieu: number;
  soLuotSuDung: number;
  soNguoiSuDung: number;
  userDungPGG: PhieuGiamGiaTuple[];
  tongTienTruocGiam: number;
  tongTienBanDuoc: number;
  tongTienGiam: number;
}

export interface PhieuGiamGiaTuple extends Array<string | number> {
  0: number; // id user
  1: string; // tên user
  2: string; // email / thông tin thêm
  3: number; // số lần dùng
}
