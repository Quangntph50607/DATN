import { DTOUser, Role } from "@/components/types/account.type";
import { fetchWithAuth } from "./fetchWithAuth";

type RawUserFromApi = Omit<DTOUser, "role_id"> & {
  role_id?: number | string;
  role?: {
    id: number;
    name: string;
  };
};

// Hàm helper để chuẩn hóa dữ liệu từ API về DTOUser
function normalizeAccount(acc: RawUserFromApi): DTOUser {
  const { role, role_id, ...rest } = acc;
  return {
    ...rest,
    role_id: Number(role?.id ?? role_id ?? 0),
    role: role ? { id: role.id, name: role.name } : undefined,
  };
}

const API_URL = "http://localhost:8080/api/lego-store/user";

export const accountService = {
  async getAccounts(keyword?: string): Promise<DTOUser[]> {
    const url = keyword
      ? `${API_URL}/paging?keyword=${encodeURIComponent(keyword)}`
      : `${API_URL}/paging`;
    const res = await fetchWithAuth(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");
    const data: RawUserFromApi[] = await res.json();
    return data.map(normalizeAccount);
  },

  // Lấy account theo role
  async getAccountsByRole(roleId: string): Promise<DTOUser[]> {
    const res = await fetchWithAuth(`${API_URL}/getTheoRole?roleId=${roleId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lọc theo vai trò");

    const data: RawUserFromApi[] = await res.json();

    return data.map(normalizeAccount);
  },

  async getRoles(): Promise<Role[]> {
    const res = await fetchWithAuth(`${API_URL}/getRole`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải danh sách vai trò");

    const result = await res.json();
    console.log("✅ Roles fetched:", result);
    return result;
  },

  async addAccount(data: Partial<DTOUser>): Promise<DTOUser> {
    const res = await fetchWithAuth(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Không thể đăng ký tài khoản");
    const result = await res.json();

    return normalizeAccount(result);
  },

  async createUser(data: DTOUser): Promise<DTOUser> {
    const res = await fetchWithAuth(`${API_URL}/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Create user error:", errorText);

      // Xử lý lỗi cụ thể từ backend
      if (errorText.includes("Email da ton tai") || errorText.includes("email")) {
        throw new Error("Email đã tồn tại trong hệ thống");
      }
      if (errorText.includes("khong tim thay id role")) {
        throw new Error("Vai trò không hợp lệ");
      }

      throw new Error("Không thể tạo tài khoản: " + errorText);
    }

    const result = await res.json();
    return normalizeAccount(result);
  },

  async updateAccount(id: number, data: Partial<DTOUser>): Promise<DTOUser> {
    const res = await fetchWithAuth(`${API_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Update error body:", errorText);

      // Xử lý lỗi cụ thể từ backend
      if (errorText.includes("Email da ton tai") || errorText.includes("email")) {
        throw new Error("Email đã tồn tại trong hệ thống");
      }
      if (errorText.includes("Khong tim thay id user")) {
        throw new Error("Không tìm thấy tài khoản");
      }
      if (errorText.includes("role khong ton tai")) {
        throw new Error("Vai trò không hợp lệ");
      }

      throw new Error("Không thể cập nhật tài khoản: " + errorText);
    }

    const result = await res.json();
    return normalizeAccount(result);
  },

  // API đổi mật khẩu
  async changePassword(userId: number, newPassword: string): Promise<{ message: string }> {
    const res = await fetchWithAuth(`${API_URL}/doiMatKhau/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        matKhauMoi: newPassword
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Change password error:", errorText);

      if (errorText.includes("Khong tim thay id user")) {
        throw new Error("Không tìm thấy tài khoản");
      }
      if (errorText.includes("Mat khau khong hop le")) {
        throw new Error("Mật khẩu không hợp lệ");
      }

      throw new Error("Không thể đổi mật khẩu: " + errorText);
    }

    // Xử lý response - có thể là text hoặc JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    } else {
      // Nếu là text, wrap thành object
      const textResponse = await res.text();
      return { message: textResponse };
    }
  },

  // Cộng điểm tích lũy cho user
  async addPoints(userId: number, diemCong: number = 100): Promise<{ message: string }> {
    const res = await fetchWithAuth(`${API_URL}/${userId}/cong-diem?diem=${diemCong}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Không thể cộng điểm");
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    const text = await res.text();
    return { message: text };
  }
};


