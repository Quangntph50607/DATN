export interface DanhGiaResponse {
    id: number;
    tieuDe: string;
    textDanhGia: string;
    textPhanHoi?: string;
    soSao: number;
    ngayDanhGia: string | number[]; // LocalDateTime from Java - can be string or array
    ngayPhanHoi?: string | number[]; // LocalDateTime from Java - can be string or array
    userId?: number;
    nvId?: number;
    dhctId?: number;
    spId?: number;
    anhUrls?: AnhResponse[];
    video?: AnhResponse;
    // Thêm các field từ file cũ
    tenNguoiDung?: string;
    user?: {
        id: number;
        ten: string;
        email: string;
        ngayTao: number[];
    };
}

export interface AnhResponse {
    id: number;
    url: string;
}

export interface CreateDanhGiaDTO {
    user_id: number;
    sp_id: number;
    tieuDe: string;
    textDanhGia: string;
    soSao: number;
}

export interface UpdateDanhGiaDTO {
    phanHoi: string;
}

export interface ErrorResponse {
    status: number;
    message: string;
}

export interface UploadResponse {
    success: boolean;
    message?: string;
    urls?: string[];
}

// For backward compatibility
export type DanhGia = DanhGiaResponse;
