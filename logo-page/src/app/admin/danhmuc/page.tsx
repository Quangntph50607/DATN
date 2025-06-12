'use client';

import { ToastProvider } from '@/components/ui/toast-provider';
import LegoCategorySearch from './LegoCategorySearch';
import LegoCategoryTable from './LegoCategoryTable';
import { useState } from 'react';
import { DanhMuc } from '@/components/types/product.type';
import {
  useDanhMuc,
  useAddSDanhMuc,
  useEditDanhMuc,
  useXoaDanhMuc,
} from '@/hooks/useDanhMuc';
import { LegoCategoryForm } from './LegoCategoryForm';

export default function LegoCategoryPage() {
  const [categoryToEdit, setCategoryToEdit] = useState<DanhMuc | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: categories = [], isLoading } = useDanhMuc();
  const addMutation = useAddSDanhMuc();
  const editMutation = useEditDanhMuc();
  const deleteMutation = useXoaDanhMuc();

  const handleSubmit = (data: DanhMuc) => {
    if (categoryToEdit) {
      editMutation.mutate({ id: categoryToEdit.id, data });
      setCategoryToEdit(null);
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (category: DanhMuc) => {
    setCategoryToEdit(category);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    if (categoryToEdit?.id === id) setCategoryToEdit(null);
  };

  const handleClearEdit = () => setCategoryToEdit(null);

  const filteredCategories = categories.filter((cat) =>
    cat.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.moTa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">QUẢN LÝ DANH MỤC</h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f]">
        <LegoCategoryForm
          onSubmit={handleSubmit}
          categoryToEdit={categoryToEdit}
          onClearEdit={handleClearEdit}
        />

        <LegoCategorySearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
    </ToastProvider>
  );
}
