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
    ngayDanhGia?: number[]; // Mảng số [year, month, day, hour, minute, second, nanosecond]
    ngayTao?: string; // Thêm ngayTao nếu API trả về
    textPhanHoi?: string;
    images?: string[]; // tên file ảnh
    video?: string;    // tên file video
    user?: {
        id: number;
        ten: string;
        email: string;
        ngayTao: number[];
    };
}

export interface CreateDanhGiaDTO {
    tieuDe: string;
    textDanhGia: string;
    soSao: number;
    user_id: number;
    sp_id: number;
    hdct_id: number;
}
