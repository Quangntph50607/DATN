import { KhuyenMai } from "@/components/types/khuyenmai-type";


const API_URL = "http://localhost:8080/api/khuyenmai";

export const KhuyenMaiService = {
  async getKhuyenMai(): Promise<KhuyenMai[]> {
    try {
      const res = await fetch(`${API_URL}/ReadAll`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách khuyến mãi");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  async getKhuyenMaiID(id: number): Promise<KhuyenMai> {
    try {
      const res = await fetch(`${API_URL}/ReadOne/${id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Không tìm thấy khuyến mãi với ID ${id}`);
      }
      return await res.json();
    } catch (error) {   
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },

  async addKhuyenMai(data: KhuyenMai): Promise<KhuyenMai> {
    try {
      const res = await fetch(`${API_URL}/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể thêm khuyến mãi");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm khuyến mãi:", error);
      throw error;
    }
  },

  async updateKhuyenMai(id: number, data: KhuyenMai): Promise<KhuyenMai> {
    try {
      const res = await fetch(`${API_URL}/Update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể cập nhật khuyến mãi");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi cập nhật khuyến mãi:", error);
      throw error;
    }
  },

  async xoaKhuyenMai(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa khuyến mãi");
      }
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      throw error;
    }
  },
};



