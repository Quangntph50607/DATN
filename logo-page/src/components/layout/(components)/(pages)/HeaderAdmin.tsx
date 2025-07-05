"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BellIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/context/authStore.store";
import { useRouter } from "next/navigation";

export default function HeaderAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearUser();
    router.push("/auth/login");
    setMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center flex-1">
      </div>

      <div className="flex items-center space-x-4">
        <Button className="relative p-2 text-gray-600  hover:text-gray-900  focus:outline-none">
          <BellIcon size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="relative " ref={menuRef}>
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center focus:outline-none"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon size={18} className="text-gray-600 dark:text-white" />
              </div>
            </div>
            <div className="ml-2 hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 ">{user?.ten || "Quản lý LEGO"}</p>
              <p className="text-xs text-gray-500 ">{user?.roleId === 1 ? "Admin" : "Staff"}</p>
            </div>
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
              <Link href="/profile">
                <span
                  className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
