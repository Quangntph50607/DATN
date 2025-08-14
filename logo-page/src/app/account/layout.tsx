"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { useUserStore } from "@/context/authStore.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, ShoppingBag, MapPin, Tag, Lock, Heart } from "lucide-react";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { useRouter } from "next/navigation";

const menus = [
  {
    label: "Thông tin tài khoản",
    href: "/account/info",
    icon: User,
    bgColor: "bg-orange-100"
  },
  {
    label: "Đơn hàng",
    href: "/account/history",
    icon: ShoppingBag,
    bgColor: "bg-orange-100"
  },
  {
    label: "Sản phẩm yêu thích",
    href: "/account/favorites",
    icon: Heart,
    bgColor: "bg-red-100"
  },
  {
    label: "Địa chỉ nhận hàng",
    href: "/account/address",
    icon: MapPin,
    bgColor: "bg-orange-100"
  },
  {
    label: "Phiếu giảm giá",
    href: "/account/vouchers",
    icon: Tag,
    bgColor: "bg-orange-100"
  },
  {
    label: "Đổi mật khẩu",
    href: "/account/change-password",
    icon: Lock,
    bgColor: "bg-orange-100"
  },
];

export default function Accountlayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userName = user?.ten || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="ml-3 flex flex-1 h-[calc(40vh-40px)]"> {/* Fixed height minus header */}
        {/* Sidebar - User Profile Card - Fixed width */}
        <aside className="w-80 min-w-80 h-200 bg-white shadow-sm flex flex-col">
          {/* Back to Home Button */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full justify-start text-sm font-medium h-10 text-gray-600 hover:bg-gray-50 hover:text-orange-600"
            >
              <ArrowLeft className="w-4 h-2 mr-2" />
              Quay lại trang chủ
            </Button>
          </div>

          {/* Profile Section - Orange Gradient - Fixed height */}
          <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 p-8 text-white relative overflow-hidden flex-shrink-0 h-53 text-center">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full opacity-20"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-white rounded-full opacity-15"></div>
              <div className="absolute top-1/2 right-8 w-8 h-8 bg-white rounded-full opacity-25"></div>
            </div>

            {/* Avatar with rounded background */}
            <div className="flex justify-center mb-6 relative z-10 text-center">
              <div className="bg-orange-300/30 p-4 rounded-2xl backdrop-blur-sm">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/avatar-placeholder.png" alt="Avatar" />
                  <AvatarFallback className="bg-white/20 text-white text-lg font-bold backdrop-blur-sm">
                    {userName.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* User Name */}
            <h2 className="text-center text-xl font-bold mb-2 relative z-10">
              {userName || "Nguyễn Văn A"}
            </h2>

            {/* VIP Badge
            <div className="flex justify-center mb-4 relative z-10">
              <span className="text-sm text-orange-100 font-medium">
                Khách hàng VIP
              </span>
            </div>

            {/* Premium Badge */}
            {/* <div className="flex justify-center relative z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Premium</span>
              </div>
            </div> */}
          </div>

          <Separator />

          {/* Navigation Menu - Scrollable */}
          <ScrollArea className="flex-1 px-6">
            <nav className="py-6">
              <div className="space-y-3">
                {menus.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link href={item.href} key={item.href}>
                      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-orange-50 border border-orange-200"
                        : "hover:bg-gray-50"
                        }`}>
                        <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-orange-500"
                            }`} />
                        </div>
                        <span className={`font-medium ${isActive ? "text-orange-600" : "text-gray-700"
                          }`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Main content - Scrollable */}
        <main className="flex-1 bg-white overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>

      <Footer />
    </div>
  );
}







