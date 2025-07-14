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
}
export type PhieuGiamGiaCreate = Omit<
  PhieuGiamGia,
  "id" | "maPhieu" | "trangThai"
>;
