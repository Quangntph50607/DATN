"use client";
import AdminSidebar from "@/components/layout/(components)/(pages)/Adminsidebar";
import HeaderAdmin from "@/components/layout/(components)/(pages)/HeaderAdmin";
import AccessDenied from "@/components/ui/AccessDenied";
import { Toaster } from "sonner";
import { useUserStore } from "@/context/authStore.store";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Danh sách các trang chỉ dành cho Admin (role 1)
  const adminOnlyPages = [
    "/admin/thongke",
    "/admin/phieugiam", 
    "/admin/khuyenmai",
    "/admin/nguoidung"
  ];

  // Kiểm tra xem trang hiện tại có bị hạn chế không
  const isRestrictedPage = adminOnlyPages.some(page => pathname.startsWith(page));

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const ADMIN_ROLES = [1, 2];
    if (!ADMIN_ROLES.includes(user.roleId)) {
      router.push("/");
      return;
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user || (user.roleId !== 1 && user.roleId !== 2)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center space-y-6 p-8">
          {/* Modern loading spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>

          {/* Loading text with animation */}
          <div className="space-y-2">
            <p className="text-white text-lg font-medium">
              Đang kiểm tra quyền truy cập...
            </p>
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu là nhân viên (role 2) và đang truy cập trang bị hạn chế
  if (user.roleId === 2 && isRestrictedPage) {
    return <AccessDenied currentRole="Nhân viên" requiredRole="Admin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile backdrop overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar with enhanced styling */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out transform ${
          collapsed
            ? isMobile
              ? "-translate-x-full"
              : "w-20"
            : "w-64 translate-x-0"
        } ${isMobile ? "shadow-2xl" : "shadow-xl"}`}
      >
        <div className="h-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 border-r border-slate-700/50">
          <AdminSidebar
            collapsed={collapsed && !isMobile}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>
      </div>

      {/* Header with glassmorphism effect */}
      <div
        className={`fixed top-0 right-0 h-16 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? (isMobile ? "left-0" : "left-20") : "left-64"
        } ${isMobile && "left-0"}`}
      >
        <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-slate-700/50 shadow-sm">
          <HeaderAdmin />
        </div>
      </div>

      {/* Main content with improved styling */}
      <main
        className={`transition-all duration-300 ease-in-out pt-16 min-h-screen ${
          collapsed ? (isMobile ? "ml-0" : "ml-20") : "ml-64"
        } ${isMobile && "ml-0"}`}
      >
        {/* Content wrapper with better spacing and styling */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Content background with subtle styling */}
          <div className="max-w-full">{children}</div>
        </div>

        {/* Enhanced Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
      </main>

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          aria-label="Toggle menu"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${
              collapsed ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
