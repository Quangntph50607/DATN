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
} from '@/hooks/useBoSutap';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LegoCollectionPage() {
  const { data: collections = [], isLoading } = useBoSuutap();
  const addMutation = useAddBoSuuTap();
  const editMutation = useEditBoSuuTap();
  const deleteMutation = useXoaBoSuuTap();
  const [currentPage] = useState(1);

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
    if (confirm(`Bạn có chắc chắn muốn xóa "${tenBoSuuTap}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Xóa thành công!"),
        onError: () => toast.error("Xóa thất bại!"),
      });
    }
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
  const itemPerPage = 10;
  const totalPages = Math.ceil(filteredCollections.length / itemPerPage);
  const paginatedData = collections.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
      <ToastProvider>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">QUẢN LÝ BỘ SƯU TẬP</h1>
        <div className="min-h-screen py-10 space-y-10 px-6 rounded">
          {/* Nút thêm */}
          <div className="flex justify-between items-center mb-4">
            <Button className="ml-auto shadow-lg flex items-center" onClick={handleOpenForm}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Thêm bộ sưu tập
            </Button>
          </div>

          {/* Tìm kiếm */}
          <LegoCollectionSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* Bảng dữ liệu */}
          {isLoading ? (
            <p className="text-white">Đang tải dữ liệu...</p>
          ) : (
            <LegoCollectionTable
              collections={filteredCollections}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

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
      </ToastProvider>
    </Card>
  );
}
