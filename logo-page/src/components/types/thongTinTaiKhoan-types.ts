export interface ThongTinNguoiNhan {
  id?: number;
  hoTen: string;
  sdt: string;
  duong: string;
  xa: string;
  thanhPho: string;
  isMacDinh: number | boolean;
  idUser: number;
}

export interface DTOThongTinNguoiNhan {
  hoTen: string;
  sdt: string;
  duong: string;
  xa: string;
  thanhPho: string;
  isMacDinh: number; // Đổi từ boolean thành number
  idUser: number;
}
export interface Ward {
  code: string;
  name: string;
  parent_code: string;
}

export interface Province {
  code: string;
  name: string;
  wards: Ward[];
}
