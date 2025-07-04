"use client";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import React, { useState } from "react";
import SanPhamList from "@/components/layout/(components)/(main)/SanPhamList";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { useSearchStore } from "@/context/useSearch.store";
import { Button } from "@/components/ui/button";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import SidebarFilter, { getGia, getTuoi } from "./[id]/SidebarFilter";

export default function AllProductsPage() {
  const { data: sanPhamTheoKhuyenMai = [] } = useListKhuyenMaiTheoSanPham();
  const { data: categories = [] } = useDanhMuc();
  const { data: bosuutaps = [] } = useBoSuutap();
  const [selectedBoSuuTap, setSelectedBoSutap] = useState<number | null>(null);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | null>(null);
  const [selectedGia, setSelectedGia] = useState<string | null>(null);
  const [selectedTuoi, setSelectedTuoi] = useState<string | null>(null);

  const { keyword, setKeyword } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  // Lọc sản phẩm
  const filteredProducts = sanPhamTheoKhuyenMai.filter((sp) => {
    // Lọc theo danh mục
    const categoryMatch = selectedDanhMuc
      ? sp.danhMucId === selectedDanhMuc
      : true;

    // Lọc theo bộ sưu tập
    const collectionMatch = selectedBoSuuTap
      ? sp.boSuuTapId === selectedBoSuuTap
      : true;

    // Lọc theo độ tuổi
    let tuoiMatch = true;
    if (selectedTuoi) {
      const range = getTuoi.find((r) => r.label === selectedTuoi);
      if (range) {
        tuoiMatch =
          sp.doTuoi >= range.min &&
          (range.max === Infinity || sp.doTuoi <= range.max);
      }
    }
    // Lọc theo giá
    let giaMatch = true;
    if (selectedGia) {
      const range = getGia.find((r) => r.label === selectedGia);
      if (range) {
        const giaThucTe = sp.giaKhuyenMai ?? sp.gia ?? 0;
        giaMatch =
          giaThucTe >= range.min &&
          (range.max === Infinity || giaThucTe <= range.max);
      }
    }

    // Lọc theo tìm kiếm
    const searchMatch = keyword
      ? sp.tenSanPham.toLowerCase().includes(keyword.toLowerCase())
      : true;

    return (
      categoryMatch && collectionMatch && tuoiMatch && giaMatch && searchMatch
    );
  });
  // Phân trang
  const itemPerPage = 10;
  const totalPage = Math.ceil(filteredProducts.length / itemPerPage);
  const paginatedProdcuts = filteredProducts.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="bg-white text-black">
        <div className="mb-8 text-center">
          <h1 className="text-3xl mb-2 font-bold">MyKingDom-Thế giới Lego</h1>
          <p className="text-gray-600">Khám phá bộ sưu tập của chúng tôi</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 px-4">
          <div className="lg:w-1/4 w-full">
            {/* Sidebar Filter */}
            <SidebarFilter
              selectedBoSuuTap={selectedBoSuuTap}
              selectedDanhMuc={selectedDanhMuc}
              selectedGia={selectedGia}
              selectedTuoi={selectedTuoi}
              setSelectedBoSutap={setSelectedBoSutap}
              setSelectedDanhMuc={setSelectedDanhMuc}
              setSelectedGia={setSelectedGia}
              setSelectedTuoi={setSelectedTuoi}
            />
          </div>
          <div className="lg:w-3/4">
            {/* Filter Info */}
            {(selectedDanhMuc ||
              selectedTuoi ||
              selectedBoSuuTap ||
              selectedGia) && (
              <div className="mb-6 bg-blue-50 px-4 py-3 rounded-lg flex items-center flex-wrap gap-2">
                {selectedDanhMuc && (
                  <span className="text-blue-800">
                    Danh mục:
                    <strong>
                      {
                        categories.find((c) => c.id === selectedDanhMuc)
                          ?.tenDanhMuc
                      }
                    </strong>
                  </span>
                )}
                {selectedBoSuuTap && (
                  <span className="text-blue-800">
                    Bộ sưu tập:
                    <strong>
                      {
                        bosuutaps.find((bst) => bst.id === selectedBoSuuTap)
                          ?.tenBoSuuTap
                      }
                    </strong>
                  </span>
                )}
                {selectedTuoi && (
                  <span className="text-blue-800">
                    Độ tuổi: <strong>{selectedTuoi}</strong>
                  </span>
                )}
                {selectedGia && (
                  <span className="text-blue-800">
                    Giá: <strong>{selectedGia}</strong>
                  </span>
                )}

                <Button
                  onClick={() => {
                    setSelectedDanhMuc(null);
                    setSelectedBoSutap(null);
                    setSelectedGia(null);
                    setSelectedTuoi(null);
                    setKeyword("");
                  }}
                  className="ml-auto text-sm text-blue-600 hover:underline"
                  variant="link"
                >
                  [Xóa tất cả]
                </Button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-2xl text-center text-gray-600">
                Hiện đang không có sản phẩm nào phù hợp
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-medium">Danh sách sản phẩm</h2>
                <SanPhamList ps={paginatedProdcuts} />
              </>
            )}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex gap-2 mt-6 mb-5 items-center justify-center">
          <Button
            disabled={currentPage === 1}
            variant="secondary"
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trang trước
          </Button>
          <span className="font-medium">
            Trang {currentPage} / {totalPage}
          </span>
          <Button
            disabled={currentPage === totalPage}
            variant="secondary"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Trang sau
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
