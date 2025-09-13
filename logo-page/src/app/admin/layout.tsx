"use client";
import AdminSidebar from "@/components/layout/(components)/(pages)/Adminsidebar";
import HeaderAdmin from "@/components/layout/(components)/(pages)/HeaderAdmin";
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.roleId !== 1 && user.roleId !== 2) {
      router.push("/");
      return;
    }
  }, [user, hydrated, router]);

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
    <div>
      {/* Sidebar cố định bên trái */}
      <div className={`fixed left-0 top-0 h-screen bg-[#1a2233] z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      
      {/* Header cố định trên cùng, bên phải sidebar */}
      <div className={`fixed top-0 right-0 h-16 bg-[#232b3e] z-40 transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-64'
      }`}>
        <HeaderAdmin />
      </div>
      
      {/* Nội dung chính cuộn được */}
      <main className={`mt-16 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
        collapsed ? 'ml-20' : 'ml-64'
      }`}>
        {children}
        <Toaster position="top-right" />
      </main>
    </div>
  );
}
