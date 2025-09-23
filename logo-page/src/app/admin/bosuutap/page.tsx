"use client";

import { useState } from "react";
import { BoSuuTap } from "@/components/types/product.type";
import LegoCollectionForm from "./LegoCollectionForm";
import LegoCollectionSearch from "./LegoCollectionSearch";
import LegoCollectionTable from "./LegoCollectionTable";
import { ToastProvider } from "@/components/ui/toast-provider";
import { toast } from "sonner";
import { motion } from "framer-motion";

import {
  useAddBoSuuTap,
  useBoSuutap,
  useEditBoSuuTap,
  useXoaBoSuuTap,
} from "@/hooks/useBoSutap";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";
import { ConfirmDialog } from "@/shared/ConfirmDialog";

export default function LegoCollectionPage() {
  const { data: collections = [], isLoading } = useBoSuutap();
  const addMutation = useAddBoSuuTap();
  const editMutation = useEditBoSuuTap();
  const deleteMutation = useXoaBoSuuTap();
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenLog, setIsOpenLog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{id: number, name: string} | null>(null);

  const [collectionToEdit, setCollectionToEdit] = useState<BoSuuTap | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (data: BoSuuTap) => {
    if (collectionToEdit) {
      editMutation.mutate(
        { id: collectionToEdit.id, data },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!");
            setCollectionToEdit(null);
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
          setCurrentPage(1);
        },
        onError: () => toast.error("Thêm thất bại!"),
      });
    }
  };

  const handleEdit = (collection: BoSuuTap) => {
    setCollectionToEdit(collection);
    setShowForm(true);
  };

  const handleDelete = (id: number, tenBoSuuTap: string) => {
    setDeleteItem({ id, name: tenBoSuuTap });
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate(deleteItem.id, {
        onSuccess: () => {
          toast.success("Xóa thành công!");
          setShowDeleteDialog(false);
          setDeleteItem(null);
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
          const errorMessage = error?.response?.data?.message || error?.message || "Xóa thất bại!";
          toast.error(errorMessage);
        },
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteItem(null);
  };

  const handleOpenForm = () => {
    setCollectionToEdit(null);
    setShowForm(true);
  };

  const handleClearEdit = () => {
    setCollectionToEdit(null);
    setShowForm(false);
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.tenBoSuuTap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.moTa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.namPhatHanh.toString().includes(searchTerm)
  );
  const sortedCollections = [...filteredCollections].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  const itemPerPage = 10;
  const totalPages = Math.ceil(sortedCollections.length / itemPerPage);
  const paginatedData = sortedCollections.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <ToastProvider>
      <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r  bg-clip-text text-white ">
            Quản Lý Bộ Sưu Tập
          </h1>
        </motion.div>
        {/* Nút thêm */}
        <div className="items-center flex gap-4 ">
          {/* Tìm kiếm */}
          <LegoCollectionSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Button className=" shadow-lg " onClick={handleOpenForm}>
            <PlusIcon />
            Thêm Bộ Sưu Tập
          </Button>
          <Button
            className=" shadow-lg "
            onClick={() => setIsOpenLog(true)}
            variant="destructive"
          >
            <PlusIcon />
            Xem lịch xử
          </Button>
        </div>

        {/* Bảng dữ liệu */}
        {isLoading ? (
          <p className="text-white">Đang tải dữ liệu...</p>
        ) : (
          <>
            <h2 className="text-lg font-bold">Danh sách bộ sưu tập</h2>
            <LegoCollectionTable
              collections={paginatedData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Modal xem lịch sử log */}
            <Modal
              open={isOpenLog}
              onOpenChange={() => setIsOpenLog(false)}
              title="Lịch sử  thay đổi"
              className="max-w-6xl"
              scrollContentOnly
            >
              <LichSuLogTimeline bang="boSuutap" title="Lịch sử user log" />
            </Modal>
          </>
        )}

        {/* Form Popup */}
        {showForm && (
          <div
            className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={handleClearEdit}
          >
            <div
              className="bg-[#191a32] rounded-lg p-8 w-full max-w-3xl relative shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClearEdit}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold"
                title="Đóng"
              >
                &times;
              </button>
              <LegoCollectionForm
                onSubmit={handleSubmit}
                collectionToEdit={collectionToEdit}
                onClearEdit={handleClearEdit}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
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

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Xác nhận xóa"
          description={
            <div>
              <p>Bạn có chắc chắn muốn xóa bộ sưu tập: <span className="font-bold text-red-600">&quot;{deleteItem?.name}&quot;</span></p>
              <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác!
              </p>
            </div>
          }
          confirmText="Xóa"
          cancelText="Hủy"
        />
      </Card>
    </ToastProvider>
  );
}
