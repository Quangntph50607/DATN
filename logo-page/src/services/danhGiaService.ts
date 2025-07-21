import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/danh-gia";

export const danhGiaService = {
    // Lấy danh sách đánh giá theo sản phẩm
    getBySanPham: async (sanPhamId: number) => {
        const res = await fetchWithAuth(`${API_URL}/${sanPhamId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Tạo đánh giá mới
    create: async (data: any) => {
        const res = await fetchWithAuth(`${API_URL}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Upload ảnh cho đánh giá
    uploadImages: async (danhGiaId: number, files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        const res = await fetchWithAuth(`${API_URL}/anh/${danhGiaId}`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Upload video cho đánh giá
    uploadVideo: async (danhGiaId: number, file: File) => {
        const formData = new FormData();
        formData.append("video", file);
        const res = await fetchWithAuth(`${API_URL}/video/${danhGiaId}`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Xem ảnh đánh giá
    getImageUrl: (imgName: string) => `${API_URL}/images/${imgName}`,
};