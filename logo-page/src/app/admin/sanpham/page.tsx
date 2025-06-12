"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoProductTable from "./LegoProductTable";
import { useState } from "react";
import SearchInput from "./LegoProductSearch";
import { SanPham } from "@/components/types/product.type";
import LegoProductForm from "./LegoProductForm";
import {
  useSanPham,
  useAddSanPham,
  useEditSanPham,
  useXoaSanPham,
} from "@/hooks/useSanPham";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [productToEdit, setProductToEdit] = useState<SanPham | null>(null);

  const { data: products = [], isLoading, isError } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const { mutate: addSanPham } = useAddSanPham();
  const { mutate: editSanPham } = useEditSanPham();
  const { mutate: deleteSanPham } = useXoaSanPham();

  const convertFormDataToSanPham = (data: SanPham): SanPham => {
    return {
      ...data,
      id: Number(data.id),
      doTuoi: Number(data.doTuoi),
      gia: Number(data.gia),
      giaKhuyenMai: data.giaKhuyenMai !== null ? Number(data.giaKhuyenMai) : null,
      soLuong: Number(data.soLuong),
      soLuongManhGhep: Number(data.soLuongManhGhep),
      soLuongTon: Number(data.soLuongTon),
      danhMucId: Number(data.danhMucId),
      boSuuTapId: Number(data.boSuuTapId),
      khuyenMaiId: data.khuyenMaiId !== null ? Number(data.khuyenMaiId) : null,
      trangThai: data.trangThai || "",
    };
  };

  const handleSubmit = (data: SanPham) => {
    const preparedData = convertFormDataToSanPham(data);
    if (productToEdit) {
      editSanPham({ id: preparedData.id, data: preparedData });
      setProductToEdit(null);
    } else {
      addSanPham(preparedData);
    }
  };

  const handleClearEdit = () => {
    setProductToEdit(null);
  };

  const handleEdit = (product: SanPham) => {
    setProductToEdit(product);
  };

  const handleDelete = (id: number) => {
    deleteSanPham(id);
    if (productToEdit?.id === id) setProductToEdit(null);
  };

  const filteredProducts = products.filter((p) =>
    (p.tenSanPham || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Thêm hàm lấy tên danh mục và bộ sưu tập
  const getTenDanhMuc = (id: number) => {
    const found = danhMucs.find((d) => d.id === id);
    return found ? found.tenDanhMuc : "Không rõ";
  };

  const getTenBoSuuTap = (id: number) => {
    const found = boSuuTaps.find((b) => b.id === id);
    return found ? found.tenBoSuuTap : "Không rõ";
  };

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">
        QUẢN LÝ SẢN PHẨM
      </h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f]">
        <LegoProductForm
          onSubmit={handleSubmit}
          productToEdit={productToEdit}
          onClearEdit={handleClearEdit}
        />

        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : isError ? (
          <p className="text-red-500 text-center">Lỗi khi tải danh sách sản phẩm</p>
        ) : (
          <LegoProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getTenDanhMuc={getTenDanhMuc}
            getTenBoSuuTap={getTenBoSuuTap}
          />
        )}
      </div>
    </ToastProvider>
  );
}
