'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Next.js 13+ dùng usePathname
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  UsersIcon,
  SettingsIcon,
  HelpCircleIcon,
  MenuIcon,
  XIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon
} from 'lucide-react';

export default function AdminSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboardIcon size={20} />, label: 'Bảng điều khiển', href: '/dashboard/admin/thongke' },
    { icon: <PackageIcon size={20} />, label: 'Quản lý sản phẩm LEGO', href: '/dashboard/admin/sanpham' },
    { icon: <ShoppingCartIcon size={20} />, label: 'Đơn hàng', href: '/dashboard/admin/hoadon' },
    { icon: <TagIcon size={20} />, label: 'Khuyến mãi', href: '/dashboard/admin/khuyenmai' },
    { icon: <UsersIcon size={20} />, label: 'Khách hàng', href: '/dashboard/admin/khachhang' },
    { icon: <BarChart3Icon size={20} />, label: 'Báo cáo', href: '/reports' },
    { icon: <SettingsIcon size={20} />, label: 'Cài đặt', href: '/settings' },
    { icon: <HelpCircleIcon size={20} />, label: 'Trợ giúp', href: '/help' }
  ];

  return (
    <>

      <button
        className="fixed z-50 top-4 left-4 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={toggleMobile}
      >
        {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      <aside
        className={`fixed md:static z-40 h-full bg-white border-r border-gray-200 transition-all duration-300
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-700
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <img src="/images/logoM.jpg" alt="" className="h-8 max-w-[120px] object-contain" />
          {!collapsed && <h1 className="text-sm font-bold text-gray-800 dark:text-white">LEGO MYKINGDOM</h1>}
          <button className="hidden md:block p-1.5 rounded-md hover:bg-gray-100" onClick={toggleSidebar}>
            <MenuIcon size={20} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
