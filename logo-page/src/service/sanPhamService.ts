import { SanPham } from "@/components/types/product.type";

const API_URL = "http://localhost:8080/api";

export const sanPhamService = {
  async getSanPhams(): Promise<SanPham[]> {
    try {
      const res = await fetch(`${API_URL}/sanpham`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách sản phẩm");
      }
      return res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  async getSanPhamID(id: number): Promise<SanPham> {
    try {
      const res = await fetch(`${API_URL}/sanpham/${id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${id}`);
      }
      return res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },
};
