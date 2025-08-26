import {
  DoanhThuDanhMucResponse,
  DoanhThuPTThanhToanResponse,
  DoanhThuTheoNgayResponse,
  DoanhThuXuatXuResponse,
  KhuyenMaiHieuQuaResponse,
  LyDoHoanHoang,
  SanPhamHetHangRequest,
  SanPhamHetHangResponse,
  TiLeHoanResponse,
  TopKhachHangResponse,
  TopSanPhamBanChayResponse,
} from "@/components/types/thongke.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/thong-ke";

async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(url, options);
  if (!res.ok) throw new Error(`Lỗi API: ${url}`);
  return res.json();
}

function buildUrl(endpoint: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `${API_URL}/${endpoint}?${query}`;
}

export const thongKeService = {
  getDoanhThuTheoNgay: (startDate: string, endDate: string) =>
    fetchData<DoanhThuTheoNgayResponse>(
      buildUrl("doanh-thu-ngay", { startDate, endDate })
    ),

  getDoanhThuPTThanhToan: (startDate: string, endDate: string) =>
    fetchData<DoanhThuPTThanhToanResponse>(
      buildUrl("doanh-thu-phuong-thuc-tt", { startDate, endDate })
    ),

  getDoanhThuDanhMuc: (startDate: string, endDate: string) =>
    fetchData<DoanhThuDanhMucResponse>(
      buildUrl("doanh-thu-danh-muc", { startDate, endDate })
    ),

  getDoanhThuXuatXu: (startDate: string, endDate: string) =>
    fetchData<DoanhThuXuatXuResponse>(
      buildUrl("doanh-thu-xuat-xu", { startDate, endDate })
    ),

  getKhuyenMaiHieuQua: (startDate: string, endDate: string) =>
    fetchData<KhuyenMaiHieuQuaResponse>(
      buildUrl("khuyen-mai-hieu-qua", { startDate, endDate })
    ),

  getTopSanPhamBanChay: (startDate: string, endDate: string) =>
    fetchData<TopSanPhamBanChayResponse>(
      buildUrl("top-san-pham", { startDate, endDate })
    ),

  getSanPhamSapHetHang: (body: SanPhamHetHangRequest) =>
    fetchData<SanPhamHetHangResponse>(`${API_URL}/san-pham-sap-het-hang`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  getTopKhachHang: (startDate: string, endDate: string) =>
    fetchData<TopKhachHangResponse>(
      buildUrl("top-khach-hang", { startDate, endDate })
    ),

  getTiLeHoan: (startDate: string, endDate: string) =>
    fetchData<TiLeHoanResponse>(buildUrl("ti-le-hoan", { startDate, endDate })),

  getLyDoHoan: (startDate: string, endDate: string) =>
    fetchData<LyDoHoanHoang[]>(buildUrl("ly-do-hoan", { startDate, endDate })),
};
