
import { ThongTinNguoiNhan, DTOThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/thong-tin-nguoi-nhan";

export const thongTinTaiKhoanService = {
    // Lấy thông tin theo user ID
    async getThongTinByUserId(userId: number): Promise<ThongTinNguoiNhan[]> {
        if (!userId || userId <= 0) {
            throw new Error("User ID không hợp lệ");
        }

        const res = await fetchWithAuth(`${API_URL}/${userId}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Get thông tin error:", errorText);

            try {
                const error = JSON.parse(errorText);
                throw new Error(error.message || "Không thể lấy thông tin người nhận");
            } catch (parseError) {
                throw new Error("Không thể lấy thông tin người nhận");
            }
        }

        return res.json();
    },

    // Tạo thông tin mới
    async createThongTin(data: DTOThongTinNguoiNhan): Promise<ThongTinNguoiNhan> {
        // Validate required fields
        if (!data.hoTen?.trim()) throw new Error("Họ tên không được để trống");
        if (!data.sdt?.trim()) throw new Error("Số điện thoại không được để trống");
        if (!data.duong?.trim()) throw new Error("Địa chỉ không được để trống");
        if (!data.xa?.trim()) throw new Error("Xã/phường không được để trống");
        if (!data.thanhPho?.trim()) throw new Error("Tỉnh/thành phố không được để trống");
        if (!data.idUser || data.idUser <= 0) throw new Error("User ID không hợp lệ");

        // Chuẩn bị payload theo đúng format Java expects
        const payload = {
            hoTen: data.hoTen.trim(),
            sdt: data.sdt.trim(),
            duong: data.duong.trim(),
            xa: data.xa.trim(),
            thanhPho: data.thanhPho.trim(),
            isMacDinh: data.isMacDinh || 0,
            idUser: data.idUser
        };

        console.log("Creating thông tin with payload:", payload);

        const res = await fetchWithAuth(`${API_URL}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Create error response:", errorText);

            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || "Không thể tạo địa chỉ mới");
            } catch (parseError) {
                throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
            }
        }

        return res.json();
    },

    // Cập nhật thông tin
    async updateThongTin(id: number, data: DTOThongTinNguoiNhan): Promise<ThongTinNguoiNhan> {
        // Validate ID
        if (!id || id <= 0) throw new Error("ID không hợp lệ");

        console.log("=== UPDATE DEBUG START ===");
        console.log("Attempting to update ID:", id);
        console.log("Update data:", data);

        // Validate dữ liệu
        if (!data.hoTen?.trim()) throw new Error("Họ tên không được để trống");
        if (!data.sdt?.trim()) throw new Error("Số điện thoại không được để trống");
        if (!data.duong?.trim()) throw new Error("Địa chỉ không được để trống");
        if (!data.xa?.trim()) throw new Error("Xã/phường không được để trống");
        if (!data.thanhPho?.trim()) throw new Error("Tỉnh/thành phố không được để trống");
        if (!data.idUser || data.idUser <= 0) throw new Error("User ID không hợp lệ");

        // Chuẩn bị payload theo đúng format Java expects
        const payload = {
            hoTen: data.hoTen.trim(),
            sdt: data.sdt.trim(),
            duong: data.duong.trim(),
            xa: data.xa.trim(),
            thanhPho: data.thanhPho.trim(),
            isMacDinh: data.isMacDinh || 0,
            idUser: data.idUser
        };

        console.log("PUT payload:", payload);

        const res = await fetchWithAuth(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        console.log("PUT response status:", res.status);
        console.log("PUT response ok:", res.ok);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ PUT failed with error:", errorText);

            try {
                const errorJson = JSON.parse(errorText);
                console.error("Parsed error:", errorJson);

                if (errorJson.message?.includes("Không tìm thấy bản ghi")) {
                    throw new Error(`Địa chỉ ID ${id} không tồn tại trên server. Vui lòng tải lại trang.`);
                }
                if (errorJson.message?.includes("Không có gì thay đổi")) {
                    throw new Error("Không có thông tin nào thay đổi để cập nhật");
                }
                throw new Error(errorJson.message || "Không thể cập nhật thông tin");
            } catch (parseError) {
                console.error("Cannot parse error response, raw text:", errorText);

                if (errorText.includes("Không tìm thấy bản ghi")) {
                    throw new Error(`Địa chỉ ID ${id} không tồn tại trên server. Vui lòng tải lại trang.`);
                }
                if (errorText.includes("404") || errorText.includes("Not Found")) {
                    throw new Error(`Địa chỉ ID ${id} không tồn tại`);
                }

                throw new Error(`Không thể cập nhật địa chỉ ID ${id}`);
            }
        }

        const result = await res.json();
        console.log("✅ PUT success:", result);
        console.log("=== UPDATE DEBUG END ===");

        return result;
    },

    // Delete thông tin người nhận
    async deleteThongTin(id: number): Promise<void> {
        console.log("=== DELETE DEBUG START ===");
        console.log("Deleting ID:", id);

        if (!id || id <= 0) {
            throw new Error("ID không hợp lệ");
        }

        const res = await fetchWithAuth(`${API_URL}/delete/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        console.log("DELETE response status:", res.status);
        console.log("DELETE response ok:", res.ok);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("DELETE error response:", errorText);

            try {
                const errorJson = JSON.parse(errorText);
                console.error("Parsed error:", errorJson);

                if (errorJson.message?.includes("Không tìm thấy bản ghi")) {
                    throw new Error(`Địa chỉ ID ${id} không tồn tại trên server`);
                }
                throw new Error(errorJson.message || "Không thể xóa địa chỉ");
            } catch (parseError) {
                console.error("Cannot parse error response, raw text:", errorText);

                if (errorText.includes("404") || errorText.includes("Not Found")) {
                    throw new Error(`Địa chỉ ID ${id} không tồn tại`);
                }
                if (errorText.includes("403") || errorText.includes("Forbidden")) {
                    throw new Error("Không có quyền xóa địa chỉ này");
                }
                if (errorText.includes("500") || errorText.includes("Internal Server Error")) {
                    throw new Error("Lỗi server. Vui lòng thử lại sau");
                }

                throw new Error(`Không thể xóa địa chỉ ID ${id}`);
            }
        }

        // Kiểm tra response có content không
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                const result = await res.json();
                console.log("✅ DELETE success:", result);
            } catch (jsonError) {
                console.log("✅ DELETE success (no JSON response)");
            }
        } else {
            console.log("✅ DELETE success (non-JSON response)");
        }

        console.log("=== DELETE DEBUG END ===");
    },
};
