export const adminRoutes = [
    { label: "Thống kê", href: "/admin/thongke", icon: "layout-dashboard" },
    { label: "Quản lý sản phẩm", icon: "package", 
        children: [
        { label: "Sản phẩm", href: "/admin/sanpham" },
        { label: "Danh mục", href: "/admin/danhmuc" },
        { label: "Bộ sưu tập", href: "/admin/bosuutap" }
      ], 
    },
    { label: "Quản lý hóa Đơn", href: "/admin/hoadon", icon: "shopping-cart" },
    { label: "Khuyến mãi", href: "/admin/khuyenmai", icon: "tag" },
    { label: "Quản lý người dùng", href: "/admin/nguoidung", icon: "users" },
    { label: "Bán Hàng", href: "/admin/banhang", icon: "bar-chart-3" },
  ];
  