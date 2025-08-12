import { fetchWithAuth } from "./fetchWithAuth";
import {
  DTOThongTinNguoiNhan,
  ThongTinNguoiNhan,
} from "@/components/types/thongTinTaiKhoan-types";

const API_URL = "http://localhost:8080/api/lego-store/thong-tin-nguoi-nhan";

export const thongTinNguoiNhanService = {
  async getByUserId(userId: number): Promise<ThongTinNguoiNhan[]> {
    const res = await fetchWithAuth(`${API_URL}/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể lấy địa chỉ: ${text}`);
    }

    return res.json();
  },

  async create(data: DTOThongTinNguoiNhan): Promise<ThongTinNguoiNhan> {
    const res = await fetchWithAuth(`${API_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể tạo địa chỉ: ${text}`);
    }

    return res.json();
  },

  async update(
    id: number,
    data: DTOThongTinNguoiNhan
  ): Promise<ThongTinNguoiNhan> {
    const res = await fetchWithAuth(`${API_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể cập nhật địa chỉ: ${text}`);
    }

    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/delete/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể xóa địa chỉ: ${text}`);
    }
  },
};
