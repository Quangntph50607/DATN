"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Repeat2 } from "lucide-react";
import {
  TrangThaiHoaDon,
  PaymentMethods,
  HoaDonDTO,
} from "@/components/types/hoaDon-types";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";

import { getCurrentUserId, HoaDonService } from "@/services/hoaDonService";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ConfirmDialog";

const loaiHDOptions = [
  { value: "all", label: "Tất cả" },
  { value: "1", label: "Tại quầy" },
  { value: "2", label: "Online" },
];

interface HoaDonListProps {
  data: { content: HoaDonDTO[]; totalPages: number } | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleViewDetail: (id: number) => void;
  handleStatusChange: (id: number, current: string, next: string) => void;
  PAGE_SIZE: number;
  isValidTrangThaiTransition: (current: string, next: string) => boolean;
  onReload: () => void;
}

function HoaDonTable({
  data,
  page,
  setPage,
  handleViewDetail,

  isValidTrangThaiTransition,
  PAGE_SIZE,
  onReload,
}: HoaDonListProps) {
  const [filterLoaiHD, setFilterLoaiHD] = useState<"all" | 1 | 2>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    ids: number[];
    current: string | null;
    next: string | null;
  } | null>(null);

  const filteredData = useMemo(() => {
    return filterLoaiHD === "all"
      ? data?.content || []
      : data?.content.filter((hd) => hd.loaiHD === filterLoaiHD) || [];
  }, [data, filterLoaiHD]);

  const getLoaiHDLabel = (loaiHD: number | undefined) => {
    if (loaiHD === 1) return "Tại quầy";
    if (loaiHD === 2) return "Online";
    return "Không rõ";
  };

  const onChuyenTrangThaiClick = (ids: number | number[], next: string) => {
    const hoaDonIds = Array.isArray(ids) ? ids : [ids];
    const selectedHds = data?.content.filter((hd) => hoaDonIds.includes(hd.id));
    const currentStatus = selectedHds?.every(
      (hd) => hd.trangThai === selectedHds[0].trangThai
    )
      ? selectedHds[0].trangThai
      : null;

    setPendingStatus({ ids: hoaDonIds, current: currentStatus, next });
    setDialogOpen(true);
  };

  const onConfirmChange = async () => {
    if (pendingStatus && pendingStatus.next) {
      try {
        const idNV = await getCurrentUserId();
        if (idNV === null) {
          toast.error(
            "Không tìm thấy ID nhân viên hiện tại. Vui lòng đăng nhập lại."
          );
          return;
        }

        const res = await HoaDonService.updateTrangThai(
          pendingStatus.ids,
          pendingStatus.next
        );

        if (res.thanhCong.length > 0) {
          toast.success("Cập nhật trạng thái thành công!");
        }

        if (res.loi?.length > 0) {
          toast.error(res.loi.join(", "));
        }
      } catch (error: any) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        toast.error(`Lỗi cập nhật trạng thái: ${error.message}`);
      } finally {
        setDialogOpen(false);
        setPendingStatus(null);
        onReload();
      }
    }
  };

  return (
    <>
      {/* Dialog xác nhận */}
      <ConfirmDialog
        open={dialogOpen}
        onConfirm={onConfirmChange}
        onCancel={() => setDialogOpen(false)}
        title="Xác nhận chuyển trạng thái"
        description={`Bạn có muốn chắc muốn chuyển trạng thái cho ${pendingStatus?.ids.length} Hóa Đơn sang  '${pendingStatus?.next}'`}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      {/* Tabs lọc */}
      <div className="flex justify-between items-center mb-6">
        <Tabs
          value={filterLoaiHD.toString()}
          onValueChange={(val) => {
            const parsed = val === "all" ? "all" : (parseInt(val) as 1 | 2);
            setFilterLoaiHD(parsed);
          }}
        >
          <TabsList className="bg-[#181e29] border border-blue-400 text-white rounded-xl shadow-md">
            {loaiHDOptions.map((opt) => (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-white"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Bảng */}
      <div className="border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
        <Table>
          <TableHeader className="bg-blue-500">
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Mã Hóa Đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh Toán</TableHead>
              <TableHead>Loại HĐ</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((hd, index) => (
              <TableRow key={hd.id}>
                <TableCell className="text-white">
                  {page * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="font-semibold">
                  {hd.maHD || "N/A"}
                </TableCell>
                <TableCell className="text-white">
                  {hd.tenNguoiNhan || hd.ten || hd.user?.ten || "Khách lẻ"}
                </TableCell>
                <TableCell className="text-white">
                  {hd.sdt || hd.sdt1 || hd.user?.sdt || "N/A"}
                </TableCell>
                <TableCell className="text-green-400 font-medium">
                  {hd.tongTien.toLocaleString("vi-VN")}₫
                </TableCell>
                <TableCell className="text-white">
                  {formatDateFlexible(hd.ngayTao)}
                </TableCell>
                <TableCell className="text-white">{hd.trangThai}</TableCell>
                <TableCell className="text-white">
                  {hd.phuongThucThanhToan
                    ? PaymentMethods[
                        hd.phuongThucThanhToan as keyof typeof PaymentMethods
                      ]
                    : "N/A"}
                </TableCell>
                <TableCell className="text-white">
                  {getLoaiHDLabel(hd.loaiHD)}
                </TableCell>
                <TableCell className="flex gap-2">
                  {Object.values(TrangThaiHoaDon)
                    .filter(
                      (status) =>
                        status !== hd.trangThai &&
                        isValidTrangThaiTransition(hd.trangThai, status)
                    )
                    .map((status) => (
                      <Button
                        key={status}
                        size="icon"
                        variant="outline"
                        className="border-blue-400 text-blue-400"
                        onClick={() => onChuyenTrangThaiClick(hd.id, status)}
                      >
                        <Repeat2 className="w-4 h-4" />
                      </Button>
                    ))}
                  {Object.values(TrangThaiHoaDon).filter(
                    (status) =>
                      status !== hd.trangThai &&
                      isValidTrangThaiTransition(hd.trangThai, status)
                  ).length === 0 && (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleViewDetail(hd.id)}
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5 text-blue-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!data || filteredData.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-gray-400 py-8"
                >
                  Không có dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-4 p-2 rounded-lg">
        <Button
          variant="outline"
          className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550]"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Trang trước
        </Button>
        <span className="text-sm text-gray-400 mx-4">
          Trang <strong>{page + 1}</strong> / {data?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550]"
          onClick={() =>
            setPage((prev) =>
              data && prev < data.totalPages - 1 ? prev + 1 : prev
            )
          }
          disabled={!data || page >= data.totalPages - 1}
        >
          Trang sau
        </Button>
      </div>
    </>
  );
}

export default HoaDonTable;
