import { DTOUser, Role } from "@/components/types/account.type";

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
    return { ...rest, role_id: Number(role?.id ?? role_id ?? 0) };
  }

const API_URL = "http://localhost:8080/api/lego-store/user";

export const accountService = {
  async getAccounts(keyword?: string): Promise<DTOUser[]> {
    const url = keyword
      ? `${API_URL}/paging?keyword=${encodeURIComponent(keyword)}`
      : `${API_URL}/paging`;
  
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");
  
    const data: RawUserFromApi[] = await res.json();
  
    return data.map(normalizeAccount);
  },
  
  // Lấy account theo role
  async getAccountsByRole(roleId: string): Promise<DTOUser[]> {
    const res = await fetch(`${API_URL}/getTheoRole?roleId=${roleId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lọc theo vai trò");
  
    const data: RawUserFromApi[] = await res.json();
  
    return data.map(normalizeAccount);
  },

  async getRoles(): Promise<Role[]> {
    const res = await fetch(`${API_URL}/getRole`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải danh sách vai trò");

    const result = await res.json();
    console.log("✅ Roles fetched:", result);
    return result;
  },

  async addAccount(data: Partial<DTOUser>): Promise<DTOUser> {
    const res = await fetch(`${API_URL}/register`, {
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
    const res = await fetch(`${API_URL}/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Không thể tạo tài khoản");

    const result = await res.json();

    return normalizeAccount(result);
  },

  async updateAccount(id: number, data: Partial<DTOUser>): Promise<DTOUser> {
    const res = await fetch(`${API_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      const errorText = await res.text(); // <-- GHI LẠI RESPONSE LỖI
      console.error("❌ Update error body:", errorText);
      throw new Error("Không thể cập nhật tài khoản");
    }
  
    const result = await res.json();
    return normalizeAccount(result);
  }  
};
