'use client';

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoProductForm from "./LegoProductForm";
import LegoProductTable from "./LegoProductTable";
import { useState } from "react";
import SearchInput from "./LegoProductSearch";
import { SanPham } from "@/components/types/product.type";

// Định nghĩa interface SanPhamFormData để đồng bộ với LegoProductForm
interface SanPhamFormData {
  id: number | string;
  tenSanPham: string;
  danhMucId: number | string;
  gia: number | string;
  soLuong: number | string;
  soLuongManhGhep: number | string;
  doTuoi: number | string;
  trangThai: string;
  danhGiaTrungBinh: number | string;
  anhDaiDien: string | null;
  moTa: string;
}

export default function Page() {
  const [products, setProducts] = useState<SanPham[]>([
    {
      id: 1,
      tenSanPham: "LEGO City Police Station",
      maSanPham: "LEGO-CITY-001",
      doTuoi: 8,
      moTa: "Bộ LEGO Trạm cảnh sát thành phố",
      gia: 1499000,
      giaKhuyenMai: null,
      soLuong: 12,
      soLuongManhGhep: 743,
      soLuongTon: 12,
      anhDaiDien: "https://via.placeholder.com/64",
      soLuongVote: 100,
      danhGiaTrungBinh: 4,
      ngayTao:"",
      ngaySua: "",
      danhMucId: 1,
      boSuuTapId: 1,
      khuyenMaiId: null,
      trangThai: "Còn hàng",
      anhSanPhams: []
    },
    {
      id: 2,
      tenSanPham: "LEGO Star Wars X-Wing",
      maSanPham: "LEGO-SW-002",
      doTuoi: 12,
      moTa: "Bộ LEGO Phi thuyền X-Wing",
      gia: 2299000,
      giaKhuyenMai: 1999000,
      soLuong: 5,
      soLuongManhGhep: 937,
      soLuongTon: 5,
      anhDaiDien: "https://via.placeholder.com/64",
      soLuongVote: 200,
      danhGiaTrungBinh: 5,
      ngayTao:"",
      ngaySua: "",
      danhMucId: 2,
      boSuuTapId: 2,
      khuyenMaiId: null,
      trangThai: "Hết hàng",
      anhSanPhams: []
    },
  ]);

  const [productToEdit, setProductToEdit] = useState<SanPham | null>(null);

  // Chuyển đổi SanPhamFormData thành SanPham
  const convertFormDataToSanPham = (data: SanPhamFormData): SanPham => {
    return {
      id: typeof data.id === 'string' && data.id === '' ? 0 : Number(data.id),
      tenSanPham: data.tenSanPham,
      maSanPham: data.id ? `LEGO-${String(data.id).padStart(3, '0')}` : '',
      doTuoi: Number(data.doTuoi) || 0,
      moTa: data.moTa,
      gia: Number(data.gia),
      giaKhuyenMai: null,
      soLuong: Number(data.soLuong),
      soLuongManhGhep: Number(data.soLuongManhGhep),
      soLuongTon: Number(data.soLuong),
      anhDaiDien: data.anhDaiDien,
      soLuongVote: 0,
      danhGiaTrungBinh: Number(data.danhGiaTrungBinh) || 0,
      ngayTao:"",
      ngaySua: "",
      danhMucId: Number(data.danhMucId),
      boSuuTapId: 0,
      khuyenMaiId: null,
      trangThai: data.trangThai || '',
      anhSanPhams: []
    };
  };

  // handleSubmit nhận SanPhamFormData như form gửi lên
  const handleSubmit = (data: SanPhamFormData) => {
    if (productToEdit) {
      // Update sản phẩm đã có
      const updatedProduct = convertFormDataToSanPham(data);
      setProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setProductToEdit(null);
    } else {
      // Thêm sản phẩm mới
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = convertFormDataToSanPham({ ...data, id: newId });
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleClearEdit = () => {
    setProductToEdit(null);
  };

  const handleEdit = (product: SanPham) => {
    setProductToEdit(product);
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if(productToEdit?.id === id) setProductToEdit(null);
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const filteredProducts = products.filter(p =>
    p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.danhMucId.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <ToastProvider>
      <h1 className="text-white text-3xl font-bold mb-6 text-center">QUẢN LÝ SẢN PHẨM</h1>
      <div className="min-h-screen py-10 space-y-10 px-6 bg-[#2b2c4f]">
        <LegoProductForm
          onSubmit={handleSubmit}
          productToEdit={productToEdit}
          onClearEdit={handleClearEdit}
        />

        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <LegoProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </ToastProvider>
  );
}
