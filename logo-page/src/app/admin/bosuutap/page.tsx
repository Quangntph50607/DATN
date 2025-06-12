'use client';

import { useState } from 'react';
import { BoSuuTap } from '@/components/types/product.type';
import LegoCollectionForm from './LegoCollectionForm';
import LegoCollectionSearch from './LegoCollectionSearch';
import LegoCollectionTable from './LegoCollectionTable';
import { ToastProvider } from '@/components/ui/toast-provider';
import { toast } from 'sonner';
import { useAddBoSuuTap, useBoSuutap, useEditBoSuuTap, useXoaBoSuuTap } from '@/hooks/useBoSutap';

export default function LegoCollectionPage() {
  const { data: collections = [], isLoading } = useBoSuutap();
  const addMutation = useAddBoSuuTap();
  const editMutation = useEditBoSuuTap();
  const deleteMutation = useXoaBoSuuTap();

  const [collectionToEdit, setCollectionToEdit] = useState<BoSuuTap | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSubmit = (data: BoSuuTap) => {
    if (collectionToEdit) {
      // Sửa
      editMutation.mutate(
        { id: collectionToEdit.id, data },
        {
          onSuccess: () => {
            toast.success('Cập nhật thành công!');
            setCollectionToEdit(null);
          },
          onError: () => toast.error('Cập nhật thất bại!'),
        }
      );
    } else {
      // Thêm
      addMutation.mutate(data, {
        onSuccess: () => toast.success('Thêm thành công!'),
        onError: () => toast.error('Thêm thất bại!'),
      });
    }
  };

  const handleEdit = (collection: BoSuuTap) => {
    setCollectionToEdit(collection);
  };

  const handleDelete = (id: number, tenBoSuuTap: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${tenBoSuuTap}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Xóa thành công!'),
        onError: () => toast.error('Xóa thất bại!'),
      });
    }
  };

  const handleClearEdit = () => {
    setCollectionToEdit(null);
  };

  const filteredCollections = collections.filter((c) =>
    c.tenBoSuuTap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.moTa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.namPhatHanh.toString().includes(searchTerm)
  );

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">QUẢN LÝ BỘ SƯU TẬP</h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f] rounded">
        <LegoCollectionForm
          onSubmit={handleSubmit}
          collectionToEdit={collectionToEdit}
          onClearEdit={handleClearEdit}
        />

        <LegoCollectionSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
    </ToastProvider>
  );
}
