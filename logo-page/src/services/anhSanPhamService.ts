import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/anhsp";

// Helper function để xử lý lỗi response
async function handleErrorResponse(res: Response, defaultMessage: string): Promise<never> {
  let errorMessage = defaultMessage;

  // Clone response để có thể đọc body nhiều lần
  const clonedRes = res.clone();

  try {
    const errorData = await clonedRes.json();
    errorMessage = errorData.message || errorData || errorMessage;
  } catch {
    try {
      // Nếu không parse được JSON, lấy text
      const errorText = await clonedRes.text();
      errorMessage = errorText || errorMessage;
    } catch {
      // Nếu cả hai đều fail, dùng default message
      errorMessage = defaultMessage;
    }
  }
  throw new Error(`HTTP ${res.status}: ${errorMessage}`);
}
export const anhSanPhamSevice = {
  async getAnhSanPham(): Promise<AnhSanPhamChiTiet[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/ReadAll`);
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách ảnh sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi: ", error);
      throw error;
    }
  },
  //  Ảnh chi tiết
  async getAnhSanPhamID(id: number): Promise<AnhSanPhamChiTiet> {
    try {
      const res = await fetchWithAuth(`${API_URL}/Readone/${id}`);
      if (!res.ok) {
        throw new Error(`Không tìm thấy ảnh sản phẩm với ${id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}`, error);
      throw error;
    }
  },

  // Add Ảnh sản phẩm
  async addAnhSanPham(data: {
    files: File[];
    // thuTu: number;
    anhChinh: boolean;
    sanPhamId: number;
    moTa?: string;
  }): Promise<AnhSanPhamChiTiet[]> {
    try {
      const formData = new FormData();
      data.files.forEach((file) => formData.append("files", file)); // Sửa thành files
      // formData.append("thuTu", data.thuTu.toString());
      formData.append("anhChinh", data.anhChinh.toString());
      formData.append("sanPhamId", data.sanPhamId.toString());
      if (data.moTa) {
        formData.append("moTa", data.moTa);
      }
      const res = await fetchWithAuth(`${API_URL}/upload-images`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        console.log("Response status:", res.status);
        console.log("Response headers:", Object.fromEntries(res.headers.entries()));
        await handleErrorResponse(res, "Không thể thêm ảnh");
      }

      // Chỉ đọc response body một lần khi thành công
      try {
        return await res.json();
      } catch (error) {
        console.error("Lỗi parse response:", error);
        throw new Error("Không thể parse response từ server");
      }
    } catch (error) {
      console.error("Lỗi thêm ảnh: ", error);
      throw error;
    }
  },
  //   Sửa ảnh
  async editAnhSanPham(
    id: number,
    data: {
      file?: File;
      // thuTu: number;
      anhChinh: boolean;
      sanPhamId: number;
    }
  ): Promise<AnhSanPhamChiTiet> {
    const formData = new FormData();
    if (data.file) formData.append("file", data.file);
    // formData.append("thuTu", data.thuTu.toString());
    formData.append("anhChinh", data.anhChinh.toString());
    formData.append("sanpham", data.sanPhamId.toString());

    const res = await fetchWithAuth(`${API_URL}/update-image/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      await handleErrorResponse(res, "Không thể sửa ảnh");
    }

    try {
      return await res.json();
    } catch (error) {
      console.error("Lỗi parse response:", error);
      throw new Error("Không thể parse response từ server");
    }
  },

  //   Xóa
  async deleteAnhSanPham(id: number): Promise<void> {
    try {
      const res = await fetchWithAuth(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa");
      }
      return;
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      throw error;
    }
  },

  // Lấy danh sách ảnh theo sản phẩm
  async getAnhSanPhamTheoSanPhamId(id: number): Promise<AnhSanPhamChiTiet[]> {
    const res = await fetchWithAuth(`${API_URL}/sanpham/${id}`);

    if (!res.ok) {
      await handleErrorResponse(res, "Không thể tải ảnh theo sản phẩm");
    }

    try {
      return await res.json();
    } catch (error) {
      console.error("Lỗi parse response:", error);
      throw new Error("Không thể parse response từ server");
    }
  },
};

export async function getAnhByFileName(fileName: string): Promise<Blob> {
  try {
    const response = await fetchWithAuth(`${API_URL}/images/${fileName}`);

    if (!response.ok) {
      throw new Error(`Không tìm thấy ảnh: ${fileName}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Lỗi khi lấy ảnh theo tên:", error);
    throw error;
  }
}
