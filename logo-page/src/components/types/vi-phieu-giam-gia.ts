// ===== ENUM =====
export type LoaiPhieuGiam = "theo_so_tien" | "theo_phan_tram";

export type TrangThaiThucTe = "active" | "inactive" | "expired";

export interface ViGiamGiaDTO {
  userId: number;
  phieuGiamGiaId: number;
}

export interface PGGUserDTO {
  phieuGiamGiaId: number;
  listUserId: number[];
}

export interface PhieuGiamGiaResponse {
  id: number;
  maPhieu: string;
  tenPhieu: string;
  soLuong: number;
  loaiPhieuGiam: LoaiPhieuGiam;
  giaTriGiam: number;
  giamToiDa: number;
  giaTriToiThieu: number;
  ngayBatDau: string;
  ngayKetThuc: number[];
  ngayNhan: string;
  trangThaiThucTe: TrangThaiThucTe;
}
