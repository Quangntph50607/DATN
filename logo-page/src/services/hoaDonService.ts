import { HoaDonDTO, CreateHoaDonDTO, HoaDonChiTietDTO } from "@/components/types/hoaDon-types";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/hoa-don";

export const HoaDonService = {
    // Create new order
    async createHoaDon(orderData: CreateHoaDonDTO): Promise<HoaDonDTO> {
        try {
            console.log('Sending order data:', orderData);
            const res = await fetchWithAuth(`${API_URL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData),
            });

            if (!res.ok) {
                let errorMessage = 'Không thể tạo hóa đơn';
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    errorMessage = Array.isArray(errorData)
                        ? errorData.join(', ')
                        : errorData.message || JSON.stringify(errorData);
                } else {
                    const errorText = await res.text();
                    errorMessage = errorText || 'Không thể tạo hóa đơn';
                }
                throw new Error(errorMessage);
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi tạo hóa đơn:', error);
            throw error;
        }
    },

    async getAllHoaDons(): Promise<HoaDonDTO[]> {
        try {
            const res = await fetchWithAuth(`${API_URL}/get-all-hoa-don`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách hóa đơn');
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },

    // Hàm lấy tất cả hóa đơn (có phân trang)
    async getPagedHoaDons(page: number = 0, size: number = 10): Promise<{
        content: HoaDonDTO[];
        totalPages: number;
        totalElements: number;
        number: number;
    }> {
        try {
            const res = await fetchWithAuth(`${API_URL}/paging?page=${page}&size=${size}`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách hóa đơn');
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },

    // Lấy chi tiết hóa đơn theo ID
    async getHoaDonById(id: number) {
        const res = await fetchWithAuth(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Không thể lấy chi tiết hóa đơn");
        return res.json();
    },

    async updateTrangThai(id: number, trangThai: string): Promise<HoaDonDTO> {
        const res = await fetchWithAuth(
            `${API_URL}/${id}/trang-thai?trangThai=${encodeURIComponent(trangThai)}`,
            {
                method: "PUT",
            }
        );
        if (!res.ok) throw new Error("Không thể cập nhật trạng thái");
        return res.json();
    },

    async getStatusCounts(): Promise<Record<string, number>> {
        const res = await fetchWithAuth(`${API_URL}/status-count`, { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể lấy thống kê trạng thái");
        return res.json();
    },

    async getChiTietSanPhamByHoaDonId(id: number): Promise<HoaDonChiTietDTO[]> {
        const res = await fetchWithAuth(
            `http://localhost:8080/api/lego-store/hoa-don-chi-tiet/hoaDon/${id}`
        );
        if (!res.ok) throw new Error("Không thể lấy chi tiết sản phẩm hóa đơn");
        return res.json();
    },
};
