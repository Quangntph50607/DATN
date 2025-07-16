// src/services/sanPhamService.ts

// import { CreateSanPhamDto } from "@/components/types/createSanPham.dto";
import {
  CreateSanPhamResponse,
  SanPham,
} from "@/components/types/product.type";
import { ProductData } from "@/lib/sanphamschema";

const API_URL = "http://localhost:8080/api";

// All
export const sanPhamService = {
  async getSanPhams(): Promise<SanPham[]> {
    try {
      const res = await fetch(`${API_URL}/sanpham/ReadAll`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  //SPCT
  async getSanPhamID(id: number): Promise<SanPham> {
    try {
      const res = await fetch(`${API_URL}/sanpham/ReadOne/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },

  // Add
  // async addSanPham(data: ProductData): Promise<SanPham> {
  //   const payload = {
  //     ...data,
  //     danhMuc: { id: data.danhMucId },
  //     boSuuTap: { id: data.boSuuTapId },
  //   };
  //   console.log("Payload gửi đi:", data);

  //   const res = await fetch(`${API_URL}/sanpham/Create`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //     body: JSON.stringify(payload),
  //   });

  //   if (!res.ok) {
  //     throw new Error("Không thể thêm sản phẩm");
  //   }

  //   return await res.json();
  // },
  async addSanPham(data: ProductData): Promise<CreateSanPhamResponse> {
    const formData = new FormData();
    formData.append("tenSanPham", data.tenSanPham);
    formData.append("gia", data.gia.toString());
    formData.append("soLuongTon", data.soLuongTon.toString());
    formData.append("soLuongManhGhep", data.soLuongManhGhep.toString());
    formData.append("moTa", data.moTa);
    formData.append("doTuoi", data.doTuoi.toString());
    formData.append("danhMucId", data.danhMucId.toString());
    formData.append("boSuuTapId", data.boSuuTapId.toString());

    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(`${API_URL}/sanpham/CreateWithFileImages`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const resData = await res.json();
      const errorMsg = resData.message || "Không thể thêm sản phẩm";
      throw new Error(errorMsg);
    }

    return await res.json();
  },

  // Sửa
  async editSanPham(id: number, data: ProductData): Promise<SanPham> {
    const payload = {
      ...data,
      danhMuc: { id: data.danhMucId },
      boSuuTap: { id: data.boSuuTapId },
    };
    try {
      const res = await fetch(`${API_URL}/sanpham/Update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể sửa sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi sửa sản phẩm:", error);
      throw error;
    }
  },

  //Xóa
  async xoaSanPham(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/sanpham/Delete/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }
    } catch (error) {
      throw error;
    }
  },

  // async getAnhSanPhams(maSanPham: number): Promise<AnhSanPhamChiTiet[]> {
  //   try {
  //     const res = await fetch(`${API_URL}/anhsp?maSanPham=${maSanPham}`, {
  //       cache: "no-store",
  //     });
  //     if (!res.ok) {
  //       throw new Error(`Không tìm thấy ảnh của sản phẩm với mã ${maSanPham}`);
  //     }
  //     return await res.json();
  //   } catch (error) {
  //     console.error(`Lỗi lấy ảnh sản phẩm với mã ${maSanPham}:`, error);
  //     throw error;
  //   }
  // },
};
