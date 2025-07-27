"use client";
import React, { useState } from "react";
import KhuyenMaiForm from "./KhuyenMaiForm";
import KhuyenMaiTable from "./KhuyenMaiTable";
import KhuyenMaiDetailModal from "./KhuyenMaiDetailModal";
import { useHistoryKhuyenMai, useKhuyenMai } from "@/hooks/useKhuyenmai";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import { PlusIcon } from "lucide-react";
import { useSearchStore } from "@/context/useSearch.store";
import KhuyenMaiFilter from "./KhuyenMaiFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";

export default function KhuyenMaiPage() {
  const { data: khuyenMai = [], isLoading, refetch } = useKhuyenMai();
  const [editing, setEditing] = useState<KhuyenMaiDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { keyword, setKeyword } = useSearchStore();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [isOpenLog, setIsOpenLog] = useState(false);

  const [activedTabs, setActivetedTabs] = useState<
    "Đang hoạt động" | "Chưa bắt đầu" | "Đã hết hạn"
  >("Đang hoạt động");

  const { data: chiTietData, isLoading: isLoadingDetail } = useHistoryKhuyenMai(
    viewingId ?? 0
  );

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
  const handleEdit = (data: KhuyenMaiDTO) => {
    setEditing(data);
    setIsModalOpen(true);
  };

  const handleView = (id: number) => {
    setViewingId(id);
    setIsDetailModalOpen(true);
  };

  const handleSucces = () => {
    refetch();
    setEditing(null);
    setIsModalOpen(false);
  };

  const handleResetFilter = () => {
    setKeyword("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 bg-clip-text text-white mb-2">
          Quản Lý Khuyến Mãi
        </h1>
      </motion.div>

      {/* Modal thêm/sửa khuyến mãi */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
          setIsModalOpen(open);
        }}
        title={editing ? "Chỉnh sửa khuyến mại" : "Thêm khuyến mại "}
      >
        <KhuyenMaiForm
          editing={editing}
          setEditing={setEditing}
          onSucess={handleSucces}
        />
      </Modal>

      {/* Modal xem chi tiết khuyến mãi */}
      <Modal
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewingId(null);
          }
          setIsDetailModalOpen(open);
        }}
        title="Chi tiết lịch sử khuyến mãi"
        className="max-w-6xl"
      >
        <KhuyenMaiDetailModal
          data={chiTietData || null}
          isLoading={isLoadingDetail}
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
        <LichSuLogTimeline
          bang="khuyenMai"
          title="Lịch sử log của khuyến mại"
        />
        <LichSuLogTimeline
          bang="khuyenMaiSanPham"
          title="Lịch sử log khuyến mại theo sản phẩm "
        />
      </Modal>

      <KhuyenMaiFilter
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={setFromDate}
        onChangeTodate={setToDate}
        onResetFilter={handleResetFilter}
      />
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">Danh sách khuyến mại</h2>
          <div className="flex gap-2">
            <Button onClick={() => setIsOpenLog(true)} variant="destructive">
              <PlusIcon />
              Xem lịch sử
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="px-2">
              <PlusIcon />
              Thêm khuyến mại
            </Button>
          </div>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Đang tải khuyến mại</p>
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
                  <span>Chưa bắt đầu</span>
                </TabsTrigger>
                <TabsTrigger value="Đã hết hạn">
                  <span>Đã hết hạn</span>
                </TabsTrigger>
              </TabsList>
              {/* TabsContent cho trạng thái */}
              {["Đang hoạt động", "Chưa bắt đầu", "Đã hết hạn"].map(
                (trangThai) => {
                  const itemPerPage = 10;
                  const filtered = khuyenMai.filter((km) => {
                    const lowerKeyword = keyword.toLowerCase();
                    const matchKeyword =
                      km.maKhuyenMai?.toLowerCase().includes(lowerKeyword) ||
                      km.tenKhuyenMai.toLowerCase().includes(lowerKeyword);
                    const from = fromDate ? new Date(fromDate) : null;
                    const to = toDate ? new Date(toDate) : null;
                    const startDate = new Date(km.ngayBatDau);

                    const matchDate =
                      (!from || startDate >= from) && (!to || startDate <= to);
                    const matchTrangThai =
                      convertStatus(km.trangThai) === trangThai;
                    return matchKeyword && matchDate && matchTrangThai;
                  });
                  const totalPages = Math.ceil(filtered.length / itemPerPage);
                  const paginatedData = filtered.slice(
                    (currentPage - 1) * itemPerPage,
                    currentPage * itemPerPage
                  );
                  return (
                    <TabsContent key={trangThai} value={trangThai}>
                      <KhuyenMaiTable
                        khuyenMai={paginatedData}
                        onEdit={handleEdit}
                        onView={handleView}
                      />
                      <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                          Trang trước
                        </Button>
                        <span className="text-sm font-medium">
                          Trang {currentPage} / {totalPages}
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
