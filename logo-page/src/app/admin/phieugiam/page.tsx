"use client";
import React, { useRef, useState } from "react";
import PhieuGiamGia from "./PhieuGiamGiaForm";
import PhieuGiamTable from "./PhieuGiamTable";
import { useGetPhieuGiam, useHistoryPhieuGiamGia } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia as PhieuGiamGiaType } from "@/components/types/phieugiam.type";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import { useSearchStore } from "@/context/useSearch.store";
import PhieuGiamFilter from "./PhieuGiamFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhieuGiamGiaModal from "./PhieuGiamGiaModal";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editing, setEditing] = useState<PhieuGiamGiaType | null>(null);
  const { data: getListPhieuGiam = [], isLoading, refetch } = useGetPhieuGiam();
  const { keyword, setKeyword } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const itemPerPage = 10;
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [isOpenLog, setIsOpenLog] = useState(false);
  const [activedTabs, setActivetedTabs] = useState<
    "Đang hoạt động" | "Chưa bắt đầu" | "Đã hết hạn"
  >("Đang hoạt động");

  // Bộ lọc thêm
  const [selectedLoaiPhieuGiam, setSelectedLoaiPhieuGiam] = useState<
    "" | "theo_phan_tram" | "theo_so_tien"
  >("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { data: chitietPhieuGiamGia, isLoading: isLoadingDetail } =
    useHistoryPhieuGiamGia(viewingId ?? 0);
  const convertStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Chưa bắt đầu";
      case "expired":
        return "Đã hết hạn";
      default:
        return "Không xác định";
    }
  };
  // Hàm đặt lại bộ lọc
  const handleResetFilter = () => {
    setKeyword("");
    setSelectedLoaiPhieuGiam("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  function handleView(id: number) {
    setViewingId(id);
    setIsDetailModalOpen(true);
  }
  const handleEdit = (data: PhieuGiamGiaType) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setEditing(null);
    setIsModalOpen(false);
  };

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-white mb-2">
          Quản Lý Phiếu Giảm Giá
        </h1>
      </motion.div>

      {/* Modal form */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
          setIsModalOpen(open);
        }}
        title={editing ? "Chỉnh sửa phiếu giảm giá" : "Thêm phiếu giảm giá"}
      >
        <PhieuGiamGia
          editing={editing}
          setEditing={setEditing}
          onSucess={handleSuccess}
        />
      </Modal>
      {/* Modal xem lịch sử log */}
      <Modal
        open={isOpenLog}
        onOpenChange={() => setIsOpenLog(false)}
        title="Lịch sử user thay đổi"
        className="max-w-6xl"
        scrollContentOnly
      >
        <LichSuLogTimeline bang="phieuGiamGia" title="Lịch sử user log" />
      </Modal>
      {/* Modal xem chi tiết phiếu giảm */}
      <Modal
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewingId(null);
          }
          setIsDetailModalOpen(open);
        }}
        title="Chi tiết lịch sử phiếu giảm giá"
        className="max-w-6xl"
      >
        <PhieuGiamGiaModal
          data={chitietPhieuGiamGia || null}
          isLoading={isLoadingDetail}
        />
      </Modal>
      {/* Bộ lọc */}
      <PhieuGiamFilter
        selectedLoaiPhieuGiam={selectedLoaiPhieuGiam}
        onChangeLoaiPhieuGiam={setSelectedLoaiPhieuGiam}
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={setFromDate}
        onChangeToDate={setToDate}
        onResetFilter={handleResetFilter}
      />

      {/* DANH SÁCH PHIẾU GIẢM */}
      <div ref={tableRef} className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">Danh sách phiếu giảm</h2>
          <div className="flex gap-2">
            <Button onClick={() => setIsOpenLog(true)} variant="destructive">
              <PlusIcon />
              Xem lịch sử
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="px-2">
              <PlusIcon />
              Thêm phiếu giảm giá
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Đang tải danh sách...</p>
        ) : (
          <>
            <Tabs
              defaultValue="Đang hoạt động"
              value={activedTabs}
              onValueChange={(value) => {
                setActivetedTabs(
                  value as "Đang hoạt động" | "Chưa bắt đầu" | "Đã hết hạn"
                );
                setCurrentPage(1);
              }}
            >
              <TabsList className="gap-2 border-gray-200 border-1">
                <TabsTrigger value="Đang hoạt động">
                  <span>Đang hoạt động</span>
                </TabsTrigger>
                <TabsTrigger value="Chưa bắt đầu">
                  <span>Chưa bắt đầu </span>
                </TabsTrigger>
                <TabsTrigger value="Đã hết hạn">
                  <span>Đã hết hạn</span>
                </TabsTrigger>
              </TabsList>
              {["Đang hoạt động", "Chưa bắt đầu", "Đã hết hạn"].map(
                (trangThai) => {
                  const filtered = getListPhieuGiam.filter((item) => {
                    const lowerKeyword = keyword.toLowerCase();
                    const matchKeyword =
                      item.tenPhieu.toLowerCase().includes(lowerKeyword) ||
                      item.maPhieu?.toLowerCase().includes(lowerKeyword) ||
                      item.soLuong.toString().includes(lowerKeyword);

                    const matchLoai =
                      selectedLoaiPhieuGiam === "" ||
                      item.loaiPhieuGiam === selectedLoaiPhieuGiam;
                    const from = fromDate ? new Date(fromDate) : null;
                    const to = toDate ? new Date(toDate) : null;
                    const startDate = new Date(item.ngayBatDau);
                    const matchDate =
                      (!from || startDate >= from) && (!to || startDate <= to);

                    const matchTrangThai =
                      convertStatus(item.trangThai ?? "") === trangThai;
                    return (
                      matchKeyword && matchLoai && matchDate && matchTrangThai
                    );
                  });

                  // Phân trang
                  const totalPages = Math.ceil(filtered.length / itemPerPage);
                  const paginatedData = filtered.slice(
                    (currentPage - 1) * itemPerPage,
                    currentPage * itemPerPage
                  );
                  return (
                    <TabsContent key={trangThai} value={trangThai}>
                      <PhieuGiamTable
                        phieuGiamGias={paginatedData}
                        onView={handleView}
                        onEdit={handleEdit}
                      />
                      <div className="flex gap-2 justify-center items-center mt-4">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                          Trang trước
                        </Button>
                        <span className="text-sm font-medium">
                          Trang {currentPage} / {Math.max(totalPages, 1)}
                        </span>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages}
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
