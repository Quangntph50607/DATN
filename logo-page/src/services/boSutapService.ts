import { BoSuuTap } from "@/components/types/product.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/bosuutap";
//All
export const boSuuTapService = {
  async getBoSutap(): Promise<BoSuuTap[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/ReadAll`);
      if (!res.ok) {
        throw new Error("Khong tìm thấy bộ sưu tập ");
      }
      return await res.json();
    } catch (error) {
      console.log("Lối" + error);
      throw error;
    }
  },

  //Ct
  async getBoSuuTapID(id: number): Promise<BoSuuTap> {
    try {
      const res = await fetchWithAuth(`${API_URL}/ReadOne/${id}`);
      if (!res.ok) {
        throw new Error(`Không tìm thấy bộ sưu tập với ID ${id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },

  //Add
  async addBoSuuTap(data: BoSuuTap): Promise<BoSuuTap> {
    try {
      const res = await fetchWithAuth(`${API_URL}/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Không thể thêm bộ sưu tập ");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      throw error;
    }
  },

  //   Sửa
  async editBoSuuTap(id: number, data: BoSuuTap): Promise<BoSuuTap> {
    try {
      const res = await fetchWithAuth(`${API_URL}/Update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Không thể sửa bọ sưu tập");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi sửa bst:", error);
      throw error;
    }
  },

  // Xóa

  async xoaBoSuuTap(id: number): Promise<void> {
    try {
      const res = await fetchWithAuth(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa bộ sưu tập");
      }
    } catch (error) {
      throw error;
    }
  },
};
