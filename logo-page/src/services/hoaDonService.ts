import { HoaDonChiTietDTO, HoaDonDTO } from "@/components/types/hoaDon-types";

const API_URL = "http://localhost:8080/api/lego-store/hoa-don";

export const HoaDonService = {
  async getAllHoaDons(): Promise<HoaDonDTO[]> {
    const res = await fetch(`${API_URL}/get-all-hoa-don`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải danh sách hóa đơn");
    return res.json();
  },

  async getPagedHoaDons(
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: HoaDonDTO[];
    totalPages: number;
    totalElements: number;
    number: number;
  }> {
    const res = await fetch(`${API_URL}/paging?page=${page}&size=${size}`, {
      cache: "no-store",
    });
    if (!res.ok)
      throw new Error("Không thể tải danh sách hóa đơn có phân trang");
    return res.json();
  },

  async getHoaDonById(id: number): Promise<HoaDonDTO> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Không thể lấy chi tiết hóa đơn");
    return res.json();
  },

  async updateTrangThai(id: number, trangThai: string): Promise<HoaDonDTO> {
    const res = await fetch(
      `${API_URL}/${id}/trang-thai?trangThai=${encodeURIComponent(trangThai)}`,
      {
        method: "PUT",
      }
    );
    if (!res.ok) throw new Error("Không thể cập nhật trạng thái");
    return res.json();
  },

  async getStatusCounts(): Promise<Record<string, number>> {
    const res = await fetch(`${API_URL}/status-count`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thống kê trạng thái");
    return res.json();
  },

  async getChiTietSanPhamByHoaDonId(id: number): Promise<HoaDonChiTietDTO[]> {
    const res = await fetch(
      `http://localhost:8080/api/lego-store/hoa-don-chi-tiet/hoaDon/${id}`
    );
    if (!res.ok) throw new Error("Không thể lấy chi tiết sản phẩm hóa đơn");
    return res.json();
  },
};
