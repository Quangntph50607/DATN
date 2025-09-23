"use client";

import { ProductData, ProductDataWithoutFiles } from "@/lib/sanphamschema";
import SanPhamForm from "./SanPhamForm";
import SanPhamTable from "./SanPhamTable";
import {
  useAddSanPham,
  useXoaSanPham,
  useEditSanPham,
  useSanPham,
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
import { ConfirmDialog } from "@/shared/ConfirmDialog";
import { Loader2 } from "lucide-react";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useHangThanhLy } from "@/hooks/useHangThanhLy";
import HangThanhLyTable from "./HangThanhLyTable";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";

export default function SanPhamPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const {
    data: sanPhams = [],
    isLoading,
    refetch,
  } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();
  const { data: xuatXus = [] } = useXuatXu();
  const { data: thuongHieus = [] } = useThuongHieu();
  const [activedTabs, setActivetedTabs] = useState<
    "Đang kinh doanh" | "Ngừng kinh doanh" | "Hết hàng" | "Hàng thanh lý"
  >("Đang kinh doanh");
  const { data: hangThanhLy = [], isLoading: loadingHTL } = useHangThanhLy();
  const [editSanPham, setEditSanPham] = useState<SanPham | null>(null);
  const { keyword, setKeyword } = useSearchStore();
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | null>(null);
  const [selectedBoSuuTap, setSelectedBoSuuTap] = useState<number | null>(null);
  const [selectedXuatXu, setSelectedXuatXu] = useState<number | null>(null);
  const [selectedThuongHieu, setSelectedThuongHieu] = useState<number | null>(
    null
  );
  const [giaMin, setGiaMin] = useState<number | null>(null);
  const [giaMax, setGiaMax] = useState<number | null>(null);
  const [tuoiMin, setTuoiMin] = useState<number | null>(null);
  const [tuoiMax, setTuoiMax] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenLog, setIsOpenLog] = useState(false);
  const addSanPhamMutation = useAddSanPham();
  const deleteSanPhamMutation = useXoaSanPham();
  const editSanPhamMutation = useEditSanPham();
  useEffect(() => {
    console.log("edit id:", editSanPham?.id);
  }, [editSanPham]);

  const handleSubmit = async (
    data: ProductData | ProductDataWithoutFiles,
    id?: number
  ) => {
    try {
      if (id) {
        await editSanPhamMutation.mutateAsync({ id, data });
        toast.success("Cập nhật thành công!");
        setEditSanPham(null);
      } else {
        await addSanPhamMutation.mutateAsync(data);
        toast.success("Thêm sản phẩm thành công!");
        // Sau khi thêm, đưa về trang 1 để thấy sản phẩm mới nhất
        setCurrentPage(1);
      }
      refetch();
    } catch {
      toast.error("Lỗi xử lý sản phẩm!");
    }
  };

  const confirmDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (pendingDeleteId == null) return;
    // if (confirm("Bạn có chắc muốn chuyển trạn thái của sản phẩm này"))
    try {
      await deleteSanPhamMutation.mutateAsync(pendingDeleteId);
      toast.success("Chuyển trạng thái thành công!");
      refetch();
    } catch {
      toast.error("Lỗi khi chuyển trạng thái sản phẩm");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleSuccess = () => {
    // Chỉ đóng modal, không reset formKey để tránh reset form
    setEditSanPham(null);
    // setFormKey((prev) => prev + 1); // Comment lại để không reset form
    refetch();
    setIsModalOpen(false);
  };
  const handleResetFilter = () => {
    setKeyword("");
    setSelectedBoSuuTap(null);
    setSelectedDanhMuc(null);
    setSelectedXuatXu(null);
    setSelectedThuongHieu(null);
    setGiaMin(null);
    setGiaMax(null);
    setTuoiMin(null);
    setTuoiMax(null);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Loading Overlay - hiển thị ở giữa toàn bộ màn hình */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
        </div>
      )}

      <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r  bg-clip-text text-white mb-2">
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
            key={0} // Changed from formKey to 0
            onSubmit={handleSubmit}
            edittingSanPham={editSanPham}
            onSucces={handleSuccess}
            setEditing={setEditSanPham}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </Modal>
        <div className="space-y-6">
          <SanPhamFilter
            danhMucs={danhMucs}
            boSuuTaps={boSuuTaps}
            xuatXus={xuatXus}
            thuongHieus={thuongHieus}
            selectedDanhMuc={selectedDanhMuc}
            selectedBoSuuTap={selectedBoSuuTap}
            selectedThuongHieu={selectedThuongHieu}
            selectedXuatXu={selectedXuatXu}
            giaMin={giaMin}
            giaMax={giaMax}
            tuoiMin={tuoiMin}
            tuoiMax={tuoiMax}
            onChangeDanhMuc={setSelectedDanhMuc}
            onChangeBoSuuTap={setSelectedBoSuuTap}
            onChangeThuongHieu={setSelectedThuongHieu}
            onChangeXuatXu={setSelectedXuatXu}
            onChangeGia={(min, max) => {
              setGiaMin(min);
              setGiaMax(max);
            }}
            onChangeTuoi={(min, max) => {
              setTuoiMin(min);
              setTuoiMax(max);
            }}
            onResetFilter={handleResetFilter}
          />

          {isLoading ? (
            <p>Đang tải danh sách sản phẩm...</p>
          ) : (
            <>
              <div className="flex items-center  justify-between">
                <p className="text-2xl font-bold ">Danh sách sản phẩm</p>
                <div className="flex gap-2">
                  <Button onClick={() => setIsOpenLog(true)} variant="destructive">
                    <PlusIcon /> Xem lịch sử
                  </Button>
                  <Button onClick={() => setIsModalOpen(true)} className=" px-2">
                    <PlusIcon /> Thêm sản phẩm
                  </Button>
                </div>
              </div>

              <Tabs
                defaultValue="Đang kinh doanh"
                value={activedTabs}
                onValueChange={(value) => {
                  setActivetedTabs(
                    value as
                      | "Đang kinh doanh"
                      | "Ngừng kinh doanh"
                      | "Hết hàng"
                      | "Hàng thanh lý"
                  );
                  setCurrentPage(1);
                }}
              >
                <TabsList className="gap-2 border-gray-200 border-1">
                  <TabsTrigger value="Đang kinh doanh">
                    <span className="">Đang kinh doanh</span>
                  </TabsTrigger>
                  <TabsTrigger value="Ngừng kinh doanh">
                    <span className=""> Ngừng kinh doanh</span>
                  </TabsTrigger>
                  <TabsTrigger value="Hết hàng">
                    <span className=""> Hết hàng</span>
                  </TabsTrigger>
                  <TabsTrigger value="Hàng thanh lý">
                    <span className=""> Hàng thanh lý</span>
                  </TabsTrigger>
                </TabsList>

                {/* TabsContent cho từng trạng thái */}
                {["Đang kinh doanh", "Ngừng kinh doanh", "Hết hàng"].map(
                  (trangThai) => {
                    const filtered = sanPhams.filter((sp) => {
                      const lowerKeyword = keyword.toLowerCase();
                      const matchKeyword =
                        sp.tenSanPham.toLowerCase().includes(lowerKeyword) ||
                        sp.maSanPham?.toLowerCase().includes(lowerKeyword) ||
                        sp.doTuoi.toString().includes(lowerKeyword);
                      const matchDanhMuc =
                        selectedDanhMuc === null ||
                        sp.danhMucId === selectedDanhMuc;
                      const matchBoSuuTap =
                        selectedBoSuuTap === null ||
                        sp.boSuuTapId === selectedBoSuuTap;
                      const matchTrangThai = sp.trangThai === trangThai;
                      const matchThuongHieu =
                        selectedThuongHieu === null ||
                        sp.thuongHieuId === selectedThuongHieu;
                      const matchXuatXu =
                        selectedXuatXu === null ||
                        sp.xuatXuId === selectedXuatXu;
                      const matchGia =
                        (giaMin === null || sp.gia >= giaMin) &&
                        (giaMax === null || sp.gia <= giaMax);
                      const matchTuoi =
                        (tuoiMin === null || sp.doTuoi >= tuoiMin) &&
                        (tuoiMax === null || sp.doTuoi <= tuoiMax);

                      return (
                        matchKeyword &&
                        matchDanhMuc &&
                        matchBoSuuTap &&
                        matchTrangThai &&
                        matchThuongHieu &&
                        matchXuatXu &&
                        matchGia &&
                        matchTuoi
                      );
                    });
                    // Pagination
                    // Sắp xếp mới nhất trước khi phân trang
                    const sorted = [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
                    const itemPerPage = 10;
                    const totalPages = Math.ceil(sorted.length / itemPerPage);
                    const paginated = sorted.slice(
                      (currentPage - 1) * itemPerPage,
                      currentPage * itemPerPage
                    );

                    return (
                      <TabsContent key={trangThai} value={trangThai}>
                        <SanPhamTable
                          sanPhams={paginated}
                          onDelete={(id) => confirmDelete(id)}
                          onEdit={(product) => {
                            // Convert product to SanPham type with default values
                            const sanPham: SanPham = {
                              ...product,
                              xuatXuId: product.xuatXuId ?? 0,
                              thuongHieuId: product.thuongHieuId ?? 0,
                            };
                            setEditSanPham(sanPham);
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
                <TabsContent value="Hàng thanh lý">
                  {loadingHTL ? (
                    <p>Đang tải hàng thanh lý...</p>
                  ) : (
                    <HangThanhLyTable items={hangThanhLy} />
                  )}
                </TabsContent>
                <ConfirmDialog
                  open={confirmOpen}
                  onConfirm={handleDelete}
                  onCancel={() => {
                    setConfirmOpen(false);
                    setPendingDeleteId(null);
                  }}
                  title="Xác nhận chuyển trạng thái"
                  description="Bạn có chắc muốn thay đổi trạng thái sản phẩm này?"
                />
              </Tabs>
              {/* Modal xem lịch sử log */}
              <Modal
                open={isOpenLog}
                onOpenChange={() => setIsOpenLog(false)}
                title="Lịch sử  thay đổi"
                className="max-w-6xl"
                scrollContentOnly
              >
                <LichSuLogTimeline bang="sanPham" title="Lịch sử user log" />
              </Modal>
            </>
          )}
        </div>
      </Card>
    </>
  );
}
