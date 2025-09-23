import { ThuongHieu } from "@/components/types/product.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/thuong-hieu";

export const thuongHieuService = {
    async getAll(): Promise<ThuongHieu[]> {
        const res = await fetchWithAuth(`${API_URL}/getAll`);
        if (!res.ok) throw new Error("Không thể lấy danh sách thương hiệu");
        return await res.json();
    },

    async create(data: { ten: string; moTa?: string }): Promise<ThuongHieu> {
        const res = await fetchWithAuth(`${API_URL}/createTH`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Không thể tạo thương hiệu");
        return await res.json();
    },

    async update(id: number, data: { ten: string; moTa?: string }): Promise<ThuongHieu> {
        const res = await fetchWithAuth(`${API_URL}/updateTH/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Không thể cập nhật thương hiệu");
        return await res.json();
    },

    async delete(id: number): Promise<void> {
        const res = await fetchWithAuth(`${API_URL}/deleteTH/${id}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Không thể xóa thương hiệu");
        }
    },
}; 