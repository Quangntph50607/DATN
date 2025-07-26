"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { useUserStore } from "@/context/authStore.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { useRouter } from "next/navigation";

const menus = [
  { label: "thay đổi thông tin tài khoản", href: "/account/info" },
  { label: "Đơn hàng", href: "/account/history" },
  { label: "Địa chỉ nhận hàng", href: "/account/address" },
  { label: "Đổi mật khẩu", href: "/account/change-password" },
];

export default function Accountlayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userName = user?.ten || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar - User Profile Card */}
        <aside className="w-64 bg-yellow-50 border-r border-gray-200 flex flex-col">
          {/* Back to Home Button */}
          <div className="p-4 border-b border-gray-200">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full justify-start text-sm font-medium h-10 text-gray-700 hover:bg-gray-100 hover:text-orange-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/avatar-placeholder.png" alt="Avatar" />
                <AvatarFallback className="bg-gray-300 text-gray-600 text-lg font-medium">
                  A
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Name */}
            <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">
              Hello! {userName}
            </h2>

            {/* User Details */}
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Họ tên:</span> {user?.ten || "nguyen van ky"}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email || "kinguyen240705@gmail.com"}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {user?.sdt || ""}
              </div>
              <div>
                <span className="font-medium">Tỉnh / Thành phố:</span> {user?.diaChi || ""}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menus.map((item) => (
                <Link href={item.href} key={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium h-10 ${pathname === item.href
                      ? "bg-orange-400 text-white hover:bg-orange-500"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}





