"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoProductForm, { SanPhamFormData } from "./LegoProductForm";
import LegoProductTable from "./LegoProductTable";
import { useState } from "react";
import SearchInput from "./LegoProductSearch";

export default function Page() {
  const [products, setProducts] = useState<SanPhamFormData[]>([
    {
      id: 1,
      tenSanPham: "LEGO City Police Station",
      maSanPham: "LEGO-001",
      doTuoi: 8,
      moTa: "Bộ LEGO Trạm cảnh sát thành phố",
      gia: 1499000,
      giaKhuyenMai: null,
      soLuong: 12,
      soLuongManhGhep: 743,
      soLuongTon: 12,
      anhDaiDien: "https://via.placeholder.com/64",
      danhMucId: 1,
      boSuuTapId: 1,
      khuyenMaiId: null,
      trangThai: "Còn hàng",
    },
    {
      id: 2,
      tenSanPham: "LEGO Star Wars X-Wing",
      maSanPham: "LEGO-002",
      doTuoi: 12,
      moTa: "Bộ LEGO Phi thuyền X-Wing",
      gia: 2299000,
      giaKhuyenMai: 1999000,
      soLuong: 5,
      soLuongManhGhep: 937,
      soLuongTon: 5,
      anhDaiDien: "https://via.placeholder.com/64",
      danhMucId: 2,
      boSuuTapId: 2,
      khuyenMaiId: null,
      trangThai: "Hết hàng",
    },
  ]);

  const [productToEdit, setProductToEdit] = useState<SanPhamFormData | null>(
    null
  );

  const convertFormDataToSanPhamFormData = (
    data: SanPhamFormData
  ): SanPhamFormData => {
    return {
      ...data,
      id: Number(data.id),
      doTuoi: Number(data.doTuoi),
      gia: Number(data.gia),
      giaKhuyenMai:
        data.giaKhuyenMai !== null ? Number(data.giaKhuyenMai) : null,
      soLuong: Number(data.soLuong),
      soLuongManhGhep: Number(data.soLuongManhGhep),
      soLuongTon: Number(data.soLuongTon),
      danhMucId: Number(data.danhMucId),
      boSuuTapId: Number(data.boSuuTapId),
      khuyenMaiId: data.khuyenMaiId !== null ? Number(data.khuyenMaiId) : null,
      trangThai: data.trangThai || "",
    };
  };

  const handleSubmit = (data: SanPhamFormData) => {
    const preparedData = convertFormDataToSanPhamFormData(data);

    if (productToEdit) {
      // Cập nhật sản phẩm
      setProducts((prev) =>
        prev.map((p) =>
          Number(p.id) === Number(preparedData.id) ? preparedData : p
        )
      );
      setProductToEdit(null);
    } else {
      // Thêm mới sản phẩm
      const newId =
        products.length > 0
          ? Math.max(...products.map((p) => Number(p.id))) + 1
          : 1;
      const newProduct = {
        ...preparedData,
        id: newId,
        maSanPham: `LEGO-${String(newId).padStart(3, "0")}`,
      };
      setProducts((prev) => [...prev, newProduct]);
    }
  };

  const handleClearEdit = () => {
    setProductToEdit(null);
  };

  const handleEdit = (product: SanPhamFormData) => {
    setProductToEdit(product);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (productToEdit?.id === id) setProductToEdit(null);
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Lọc sản phẩm theo searchTerm
  const filteredProducts = products.filter((p) =>
    p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <LegoProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </ToastProvider>
  );
}
