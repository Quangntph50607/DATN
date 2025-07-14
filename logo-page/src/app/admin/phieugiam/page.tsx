"use client";
import React, { useRef, useState } from "react";
import PhieuGiamGia from "./PhieuGiamGiaForm";
import PhieuGiamTable from "./PhieuGiamTable";
import { useGetPhieuGiam, useXoaPhieuGiamGia } from "@/hooks/usePhieuGiam";
import { toast } from "sonner";
import type { PhieuGiamGia as PhieuGiamGiaType } from "@/components/types/phieugiam.type";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import { useSearchStore } from "@/context/useSearch.store";
import PhieuGiamFilter from "./PhieuGiamFilter";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PhieuGiamGiaType | null>(null);
  const { data: getListPhieuGiam = [], isLoading, refetch } = useGetPhieuGiam();
  const deletePhieuGiam = useXoaPhieuGiamGia();
  const { keyword, setKeyword } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 5;
  const totalPages = Math.ceil(getListPhieuGiam.length / itemPerPage);
  const tableRef = useRef<HTMLDivElement | null>(null);

  // Bộ lọc thêm
  const [selectedLoaiPhieuGiam, setSelectedLoaiPhieuGiam] = useState<
    "" | "Theo %" | "Theo số tiền"
  >("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Hàm đặt lại bộ lọc
  const handleResetFilter = () => {
    setKeyword("");
    setSelectedLoaiPhieuGiam("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Lọc dữ liệu
  const filtered = getListPhieuGiam.filter((item) => {
    const lowerKeyword = keyword.toLowerCase();

    const matchKeyword =
      item.tenPhieu.toLowerCase().includes(lowerKeyword) ||
      item.maPhieu?.toLowerCase().includes(lowerKeyword) ||
      item.soLuong.toString().includes(lowerKeyword);

    const matchLoai =
      selectedLoaiPhieuGiam === "" ||
      item.loaiPhieuGiam === selectedLoaiPhieuGiam;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const startDate = new Date(item.ngayBatDau);

    const matchDate = (!from || startDate >= from) && (!to || startDate <= to);

    return matchKeyword && matchLoai && matchDate;
  });

  // Phân trang
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  // CRUD
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa phiếu khuyến mãi này?")) {
      try {
        await deletePhieuGiam.mutateAsync(id);
        toast.success("Xóa phiếu giảm thành công!");
        refetch();
      } catch (error) {
        console.error("Lỗi:", error);
        toast.error("Xóa phiếu giảm thất bại!");
      }
    }
  };

  const handleEdit = (data: PhieuGiamGiaType) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setEditing(null);
    setIsModalOpen(false);
  };

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-white mb-2">
          Quản Lý Phiếu Giảm Giá
        </h1>
      </motion.div>

      {/* Modal form */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
          setIsModalOpen(open);
        }}
        title={editing ? "Chỉnh sửa phiếu giảm giá" : "Thêm phiếu giảm giá"}
      >
        <PhieuGiamGia
          editing={editing}
          setEditing={setEditing}
          onSucess={handleSuccess}
        />
      </Modal>

      {/* Bộ lọc */}
      <PhieuGiamFilter
        selectedLoaiPhieuGiam={selectedLoaiPhieuGiam}
        onChangeLoaiPhieuGiam={setSelectedLoaiPhieuGiam}
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={setFromDate}
        onChangeToDate={setToDate}
        onResetFilter={handleResetFilter}
      />

      {/* DANH SÁCH PHIẾU GIẢM */}
      <div ref={tableRef} className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">Danh sách phiếu giảm</h2>
          <Button onClick={() => setIsModalOpen(true)} className="px-2">
            <PlusIcon />
            Thêm phiếu giảm giá
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Đang tải danh sách...</p>
        ) : (
          <>
            <PhieuGiamTable
              phieuGiamGias={paginatedData}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />

            <div className="flex flex-wrap gap-2 justify-center items-center">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm font-medium">
                Trang {currentPage} / {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Trang sau
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
