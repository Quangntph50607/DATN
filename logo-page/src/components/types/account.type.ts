export interface Role {
  id: number;
  name: string;
}

export interface DTOUser {
  id?: number;
  ten: string;
  email: string;
  matKhau: string;
  sdt: string;
  diaChi: string;
  ngaySinh?: string | Date;
  trangThai: number;
  role_id: number;
  diemTichLuy?: number;
  ngayTao?: number[];
  role?: Role;
}

export type DTOUserWithId = DTOUser & {
  id: number;
};

// Interface dành riêng cho cập nhật (không có mật khẩu)
export interface DTOUserUpdate {
  id?: number;
  ten: string;
  email: string;
  sdt: string;
  diaChi: string;
  ngaySinh?: string | Date;
  trangThai: number;
  role_id: number;
  diemTichLuy?: number;
}
