"use client";
import AdminSidebar from "@/components/layout/(components)/(pages)/Adminsidebar";
import HeaderAdmin from "@/components/layout/(components)/(pages)/HeaderAdmin";
// import HeaderAdmin from "@/components/layout/(components)/(pages)/HeaderAdmin";
import { Toaster } from "sonner";
import { useUserStore } from "@/context/authStore.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      // Chưa đăng nhập, chuyển về trang login
      router.push("/auth/login");
      return;
    }

    if (user.roleId !== 1 && user.roleId !== 2) {
      // Không có quyền admin, chuyển về trang chủ
      router.push("/");
      return;
    }
  }, [user, hydrated, router]);

  // Hiển thị loading hoặc redirect nếu chưa hydrate hoặc không có quyền
  if (!hydrated || !user || (user.roleId !== 1 && user.roleId !== 2)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <HeaderAdmin />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
          <Toaster position="top-right" />
        </main>
      </div>
    </div>
  );
}
