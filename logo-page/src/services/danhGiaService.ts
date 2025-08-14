import { DanhGiaResponse, CreateDanhGiaDTO } from "@/components/types/danhGia-type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/lego-store/danh-gia";

export const danhGiaService = {
  async getBySanPham(spId: number): Promise<DanhGiaResponse[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/${spId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
      return [];
    }
  },

  async getAllReviews(): Promise<DanhGiaResponse[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/getAll`);

      if (!res.ok) {
        throw new Error(`Failed to fetch all reviews: ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error fetching all reviews:", error);
      return [];
    }
  },

  async createWithImages(data: CreateDanhGiaDTO, images: File[], video?: File): Promise<DanhGiaResponse> {
    try {
      const formData = new FormData();
      formData.append('tieuDe', data.tieuDe);
      formData.append('textDanhGia', data.textDanhGia);
      formData.append('soSao', data.soSao.toString());
      formData.append('user_id', data.user_id.toString());
      formData.append('sp_id', data.sp_id.toString());

      images.forEach(image => formData.append('fileAnh', image));
      if (video) formData.append('fileVid', video);

      const res = await fetchWithAuth(`${API_URL}/CreateWithFileImages`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi tạo đánh giá");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error creating review:", error);
      throw error;
    }
  },

  async update(
    idDanhGia: number,
    idNv: number,
    soSao: number,
    tieuDe: string,
    textDanhGia: string,
    textPhanHoi: string
  ): Promise<DanhGiaResponse> {
    if (!idDanhGia || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để cập nhật đánh giá");
    }

    try {
      const formData = new FormData();
      formData.append('soSao', soSao.toString());
      formData.append('tieuDe', tieuDe);
      formData.append('textDanhGia', textDanhGia);
      formData.append('textPhanHoi', textPhanHoi || ""); // Đảm bảo không null

      // BE có thể expect fileAnh và fileVid luôn luôn được gửi
      const emptyBlob = new Blob([], { type: 'application/octet-stream' });
      formData.append('fileAnh', emptyBlob, 'empty.jpg');
      formData.append('fileVid', emptyBlob, 'empty.mp4');

      console.log("🔍 Update request data:", { idDanhGia, idNv, soSao, tieuDe, textDanhGia, textPhanHoi });

      const res = await fetchWithAuth(`${API_URL}/update/${idDanhGia}/${idNv}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Update error response:", errorData);
        throw new Error(errorData.message || "Lỗi khi cập nhật đánh giá");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error updating review:", error);
      throw error;
    }
  },

  async updateWithFiles(
    idDanhGia: number,
    idNv: number,
    soSao: number,
    tieuDe: string,
    textDanhGia: string,
    textPhanHoi: string,
    newImages?: File[],
    newVideo?: File
  ): Promise<DanhGiaResponse> {
    if (!idDanhGia || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để cập nhật đánh giá");
    }

    try {
      // Nếu không có files mới, sử dụng method update thông thường
      if ((!newImages || newImages.length === 0) && (!newVideo || newVideo.size === 0)) {
        console.log("🔍 No files to update, using regular update method");
        return await this.update(idDanhGia, idNv, soSao, tieuDe, textDanhGia, textPhanHoi);
      }

      console.log("🔍 Updating with files:", { 
        newImages: newImages?.length, 
        newVideo: newVideo?.size,
        videoName: newVideo?.name 
      });

      // Nếu có files, sử dụng FormData
      const formData = new FormData();
      formData.append('soSao', soSao.toString());
      formData.append('tieuDe', tieuDe);
      formData.append('textDanhGia', textDanhGia);
      formData.append('textPhanHoi', textPhanHoi || ""); // Đảm bảo không null

      // Thêm files nếu có
      if (newImages && newImages.length > 0) {
        newImages.forEach(image => formData.append('fileAnh', image));
      } else {
        // Gửi file rỗng nếu không có ảnh mới
        const emptyBlob = new Blob([], { type: 'image/jpeg' });
        formData.append('fileAnh', emptyBlob, 'empty.jpg');
      }

      if (newVideo && newVideo.size > 0) {
        console.log("🔍 Adding video to form data:", { 
          name: newVideo.name, 
          size: newVideo.size, 
          type: newVideo.type 
        });
        formData.append('fileVid', newVideo);
      } else {
        // Gửi file rỗng nếu không có video mới
        const emptyBlob = new Blob([], { type: 'video/mp4' });
        formData.append('fileVid', emptyBlob, 'empty.mp4');
      }

      // Sử dụng endpoint update thông thường vì BE chỉ có endpoint này
      console.log("🔍 Sending request to:", `${API_URL}/update/${idDanhGia}/${idNv}`);
      
      // Thêm timeout cho video upload (5 phút)
      const timeoutDuration = newVideo && newVideo.size > 0 ? 5 * 60 * 1000 : 30 * 1000;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      try {
        const res = await fetchWithAuth(`${API_URL}/update/${idDanhGia}/${idNv}`, {
          method: 'PUT',
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("❌ Update error response:", errorData);
          throw new Error(errorData.message || "Lỗi khi cập nhật đánh giá");
        }

        const result = await res.json();
        console.log("✅ Update successful:", result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error("Upload timeout - vui lòng thử lại với file nhỏ hơn");
        }
        throw error;
      }
    } catch (error) {
      console.error("❌ Error updating review with files:", error);
      throw error;
    }
  },

  // Nếu backend có API này, bỏ comment và dùng
  /*
  async updateWithMedia(
    idDanhGia: number,
    idNv: number,
    soSao: number,
    tieuDe: string,
    textDanhGia: string,
    textPhanHoi: string,
    newImages?: File[],
    newVideo?: File,
    hiddenImageIds?: number[],
    hiddenVideoId?: number | null
  ): Promise<DanhGiaResponse> {
    if (!idDanhGia || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để cập nhật đánh giá");
    }

    try {
      const formData = new FormData();
      formData.append('soSao', soSao.toString());
      formData.append('tieuDe', tieuDe);
      formData.append('textDanhGia', textDanhGia);
      formData.append('textPhanHoi', textPhanHoi.trim());

      newImages?.forEach(img => formData.append('newImages', img));
      if (newVideo) formData.append('newVideo', newVideo);

      if (hiddenImageIds && hiddenImageIds.length > 0) {
        formData.append('hiddenImageIds', JSON.stringify(hiddenImageIds));
      }

      if (hiddenVideoId != null) {
        formData.append('hiddenVideoId', hiddenVideoId.toString());
      }

      const res = await fetchWithAuth(`${API_URL}/updateWithMedia/${idDanhGia}/${idNv}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi cập nhật đánh giá");
      }

      return await res.json();
    } catch (error) {
      console.error("❌ Error updating review with media:", error);
      throw error;
    }
  },
  */

  async delete(idDanhGia: number, idNv: number): Promise<string> {
    if (!idDanhGia || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để xóa đánh giá");
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/delete/${idDanhGia}/${idNv}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi xóa đánh giá");
      }

      const result = await res.json();
      return result.message || "Xóa đánh giá thành công";
    } catch (error) {
      console.error("❌ Error deleting review:", error);
      throw error;
    }
  },

  getImageUrl(fileName: string): string {
    return `${API_URL}/images/${fileName}`;
  },

  getVideoUrl(fileName: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/lego-store/danh-gia/videos/${fileName}`;
  },

  async deleteAnh(idAnh: number, idNv: number): Promise<string> {
    if (!idAnh || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để xóa ảnh");
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/delete-anh/${idAnh}/${idNv}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi xóa ảnh");
      }

      const result = await res.json();
      return result.message || "Xóa ảnh thành công";
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      throw error;
    }
  },

  async deleteVideo(idVid: number, idNv: number): Promise<string> {
    if (!idVid || !idNv) {
      throw new Error("Thiếu thông tin cần thiết để xóa video");
    }

    try {
      const res = await fetchWithAuth(`${API_URL}/delete-vid/${idVid}/${idNv}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi xóa video");
      }

      const result = await res.json();
      return result.message || "Xóa video thành công";
    } catch (error) {
      console.error("❌ Error deleting video:", error);
      throw error;
    }
  },
};
