"use client";
import React, { useState } from "react";
import KhuyenMaiSanPham from "./KhuyenMaiSanPham";
import { Button } from "@/components/ui/button";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Page() {
  const { data: danhSachSanPhamKM = [] } = useListKhuyenMaiTheoSanPham();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(danhSachSanPhamKM.length / itemPerPage);

  return (
    <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-white mb-2">
          Áp dụng khuyến mại cho sản phẩm
        </h1>
      </motion.div>
      <KhuyenMaiSanPham currentPage={currentPage} itemPerPage={itemPerPage} />
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Trang trước
        </Button>
        <span className="text-sm font-medium">
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Trang sau
        </Button>
      </div>
    </Card>
  );
}
