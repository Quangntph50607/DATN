import { HoaDonDTO } from "./hoaDon-types";
import { SanPham } from "./product.type";

export enum TrangThaiPhieuHoan {
    CHO_DUYET = "CHO_DUYET",
    DA_DUYET = "DA_DUYET",
    TU_CHOI = "TU_CHOI",
    DA_KIEM_TRA_HANG = "DA_KIEM_TRA_HANG",
}

export enum TrangThaiThanhToan {
    DANG_HOAN = "DANG_HOAN",
    CHUA_HOAN = "CHUA_HOAN",
    DA_HOAN = "DA_HOAN",
}




// ===== INTERFACE CHI TIẾT HOÀN HÀNG =====
export interface ChiTietHoanHang {
    id: number;
    sanPham: SanPham;
    soLuongHoan: number;
    giaHoan: number;
    tongGiaHoan: number;
}

// ===== INTERFACE PHIẾU HOÀN HÀNG =====
export interface PhieuHoanHang {
    id: number;
    ngayHoan: string;
    loaiHoan: string;
    lyDo: string;
    phuongThucHoan: string;
    tenNganHang?: string;
    soTaiKhoan?: string;
    chuTaiKhoan?: string;
    tongTienHoan: number;
    trangThai: TrangThaiPhieuHoan;
    trangThaiThanhToan: TrangThaiThanhToan;
    ngayDuyet?: string;
    ngayHoanTien?: string;
    hoaDon?: HoaDonDTO;
    chiTietHoanHangs?: ChiTietHoanHang[];
    // Media minh chứng (nếu backend trả về)
    anhMinhChung?: string[];
    videoMinhChung?: string;
    // Một số BE trả về danh sách ảnh dạng object { id, url, anhChinh }
    anhs?: { id: number; url: string; anhChinh?: boolean | null }[];
}

// ===== DTO GỬI LÊN BACKEND =====
export interface PhieuHoanHangDTO {
    idHoaDon: number;
    loaiHoan: string;
    lyDo: string;
    phuongThucHoan: string;
    tenNganHang?: string;
    soTaiKhoan?: string;
    chuTaiKhoan?: string;
    chiTietHoanHangs: ChiTietHoanHangDTO[];
}

export interface ChiTietHoanHangDTO {
    idSanPham: number;
    soLuongHoan: number;
}

// DTO gửi lên backend khi tạo phiếu hoàn hàng có file
export interface TaoPhieuHoanHangWithFileParams {
    dto: PhieuHoanHangDTO;
    fileAnh: File[];
    fileVid?: File;
}

