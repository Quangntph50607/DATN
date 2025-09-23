interface LoginResponse {
  id: number;
  ten: string;
  email: string;
  roleId: number;
  message: string;
  token?: string; // Thêm dòng này
}

interface RegisterResponse {
  message: string;
}

const API_BASE_URL = "http://localhost:8080/api/lego-store/user";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đã có lỗi xảy ra");
  }
  return data;
}

export const authenService = {
  // Đăng ký
  async register(
    user_name: string,
    email: string,
    matKhau: string
  ): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ten: user_name,
        email,
        matKhau,
      }),
    });

    return handleResponse<RegisterResponse>(res);
  },

  // Đăng nhập
  async login(email: string, matKhau: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, matKhau }),
    });

    const data = await handleResponse<LoginResponse>(res);
    // Nếu có token, lưu vào localStorage để các API khác dùng Bearer token
    if (data.token) {
      localStorage.setItem("access_token", data.token);
    }
    return data;
  },

  // Quên mật khẩu - gửi OTP
  async forgotPassword(email: string): Promise<{ code: number; message: string }> {
    const res = await fetch(`${API_BASE_URL}/forgot-password?email=${encodeURIComponent(email)}` , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ code: number; message: string }>(res);
  },

  // Xác minh OTP
  async verifyOtp(email: string, otp: string): Promise<{ code: number; message: string }> {
    const res = await fetch(
      `${API_BASE_URL}/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    return handleResponse<{ code: number; message: string }>(res);
  },

  // Đặt lại mật khẩu
  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ code: number; message: string }> {
    const res = await fetch(
      `${API_BASE_URL}/reset-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    return handleResponse<{ code: number; message: string }>(res);
  },
};
