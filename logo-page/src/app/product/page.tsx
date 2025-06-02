"use client";
import { useSanPham } from "@/hooks/useSanPham";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import React, { useState } from "react";
import SanPhamList from "@/components/layout/(components)/(main)/SanPhamList";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBoSutap } from "@/hooks/boSutap";
import { useSearchStore } from "@/context/useSearch.store";
import { Button } from "@/components/ui/button";

// Định nghĩa khoảng độ tuổi
const ageRanges = [
  { label: "0-12 tháng", min: 0, max: 1 },
  { label: "1-3 tuổi", min: 1, max: 3 },
  { label: "3-6 tuổi", min: 3, max: 6 },
  { label: "6-12 tuổi", min: 6, max: 12 },
  { label: "12 tuổi trở lên", min: 12, max: Infinity },
];

const priceRanges = [
  { label: "Dưới 500k", min: 0, max: 500000 },
  { label: "500k - 1M", min: 500000, max: 1000000 },
  { label: "1M - 2M", min: 1000000, max: 2000000 },
  { label: "Trên 2M", min: 2000000, max: Infinity },
];
export default function AllProductsPage() {
  const { data: products = [] } = useSanPham();
  const { data: categories = [] } = useDanhMuc();
  const { data: bosuutaps = [] } = useBoSutap();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);
  const [selectedGia, setSelectedGia] = useState<string | null>(null);
  const [selectedBoSuuTap, setSelectedBoSutap] = useState<number | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAgeOpen, setIsAgeOpen] = useState(true);
  const [isBoSuuTapOpen, setIsBoSuuTapOpen] = useState(true);
  const [isGiaOpen, setIsGiaOpen] = useState(true);
  const { keyword, setKeyword } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 16;

  // Lọc sản phẩm
  const filteredProducts = products.filter((sp) => {
    // Lọc theo danh mục
    const categoryMatch = selectedCategory
      ? sp.danhMucId === selectedCategory
      : true;

    // Lọc theo độ tuổi
    let ageMatch = true;
    if (selectedAgeRange) {
      const range = ageRanges.find((r) => r.label === selectedAgeRange);
      if (range) {
        const minAge = range.min;
        const maxAge = range.max;
        ageMatch =
          sp.doTuoi >= minAge && (maxAge === Infinity || sp.doTuoi <= maxAge);
      }
    }

    // Lọc theo giá
    let priceMatch = true;
    if (selectedGia) {
      const range = priceRanges.find((r) => r.label === selectedGia);
      if (range) {
        const minPrice = range.min;
        const maxPrice = range.max;
        const productPrice = sp.giaKhuyenMai ?? sp.gia ?? 0;
        priceMatch =
          productPrice >= minPrice &&
          (maxPrice === Infinity || productPrice <= maxPrice);
      }
    }
    // Lọc theo bộ sưu tập
    const collectionMatch = selectedBoSuuTap
      ? sp.boSuuTapId === selectedBoSuuTap
      : true;

    // Lọc theo tìm kiếm
    const searchMatch = keyword
      ? sp.tenSanPham.toLowerCase().includes(keyword.toLowerCase())
      : true;

    return (
      categoryMatch && ageMatch && collectionMatch && searchMatch && priceMatch
    );
  });
  // Phân trang
  const totalPage = Math.ceil(filteredProducts.length / productPerPage);
  const paginatedProdcuts = filteredProducts.slice(
    (currentPage - 1) * productPerPage,
    currentPage * productPerPage
  );
  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPage) {
      setCurrentPage(page);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="bg-white text-black">
        <div className="mb-8 text-center">
          <h1 className="text-3xl mb-2 font-bold">MyKingDom-Thế giới Lego</h1>
          <p className="text-gray-600">Khám phá bộ sưu tập của chúng tôi</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 px-4">
          {/* Sidebar Filter */}
          <div className="lg:w-1/4">
            <div className="bg-yellow-400 p-6 rounded-xl shadow-md border border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  BỘ LỌC
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedAgeRange(null);
                    setSelectedBoSutap(null);
                    setKeyword("");
                  }}
                  className="text-sm text-black hover:underline"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Danh mục */}
              <div className="mb-6">
                <h3
                  className="font-medium text-gray-900 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <span>DANH MỤC</span>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      isCategoryOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </h3>
                {isCategoryOpen && (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    <li>
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          !selectedCategory
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Tất cả sản phẩm
                      </button>
                    </li>
                    {categories.map((cate) => (
                      <li key={cate.id}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cate.id);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === cate.id
                              ? "bg-blue-100 text-blue-600 font-medium"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {cate.tenDanhMuc}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Độ tuổi */}
              <div className="mb-6">
                <h3
                  className="font-medium text-gray-900 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsAgeOpen(!isAgeOpen)}
                >
                  <span>ĐỘ TUỔI</span>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      isAgeOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </h3>
                {isAgeOpen && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ageRanges.map((range) => (
                      <div
                        key={range.label}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="checkbox"
                          className="w-6 h-6"
                          checked={selectedAgeRange === range.label}
                          onChange={() => {
                            setSelectedAgeRange(
                              selectedAgeRange === range.label
                                ? null
                                : range.label
                            );
                          }}
                        />
                        <span>{range.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Bộ lọc giá */}
              <div className="mb-6">
                <h3
                  className="font-medium text-gray-900 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsGiaOpen(!isGiaOpen)}
                >
                  <span>KHOẢNG GIÁ</span>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      isGiaOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </h3>
                {isGiaOpen && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {priceRanges.map((range) => (
                      <div
                        key={range.label}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="checkbox"
                          className="w-6 h-6"
                          checked={selectedGia === range.label}
                          onChange={() => {
                            setSelectedGia(
                              selectedGia === range.label ? null : range.label
                            );
                          }}
                        />
                        <span>{range.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bộ sưu tập */}
              <div className="mb-6">
                <h3
                  className="font-medium text-gray-900 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsBoSuuTapOpen(!isBoSuuTapOpen)}
                >
                  <span>BỘ SƯU TẬP</span>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      isBoSuuTapOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </h3>
                {isBoSuuTapOpen && (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    <li>
                      <button
                        onClick={() => {
                          setSelectedBoSutap(null);
                          setIsBoSuuTapOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          !selectedBoSuuTap
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Tất cả bộ sưu tập
                      </button>
                    </li>
                    {bosuutaps.map((bst) => (
                      <li key={bst.id}>
                        <button
                          onClick={() => {
                            setSelectedBoSutap(bst.id);
                            setIsBoSuuTapOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedBoSuuTap === bst.id
                              ? "bg-blue-100 text-blue-600 font-medium"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {bst.tenBoSuuTap}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            {/* Filter Info */}
            {(selectedCategory || selectedAgeRange || selectedBoSuuTap) && (
              <div className="mb-6 bg-blue-50 px-4 py-3 rounded-lg flex items-center flex-wrap gap-2">
                {selectedCategory && (
                  <span className="text-blue-800">
                    Danh mục:{" "}
                    <strong>
                      {
                        categories.find((c) => c.id === selectedCategory)
                          ?.tenDanhMuc
                      }
                    </strong>
                  </span>
                )}
                {selectedAgeRange && (
                  <span className="text-blue-800">
                    Độ tuổi: <strong>{selectedAgeRange}</strong>
                  </span>
                )}
                {selectedGia && (
                  <span className="text-blue-800">
                    Giá: <strong>{selectedGia}</strong>
                  </span>
                )}
                {selectedBoSuuTap && (
                  <span className="text-blue-800">
                    Bộ sưu tập:{" "}
                    <strong>
                      {
                        bosuutaps.find((bst) => bst.id === selectedBoSuuTap)
                          ?.tenBoSuuTap
                      }
                    </strong>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedAgeRange(null);
                    setSelectedBoSutap(null);
                    setKeyword("");
                  }}
                  className="ml-auto text-sm text-blue-600 hover:underline"
                >
                  [Xóa tất cả]
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-2xl text-center text-gray-600">
                Hiện đang không có sản phẩm nào phù hợp
              </div>
            ) : (
              <>
                <SanPhamList products={paginatedProdcuts} />
                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-200 hover:bg-gray-300"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPage }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPage}
                    className="bg-gray-200 hover:bg-gray-300"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
