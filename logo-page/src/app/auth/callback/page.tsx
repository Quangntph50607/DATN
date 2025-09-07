"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/context/authStore.store";

export default function GoogleCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");

    // Nếu có lỗi từ OAuth provider
    if (error) {
      setError("Đăng nhập bị hủy hoặc có lỗi xảy ra");
      setIsLoading(false);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
      return;
    }

    if (code) {
      fetch(
        `http://localhost:8080/api/lego-store/user/auth/social/callback?code=${code}&login-type=google`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.token) {
            localStorage.setItem("access_token", data.token);
            setUser({
              id: data.id,
              ten: data.ten,
              email: data.email,
              roleId: data.roleId,
              message: data.message,
              token: data.token,
            });
            // Phân quyền dựa trên roleId
            if (data.roleId === 1 || data.roleId === 2) {
              router.push("/admin");
            } else {
              router.push("/");
            }
          } else {
            setError("Không thể lấy thông tin đăng nhập");
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi xử lý callback:", err);
          setError("Có lỗi xảy ra khi đăng nhập");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("Không nhận được mã xác thực từ Google");
      setIsLoading(false);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    }
  }, [params, router, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg">Đang xử lý đăng nhập Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600">
            Sẽ chuyển hướng về trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
