import { AnhSanPhamChiTiet, BEAnhResponse } from "@/components/types/product.type";
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
      const responseData = await res.json();
      // Transform BE response to match our interface
      return responseData.map((item: BEAnhResponse) => ({
        id: item.id || 0,
        url: item.url,
        moTa: item.moTa || "",
        anhChinh: item.anhChinh || false,
        sanPhamId: item.sanpham || item.sanPhamId,
      }));
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
      const responseData = await res.json();
      return {
        id: responseData.id || 0,
        url: responseData.url,
        moTa: responseData.moTa || "",
        anhChinh: responseData.anhChinh || false,
        sanPhamId: responseData.sanpham || responseData.sanPhamId,
      };
    } catch (error) {
      console.error(`Lỗi ID ${id}`, error);
      throw error;
    }
  },

  // Add Ảnh sản phẩm
  async addAnhSanPham(data: {
    files: File[];
    anhChinh: boolean;
    sanPhamId: number;
    moTa?: string;
  }): Promise<AnhSanPhamChiTiet[]> {
    try {
      console.log("addAnhSanPham - Input data:", {
        filesCount: data.files.length,
        anhChinh: data.anhChinh,
        sanPhamId: data.sanPhamId,
        moTa: data.moTa
      });

      const formData = new FormData();
      data.files.forEach((file, index) => {
        formData.append("files", file);
        console.log(`File ${index}:`, { name: file.name, size: file.size, type: file.type });
      });
      formData.append("anhChinh", data.anhChinh.toString());
      formData.append("sanPhamId", data.sanPhamId.toString());
      if (data.moTa) {
        formData.append("moTa", data.moTa);
      }

      console.log("addAnhSanPham - Sending request to:", `${API_URL}/upload-images`);
      const res = await fetchWithAuth(`${API_URL}/upload-images`, {
        method: "POST",
        body: formData,
      });

      console.log("addAnhSanPham - Response status:", res.status);
      console.log("addAnhSanPham - Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        await handleErrorResponse(res, "Không thể thêm ảnh");
      }

      const responseData = await res.json();
      console.log("addAnhSanPham - Response data:", responseData);
      
      // Transform BE response to match our interface
      const transformedData = responseData.map((item: BEAnhResponse) => ({
        id: item.id || 0,
        url: item.url,
        moTa: item.moTa || "",
        anhChinh: item.anhChinh || false,
        sanPhamId: item.sanpham || item.sanPhamId,
      }));
      
      console.log("addAnhSanPham - Transformed data:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("Lỗi thêm ảnh: ", error);
      throw error;
    }
  },

  //   Sửa ảnh - Updated to match BE API
  async editAnhSanPham(
    id: number,
    data: {
      file?: File;
      anhChinh: boolean;
      sanPhamId: number;
      moTa?: string;
    }
  ): Promise<AnhSanPhamChiTiet> {
    const formData = new FormData();
    if (data.file) formData.append("file", data.file);
    formData.append("moTa", data.moTa || "");
    formData.append("thuTu", "1"); // BE requires this field
    formData.append("anhChinh", data.anhChinh.toString());
    formData.append("sanpham", data.sanPhamId.toString());

    const res = await fetchWithAuth(`${API_URL}/update-image/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      await handleErrorResponse(res, "Không thể sửa ảnh");
    }

    const responseData = await res.json();
    return {
      id: responseData.id || id,
      url: responseData.url,
      moTa: responseData.moTa || "",
      anhChinh: responseData.anhChinh || false,
      sanPhamId: responseData.sanpham || data.sanPhamId,
    };
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

    const responseData = await res.json();
    // Transform BE response to match our interface
    return responseData.map((item: BEAnhResponse) => ({
      id: item.id || 0,
      url: item.url,
      moTa: item.moTa || "",
      anhChinh: item.anhChinh || false,
      sanPhamId: item.sanpham || item.sanPhamId,
    }));
  },
};

// Function to get image blob from Cloudinary URL
export async function getAnhByFileName(fileName: string): Promise<Blob> {
  try {
    // If it's already a full URL (Cloudinary), fetch directly
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`Không tìm thấy ảnh: ${fileName}`);
      }
      return await response.blob();
    }
    
    // If it's a local file name (legacy), try the old API endpoint
    const response = await fetchWithAuth(`${API_URL}/images/${fileName}`);
    if (!response.ok) {
      throw new Error(`Không tìm thấy ảnh: ${fileName}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Lỗi khi lấy ảnh theo tên:", error);
    throw error;
  }
}
