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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | "">("");
  const [selectedBoSuuTap, setSelectedBoSuuTap] = useState<number | "">("");

  const [productToEdit, setProductToEdit] = useState<SanPham | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products = [], isLoading, isError } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const { mutate: addSanPham } = useAddSanPham();
  const { mutate: editSanPham } = useEditSanPham();
  const { mutate: deleteSanPham } = useXoaSanPham();

  const handleSubmit = (data: SanPham) => {
    if (productToEdit) {
      editSanPham({ id: data.id, data });
    } else {
      addSanPham(data);
    }
    setProductToEdit(null);
    setShowForm(false);
  };

  const handleOpenForm = () => {
    setProductToEdit(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setProductToEdit(null);
    setShowForm(false);
  };

  // 👉 Lọc dữ liệu tại frontend
  const filteredProducts = products.filter((p) => {
    const matchKeyword = p.tenSanPham?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDanhMuc = selectedDanhMuc === "" || p.danhMucId === selectedDanhMuc;
    const matchBoSuuTap = selectedBoSuuTap === "" || p.boSuuTapId === selectedBoSuuTap;
    return matchKeyword && matchDanhMuc && matchBoSuuTap;
  });

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">QUẢN LÝ SẢN PHẨM</h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f]">
        {/* Thanh tìm kiếm và nút Thêm */}
        <div className="flex justify-between items-center mb-4">
          <Button className="ml-auto shadow-lg flex items-center" onClick={handleOpenForm}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Thanh tìm kiếm */}
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Bộ lọc */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col flex-1">
            <label className="text-white font-semibold mb-1">Danh mục</label>
            <select
              value={selectedDanhMuc}
              onChange={(e) => setSelectedDanhMuc(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-[#191a32] text-white p-2 rounded-lg border border-gray-600"
            >
              <option value="">Tất cả</option>
              {danhMucs.map((dm) => (
                <option key={dm.id} value={dm.id}>
                  {dm.tenDanhMuc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-white font-semibold mb-1">Bộ sưu tập</label>
            <select
              value={selectedBoSuuTap}
              onChange={(e) => setSelectedBoSuuTap(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-[#191a32] text-white p-2 rounded-lg border border-gray-600"
            >
              <option value="">Tất cả</option>
              {boSuuTaps.map((bst) => (
                <option key={bst.id} value={bst.id}>
                  {bst.tenBoSuuTap}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : isError ? (
          <p className="text-red-500 text-center">Lỗi khi tải danh sách sản phẩm</p>
        ) : (
          <LegoProductTable
            products={filteredProducts}
            onEdit={(product) => {
              setProductToEdit(product);
              setShowForm(true);
            }}
            onDelete={(id) => {
              deleteSanPham(id);
              if (productToEdit?.id === id) setProductToEdit(null);
            }}
            getTenDanhMuc={(id) => danhMucs.find((d) => d.id === id)?.tenDanhMuc || "Không rõ"}
            getTenBoSuuTap={(id) => boSuuTaps.find((b) => b.id === id)?.tenBoSuuTap || "Không rõ"}
          />
        )}
      </div>

      {/* Popup Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={handleCloseForm}
        >
          <div
            className="bg-[#191a32] rounded-lg p-8 w-full max-w-4xl relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseForm}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold"
              title="Đóng"
            >
              &times;
            </button>
            <LegoProductForm
              onSubmit={handleSubmit}
              productToEdit={productToEdit}
              onClearEdit={handleCloseForm}
            />
          </div>
        </div>
      )}
    </ToastProvider>
  );
}
