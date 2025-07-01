export interface PhieuGiamGia {
  id: number;
  maPhieu: string;
  soLuong: number;
  loaiPhieuGiam: "Theo %" | "Theo số tiền";
  giaTriGiam: number;
  giamToiDa: number;
  giaTriToiThieu: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: "Đang hoạt động" | "Hết hạn" | "Ngừng";
}

export type PhieuGiamGiaCreate = Omit<PhieuGiamGia, "id" | "maPhieu">;
