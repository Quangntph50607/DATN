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

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PhieuGiamGiaType | null>(null);
  const { data: getListPhieuGiam = [], isLoading, refetch } = useGetPhieuGiam();
  const deletePhieuGiam = useXoaPhieuGiamGia();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 5;
  const totalPages = Math.ceil(getListPhieuGiam.length / itemPerPage);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const paginatedData = getListPhieuGiam.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

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
    <Card className="p-4 bg-gray-800 shadow-md max-h-screen w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Quản Lý Phiếu Giảm Giá
        </h1>
      </motion.div>

      {/* Modal form */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
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

      {/* DANH SÁCH PHIẾU GIẢM */}
      <div ref={tableRef} className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">Danh sách phiếu giảm</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-400 px-2"
          >
            <PlusIcon />
            Thêm phiếu giảm giá
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Đang tải danh sách...</p>
        ) : (
          <>
            <div className="overflow-auto border-none ">
              <PhieuGiamTable
                phieuGiamGias={paginatedData}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>

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
          </>
        )}
      </div>
    </Card>
  );
}
