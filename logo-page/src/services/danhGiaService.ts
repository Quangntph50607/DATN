import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/danh-gia";

export const danhGiaService = {
    // Lấy danh sách đánh giá theo sản phẩm
    getBySanPham: async (sanPhamId: number) => {
        try {
            console.log(`🔍 Fetching reviews for product ${sanPhamId}...`);
            const res = await fetchWithAuth(`${API_URL}/${sanPhamId}`);
            console.log(`📡 Response status: ${res.status}`);

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`❌ Failed to fetch reviews: ${res.status} - ${errorText}`);
                throw new Error(`Failed to fetch reviews: ${res.status} - ${errorText}`);
            }

            const data = await res.json();
            console.log(`✅ Reviews fetched for product ${sanPhamId}:`, data);
            console.log(`📊 Total reviews: ${Array.isArray(data) ? data.length : 'Not an array'}`);
            return data;
        } catch (error) {
            console.error("❌ Error fetching reviews:", error);
            throw error;
        }
    },

    // Tạo đánh giá mới
    create: async (data: any) => {
        try {
            console.log("📝 Creating review with data:", data);
            const res = await fetchWithAuth(`${API_URL}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            console.log(`📡 Create response status: ${res.status}`);

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`❌ Failed to create review: ${res.status} - ${errorText}`);
                throw new Error(`Failed to create review: ${res.status} - ${errorText}`);
            }

            const result = await res.json();
            console.log("✅ Review created successfully:", result);
            return result;
        } catch (error) {
            console.error("❌ Error creating review:", error);
            throw error;
        }
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