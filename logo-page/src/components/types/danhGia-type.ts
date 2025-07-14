export interface DanhGia {
    id: number;
    tieuDe: string;
    textDanhGia: string;
    soSao: number;
    user_id: number;
    sp_id: number;
    hdct_id: number;
    tenNguoiDung: string;
    createdAt: string;
    textPhanHoi?: string;
    images?: string[]; // tên file ảnh
    video?: string;    // tên file video
}
