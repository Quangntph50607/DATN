"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/context/authStore.store";

export function useSocialAuth(loginType: "google" | "facebook") {
  const params = useSearchParams();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const code = params.get("code");

    if (!code) return;

    const fetchSocialAuth = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/lego-store/user/auth/social/callback?code=${code}&login-type=${loginType}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`[${loginType}] Callback data:`, data);

        if (data.token) {
          // Lưu token đồng bộ
          localStorage.setItem("access_token", data.token);

          // Cập nhật store
          setUser({
            id: data.id,
            ten: data.ten,
            email: data.email,
            roleId: data.roleId,
            message: data.message,
            token: data.token,
          });

          // Phân quyền
          if (data.roleId === 1 || data.roleId === 2) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        } else {
          console.error("Không có token trong response:", data);
          router.push("/auth/login");
        }
      } catch (err) {
        console.error(`[${loginType}] Callback error:`, err);
        router.push("/auth/login");
      }
    };

    fetchSocialAuth();
  }, [params, router, loginType, setUser]);
}

//
export function GoogleCallback() {
  useSocialAuth("google");
  return <p>Đang xử lý đăng nhập Google...</p>;
}
export function FacebookCallback() {
  useSocialAuth("facebook");
  return <p>Đang xử lý đăng nhập Facebook...</p>;
}
