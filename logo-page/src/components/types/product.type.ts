
export interface AnhSanPham {
    id: number;
    url: string ;
    mo_ta: string;
    thu_tu: number;
    anh_chinh:boolean;
}
export interface DanhMuc{
    id:number;
    ten_danh_muc:string;
    mo_ta:string
}

export interface BoSuTap{
    id: number;
    ten_bo_suu_tap: string;
    mo_ta: string;
    nam_phat_hanh: number;
    ngay_tao: number;

}
export interface SanPham{

   
        id: number;
        ten_san_pham: string;
        ma_san_pham: string;
        do_tuoi: number;
        mo_ta: string;
        gia: number;
        gia_khuyen_mai: number;
        so_luong: number;
        so_luong_manh_ghep: number;
        so_luong_ton: number;
        anh_dai_dien: string | null;
        so_luong_vote: number;
        danh_gia_trung_binh: number;
        ngay_tao: number;
        ngay_sua: number;
        danhMuc: DanhMuc;
        boSuuTap: BoSuTap;
        anhSps: AnhSanPham[];
}