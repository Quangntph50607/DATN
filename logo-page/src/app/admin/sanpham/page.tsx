"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoProductTable from "./LegoProductTable";
import LegoProductForm from "./LegoProductForm";
import SearchInput from "./LegoProductSearch";
import { useState } from "react";
import {
  useSanPham,
  useAddSanPham,
  useEditSanPham,
  useXoaSanPham,
} from "@/hooks/useSanPham";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { SanPham } from "@/components/types/product.type";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [productToEdit, setProductToEdit] = useState<SanPham | null>(null);

  const { data: products = [], isLoading, isError } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const { mutate: addSanPham } = useAddSanPham();
  const { mutate: editSanPham } = useEditSanPham();
  const { mutate: deleteSanPham } = useXoaSanPham();

  const convertFormDataToSanPham = (data: SanPham): SanPham => ({
    ...data,
    id: Number(data.id),
    doTuoi: Number(data.doTuoi),
    gia: Number(data.gia),
    giaKhuyenMai: data.giaKhuyenMai !== null ? Number(data.giaKhuyenMai) : null,
    soLuong: Number(data.soLuong),
    soLuongManhGhep: String(data.soLuongManhGhep) !== "" ? Number(data.soLuongManhGhep) : 0,
    soLuongTon: Number(data.soLuong),
    danhMucId: Number(data.danhMucId),
    boSuuTapId: Number(data.boSuuTapId),
    khuyenMaiId: data.khuyenMaiId !== null ? Number(data.khuyenMaiId) : null,
    trangThai: data.trangThai || "",
  });

  const handleSubmit = (data: SanPham) => {
    if (productToEdit) {
      editSanPham({ id: data.id, data });
    } else {
      addSanPham(data);
    }
    setProductToEdit(null);
  };  

  const filteredProducts = products.filter((p) =>
    p.tenSanPham?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">QUẢN LÝ SẢN PHẨM</h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f]">
        <LegoProductForm
          onSubmit={handleSubmit}
          productToEdit={productToEdit}
          onClearEdit={() => setProductToEdit(null)}
        />

        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : isError ? (
          <p className="text-red-500 text-center">Lỗi khi tải danh sách sản phẩm</p>
        ) : (
          <LegoProductTable
            products={filteredProducts}
            onEdit={setProductToEdit}
            onDelete={(id) => {
              deleteSanPham(id);
              if (productToEdit?.id === id) setProductToEdit(null);
            }}
            getTenDanhMuc={(id) => danhMucs.find((d) => d.id === id)?.tenDanhMuc || "Không rõ"}
            getTenBoSuuTap={(id) => boSuuTaps.find((b) => b.id === id)?.tenBoSuuTap || "Không rõ"}
          />
        )}
      </div>
    </ToastProvider>
  );
}