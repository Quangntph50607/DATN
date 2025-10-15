import { XuatXu } from "@/components/types/product.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/xuatXu";

export const xuatXuService = {
    async getAll(): Promise<XuatXu[]> {
        const res = await fetch(`${API_URL}/getAll`, { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể lấy danh sách xuất xứ");
        return await res.json();
    },

    async create(data: { ten: string; moTa?: string }): Promise<XuatXu> {
        const res = await fetchWithAuth(`${API_URL}/createXuatXu`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Không thể tạo xuất xứ");
        return await res.json();
    },

    async update(id: number, data: { ten: string; moTa?: string }): Promise<XuatXu> {
        const res = await fetchWithAuth(`${API_URL}/updateXuatXu/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Không thể cập nhật xuất xứ");
        return await res.json();
    },

    async delete(id: number): Promise<void> {
        const res = await fetchWithAuth(`${API_URL}/deleteXX/${id}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Không thể xóa xuất xứ");
        }
    },
}; 