import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách route cần bảo vệ (chỉ cho user đã đăng nhập)
const protectedRoutes = ["/admin", "/banhang", "/account", "/profile"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // Lấy token từ cookie (nếu bạn lưu ở cookie) hoặc từ header (nếu gửi từ FE)
    // Nếu chỉ lưu ở localStorage, middleware chỉ bảo vệ tốt khi user chuyển trang client-side.
    const token = request.cookies.get("access_token")?.value;

    // Nếu truy cập route cần bảo vệ mà không có token, chuyển hướng về login
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!token) {
            const loginUrl = new URL("/auth/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
        // (Nâng cao) Có thể decode token để kiểm tra role, quyền ở đây
    }

    // Cho phép truy cập các route còn lại
    return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route chỉ định
export const config = {
    matcher: ["/admin/:path*", "/banhang/:path*", "/account/:path*", "/profile/:path*"],
};