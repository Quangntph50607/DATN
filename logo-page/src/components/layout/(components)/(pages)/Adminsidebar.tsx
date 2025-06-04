"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // bạn nên có hàm này để merge class tailwind

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { adminRoutes } from "@/lib/route";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  package: Package,
  "shopping-cart": ShoppingCart,
  tag: Tag,
  users: Users,
  "bar-chart-3": BarChart3,
};

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="fixed z-50 top-4 left-4 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:static top-0 left-0 z-40 h-screen w-64",
          "border-r bg-white dark:bg-gray-900 transition-all duration-300",
          collapsed ? "w-30" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between  h-16 px-4 border-b dark:border-gray-700">
          <Image
            src="/images/logoM.jpg"
            alt="Logo"
            width={120}
            height={32}
            className="h-8 object-contain"
          />
          {!collapsed && <h1 className="text-sm font-bold">LEGO MYKINGDOM</h1>}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block"
          >
            <Menu size={20} />
          </Button>
        </div>

        <nav className="p-2 space-y-1 ">
          {adminRoutes.map((item) => {
            const isActive = pathname === item.href;
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md  transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
