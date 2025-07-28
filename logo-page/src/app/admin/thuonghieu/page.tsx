"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import ThuongHieuSearch from "./ThuongHieuSearch";
import ThuongHieuTable from "./ThuongHieuTable";
import { useState } from "react";
import { ThuongHieu } from "@/components/types/product.type";
import {
  useThuongHieu,
  useAddThuongHieu,
  useEditThuongHieu,
  useXoaThuongHieu,
} from "@/hooks/useThuongHieu";
import { ThuongHieuForm } from "./ThuongHieuForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";

export default function ThuongHieuPage() {
  const { data: thuongHieus = [], isLoading } = useThuongHieu();
  const [thuongHieuToEdit, setThuongHieuToEdit] = useState<ThuongHieu | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenLog, setIsOpenLog] = useState(false);
  const addMutation = useAddThuongHieu();
  const editMutation = useEditThuongHieu();
  const deleteMutation = useXoaThuongHieu();

  const handleSubmit = (data: { ten: string; moTa?: string }) => {
    if (thuongHieuToEdit) {
      editMutation.mutate(
        { id: thuongHieuToEdit.id, data },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!");
            setThuongHieuToEdit(null);
            setShowForm(false);
          },
          onError: () => toast.error("Cập nhật thất bại!"),
        }
      );
    } else {
      addMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Thêm thành công!");
          setShowForm(false);
        },
        onError: () => toast.error("Thêm thất bại!"),
      });
    }
  };

  const handleEdit = (thuongHieu: ThuongHieu) => {
    setThuongHieuToEdit(thuongHieu);
    setShowForm(true);
  };

  const handleDelete = (id: number, ten: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${ten}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Xóa thành công!"),
        onError: () => toast.error("Xóa thất bại!"),
      });
    }
  };

  const handleClearEdit = () => {
    setThuongHieuToEdit(null);
    setShowForm(false);
  };

  const handleOpenForm = () => {
    setThuongHieuToEdit(null);
    setShowForm(true);
  };

  const filteredThuongHieus = thuongHieus.filter(
    (th) =>
      th.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (th.moTa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Phân trang
  const itemPerPage = 10;
  const totalPages = Math.ceil(filteredThuongHieus.length / itemPerPage);
  const paginatedData = filteredThuongHieus.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <ToastProvider>
      <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-white">
            Quản Lý Thương Hiệu
          </h1>
        </motion.div>

        {/* Nút thêm thương hiệu */}
        <div className="items-center flex gap-4">
          <ThuongHieuSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <div className="gap-3 flex">
            <Button className="shadow-lg" onClick={handleOpenForm}>
              <PlusIcon />
              Thêm thương hiệu
            </Button>
            <Button
              className="shadow-lg"
              onClick={() => setIsOpenLog(true)}
              variant="destructive"
            >
              <PlusIcon />
              Xem lịch sử
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-white">Đang tải thương hiệu...</p>
        ) : (
          <>
            <h2 className="text-lg font-bold">Danh sách thương hiệu</h2>
            <ThuongHieuTable
              thuongHieus={paginatedData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {/* Modal xem chi lich su log */}
            <Modal
              open={isOpenLog}
              onOpenChange={() => setIsOpenLog(false)}
              title="Lịch sử user thay đổi"
              className="max-w-6xl"
              scrollContentOnly
            >
              <LichSuLogTimeline
                bang="thuongHieu"
                title="Lịch sử log của thương hiệu"
              />
            </Modal>
          </>
        )}

        {/* Form popup */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={handleClearEdit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#191a32] rounded-lg p-8 w-full max-w-3xl relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClearEdit}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold transition-colors"
                title="Đóng"
              >
                &times;
              </motion.button>
              <ThuongHieuForm
                onSubmit={handleSubmit}
                thuongHieuToEdit={thuongHieuToEdit}
                onClearEdit={handleClearEdit}
              />
            </motion.div>
          </motion.div>
        )}

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
    </ToastProvider>
  );
}
