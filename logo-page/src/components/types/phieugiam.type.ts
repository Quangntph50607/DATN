export interface PhieuGiamGia {
  id: number;
  maPhieu?: string;
  tenPhieu: string;
  soLuong: number;
  loaiPhieuGiam: "Theo %" | "Theo số tiền";
  giaTriGiam: number;
  giamToiDa?: number;
  giaTriToiThieu: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai?: string;
  isNoiBat?: number;
}
export type PhieuGiamGiaCreate = Omit<
  PhieuGiamGia,
  "id" | "maPhieu" | "trangThai"
>;
export interface PhieuGiamGiaTuple extends Array<string | number> {
  0: number;
  1: string;
  2: string;
  3: number;
}
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
