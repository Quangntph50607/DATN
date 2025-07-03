"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoCategorySearch from "./LegoCategorySearch";
import LegoCategoryTable from "./LegoCategoryTable";
import { useState } from "react";
import { DanhMuc } from "@/components/types/product.type";
import {
  useDanhMuc,
  useAddSDanhMuc,
  useEditDanhMuc,
  useXoaDanhMuc,
} from "@/hooks/useDanhMuc";
import { LegoCategoryForm } from "./LegoCategoryForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function LegoCategoryPage() {
  const [categoryToEdit, setCategoryToEdit] = useState<DanhMuc | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [], isLoading } = useDanhMuc();
  const addMutation = useAddSDanhMuc();
  const editMutation = useEditDanhMuc();
  const deleteMutation = useXoaDanhMuc();
  const handleSubmit = (data: DanhMuc) => {
    if (categoryToEdit) {
      editMutation.mutate(
        { id: categoryToEdit.id, data },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!");
            setCategoryToEdit(null);
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

  const handleEdit = (category: DanhMuc) => {
    setCategoryToEdit(category);
    setShowForm(true);
  };

  const handleDelete = (id: number, tenDanhMuc: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${tenDanhMuc}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Xóa thành công!"),
        onError: () => toast.error("Xóa thất bại!"),
      });
    }
  };

  const handleClearEdit = () => {
    setCategoryToEdit(null);
    setShowForm(false);
  };

  const handleOpenForm = () => {
    setCategoryToEdit(null);
    setShowForm(true);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.moTa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
      <ToastProvider>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
          QUẢN LÝ DANH MỤC
        </h1>
        <div className="min-h-screen py-10 space-y-10 px-6">
          {/* Nút thêm danh mục */}
          <div className="flex justify-between items-center mb-4">
            <Button
              className="ml-auto shadow-lg flex items-center"
              onClick={handleOpenForm}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Thêm danh mục
            </Button>
          </div>

          <LegoCategorySearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {isLoading ? (
            <p className="text-white">Đang tải danh mục...</p>
          ) : (
            <LegoCategoryTable
              categories={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Form popup */}
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
              <LegoCategoryForm
                onSubmit={handleSubmit}
                categoryToEdit={categoryToEdit}
                onClearEdit={handleClearEdit}
              />
            </div>
          </div>
        )}
      </ToastProvider>
    </Card>
  );
}
