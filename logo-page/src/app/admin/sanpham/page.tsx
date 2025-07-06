"use client";

import { ProductData } from "@/lib/sanphamschema";
import SanPhamForm from "./SanPhamForm";
import SanPhamTable from "./SanPhamTable";
import {
  useSanPham,
  useAddSanPham,
  useXoaSanPham,
  useEditSanPham,
} from "@/hooks/useSanPham";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SanPham } from "@/components/types/product.type";
import SanPhamFilter from "./SanPhamFilter";
import { useSearchStore } from "@/context/useSearch.store";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SanPhamPage() {
  const { data: sanPhams = [], isLoading, refetch } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();
  const [activedTabs, setActivetedTabs] = useState<
    "Đang kinh doanh" | "Ngừng kinh doanh" | "Hết hàng"
  >("Đang kinh doanh");
  const [editSanPham, setEditSanPham] = useState<SanPham | null>(null);
  const [formKey, setFormKey] = useState(0);
  const { keyword } = useSearchStore();
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | null>(null);
  const [selectedBoSuuTap, setSelectedBoSuuTap] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addSanPhamMutation = useAddSanPham();
  const deleteSanPhamMutation = useXoaSanPham();
  const editSanPhamMutation = useEditSanPham();
  useEffect(() => {
    console.log("edit id:", editSanPham?.id);
  }, [editSanPham]);

  const handleSubmit = async (data: ProductData, id?: number) => {
    try {
      if (id) {
        await editSanPhamMutation.mutateAsync({ id, data });
        toast.success("Cập nhật thành công!");
        setEditSanPham(null);
      } else {
        await addSanPhamMutation.mutateAsync(data);
        toast.success("Thêm sản phẩm thành công!");
      }
      refetch();
    } catch {
      toast.error("Lỗi xử lý sản phẩm!");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteSanPhamMutation.mutateAsync(id);
        toast.success("Xóa thành công!");
        refetch();
      } catch {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const handleSuccess = () => {
    setEditSanPham(null);
    setFormKey((prev) => prev + 1);
    refetch();
    setIsModalOpen(false);
  };

  return (
    <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Quản Lý Sản Phẩm
        </h1>
      </motion.div>
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditSanPham(null);
          }
          setIsModalOpen(open);
        }}
        title={editSanPham ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        className="max-w-5xl"
      >
        <SanPhamForm
          key={formKey}
          onSubmit={handleSubmit}
          edittingSanPham={editSanPham}
          onSucces={handleSuccess}
          setEditing={setEditSanPham}
        />
      </Modal>
      <div className="space-y-6">
        <SanPhamFilter
          danhMucs={danhMucs}
          boSuuTaps={boSuuTaps}
          selectedDanhMuc={selectedDanhMuc}
          selectedBoSuuTap={selectedBoSuuTap}
          onChangeDanhMuc={setSelectedDanhMuc}
          onChangeBoSuuTap={setSelectedBoSuuTap}
        />
        {isLoading ? (
          <p>Đang tải danh sách sản phẩm...</p>
        ) : (
          <>
            <div className="flex items-center  justify-between">
              <p className="text-2xl font-bold ">Danh sách sản phẩm</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-400 px-2"
              >
                <PlusIcon /> Thêm sản phẩm
              </Button>
            </div>

            <Tabs
              defaultValue="Đang kinh doanh"
              value={activedTabs}
              onValueChange={(value) => {
                setActivetedTabs(
                  value as "Đang kinh doanh" | "Ngừng kinh doanh" | "Hết hàng"
                );
                setCurrentPage(1);
              }}
            >
              <TabsList className="gap-2 border-gray-200 border-1">
                <TabsTrigger value="Đang kinh doanh">
                  <span className="text-green-500">Đang kinh doanh</span>
                </TabsTrigger>
                <TabsTrigger value="Ngừng kinh doanh">
                  <span className="text-yellow-500"> Ngừng kinh doanh</span>
                </TabsTrigger>
                <TabsTrigger value="Hết hàng">
                  <span className="text-red-500"> Hết hàng</span>
                </TabsTrigger>
              </TabsList>

              {/* TabsContent cho từng trạng thái */}
              {["Đang kinh doanh", "Ngừng kinh doanh", "Hết hàng"].map(
                (trangThai) => {
                  const filtered = sanPhams.filter((sp) => {
                    const lowerKeyword = keyword.toLowerCase();
                    const matchKeyword =
                      sp.tenSanPham.toLowerCase().includes(lowerKeyword) ||
                      sp.maSanPham?.toLowerCase().includes(lowerKeyword);
                    const matchDanhMuc =
                      selectedDanhMuc === null ||
                      sp.danhMucId === selectedDanhMuc;
                    const matchBoSuuTap =
                      selectedBoSuuTap === null ||
                      sp.boSuuTapId === selectedBoSuuTap;
                    const matchTrangThai = sp.trangThai === trangThai;
                    return (
                      matchKeyword &&
                      matchDanhMuc &&
                      matchBoSuuTap &&
                      matchTrangThai
                    );
                  });
                  // Pagination
                  const itemPerPage = 10;
                  const totalPages = Math.ceil(filtered.length / itemPerPage);
                  const paginated = filtered.slice(
                    (currentPage - 1) * itemPerPage,
                    currentPage * itemPerPage
                  );

                  return (
                    <TabsContent key={trangThai} value={trangThai}>
                      <SanPhamTable
                        sanPhams={paginated}
                        onDelete={handleDelete}
                        onEdit={(product) => {
                          setEditSanPham({ ...product });
                          setIsModalOpen(true);
                        }}
                      />
                      <div className="flex gap-2 items-center justify-center mt-4">
                        <Button
                          disabled={currentPage === 1}
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                          Trang trước
                        </Button>
                        <span className="font-medium">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                          disabled={currentPage === totalPages}
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                          Trang sau
                        </Button>
                      </div>
                    </TabsContent>
                  );
                }
              )}
            </Tabs>
          </>
        )}
      </div>
    </Card>
  );
}
