import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisiblePages) {
            // Hiển thị tất cả trang nếu tổng số trang ít
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic hiển thị trang với ellipsis - giống như trong ảnh
            if (currentPage <= 3) {
                // Trang hiện tại ở đầu: 1, 2, 3, 4, ..., 56
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Trang hiện tại ở cuối: 1, ..., 54, 55, 56
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Trang hiện tại ở giữa: 1, ..., current-1, current, current+1, ..., totalPages
                pages.push(1);
                pages.push("...");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Nút Trang trước */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full border border-red-500 bg-white flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4 text-red-500" />
            </button>

            {/* Các nút số trang */}
            <div className="flex items-center gap-1">
                {visiblePages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <div
                                key={`ellipsis-${index}`}
                                className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center"
                            >
                                <span className="text-gray-500 text-sm font-medium">...</span>
                            </div>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`w-10 h-10 rounded-full transition-all duration-200 font-bold text-sm ${isActive
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            {/* Nút Trang sau */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full border border-red-500 bg-white flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-4 h-4 text-red-500" />
            </button>
        </div>
    );
} 