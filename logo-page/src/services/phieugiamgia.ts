import { fetchWithAuth } from "./fetchWithAuth";
import {
  PhieuGiamGia,
  PhieuGiamGiaCreate,
} from "@/components/types/phieugiam.type";

const API_URL = "http://localhost:8080/api/phieugiamgia";

export const phieuGiamGiaService = {
  async getPhieuGiamGia(): Promise<PhieuGiamGia[]> {
    const res = await fetchWithAuth(`${API_URL}/ReadAll`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tìm thấy phiếu giảm giá");
    return res.json();
  },

  async addPhieuGiamGia(data: PhieuGiamGiaCreate): Promise<PhieuGiamGia> {
    const res = await fetchWithAuth(`${API_URL}/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Không thể thêm phiếu giảm giá: ${errorText}`);
    }
    return res.json();
  },
  async suaPhieuGiamGia(id: number, data: PhieuGiamGia): Promise<PhieuGiamGia> {
    const res = await fetchWithAuth(`${API_URL}/Update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể sửa phiếu giảm giá");
    return res.json();
  },

  async xoaPhieuGiamGia(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/Delete/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể xóa phiếu giảm giá");
  },
};
