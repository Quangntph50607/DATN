"use client";
import React, { useState } from "react";
import KhuyenMaiForm from "./KhuyenMaiForm";
import KhuyenMaiTable from "./KhuyenMaiTable";
import { useDeleteKhuyenMai, useKhuyenMai } from "@/hooks/useKhuyenmai";
import { toast } from "sonner";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import { PlusIcon } from "lucide-react";
import { useSearchStore } from "@/context/useSearch.store";
import KhuyenMaiFilter from "./KhuyenMaiFilter";

export default function KhuyenMaiPage() {
  const { data: khuyenMai = [], isLoading, refetch } = useKhuyenMai();
  const [editing, setEditing] = useState<KhuyenMaiDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const deleteKhuyenMaiMutation = useDeleteKhuyenMai();
  const [currentPage, setCurrentPage] = useState(1);
  const { keyword, setKeyword } = useSearchStore();

  const itemPerPage = 10;
  const totalPages = Math.ceil(khuyenMai.length / itemPerPage);

  const filtered = khuyenMai.filter((km) => {
    const lowerKeyword = keyword.toLowerCase();
    const matchKeyword =
      km.maKhuyenMai?.toLowerCase().includes(lowerKeyword) ||
      km.tenKhuyenMai.toLowerCase().includes(lowerKeyword);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const startDate = new Date(km.ngayBatDau);

    const matchDate = (!from || startDate >= from) && (!to || startDate <= to);
    return matchKeyword && matchDate;
  });
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) {
      try {
        await deleteKhuyenMaiMutation.mutateAsync(id);
        toast.success("Xóa thành khuyến mãi thành công!");
        refetch();
      } catch {
        toast.error("Lỗi xóa sản phẩm");
      }
    }
  };
  const handleEdit = (data: KhuyenMaiDTO) => {
    setEditing(data);
    setIsModalOpen(true);
  };
  const handleSucces = () => {
    refetch();
    setEditing(null);
    setIsModalOpen(false);
  };
  const handleResetFilter = () => {
    setKeyword("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };
  return (
    <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Quản Lý Khuyến Mãi
        </h1>
      </motion.div>
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
          setIsModalOpen(open);
        }}
        title={editing ? "Chỉnh sửa khuyến mại" : "Thêm khuyến mại "}
      >
        <KhuyenMaiForm
          editing={editing}
          setEditing={setEditing}
          onSucess={handleSucces}
        />
      </Modal>
      <KhuyenMaiFilter
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={setFromDate}
        onChangeTodate={setToDate}
        onResetFilter={handleResetFilter}
      />
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">Danh sách khuyến mại</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-400 px-2"
          >
            <PlusIcon />
            Thêm khuyến mại
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Đang tải khuyến mại</p>
        ) : (
          <>
            <KhuyenMaiTable
              khuyenMai={paginatedData}
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
