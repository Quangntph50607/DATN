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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Repeat2, XCircle } from "lucide-react";
import {
  TrangThaiHoaDon,
  PaymentMethods,
  HoaDonDTO,
} from "@/components/types/hoaDon-types";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { getCurrentUserId, HoaDonService } from "@/services/hoaDonService";
import { toast } from "sonner";





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
  handleStatusChange,
  isValidTrangThaiTransition,
  PAGE_SIZE,
  onReload,
}: HoaDonListProps) {
  const [filterLoaiHD, setFilterLoaiHD] = useState<"all" | 1 | 2>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    id: number;
    current: string;
    next: string;
  } | null>(null);

  // ✅ State chọn nhiều
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (filteredData.length === selectedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((hd) => hd.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const filteredData = useMemo(() => {
    return filterLoaiHD === "all"
      ? data?.content || []
      : data?.content.filter((hd) => hd.loaiHD === filterLoaiHD) || [];
  }, [data, filterLoaiHD]);
  const isCheckedAll =
    filteredData.length > 0 && selectedIds.length === filteredData.length;



  const getLoaiHDLabel = (loaiHD: number | undefined) => {
    if (loaiHD === 1) return "Tại quầy";
    if (loaiHD === 2) return "Online";
    return "Không rõ";
  };

  const onChuyenTrangThaiClick = (hd: HoaDonDTO, next: string) => {
    setPendingStatus({ id: hd.id, current: hd.trangThai, next });
    setDialogOpen(true);
  };

  // const onConfirmChange = () => {
  //   if (pendingStatus) {
  //     handleStatusChange(
  //       pendingStatus.id,
  //       pendingStatus.current,
  //       pendingStatus.next
  //     );
  //     setDialogOpen(false);
  //     setPendingStatus(null);
  //   }
  // };

  const getNextTrangThaiForBatch = (): string | null => {
    if (selectedIds.length === 0 || !data) return null;

    const selectedHds = data.content.filter((hd) => selectedIds.includes(hd.id));
    const allSameStatus = selectedHds.every(
      (hd) => hd.trangThai === selectedHds[0].trangThai
    );

    if (!allSameStatus) return null; // Chỉ cho phép khi tất cả cùng trạng thái

    const currentStatus = selectedHds[0].trangThai;
    let next: string | null = null;

    switch (currentStatus) {
      case TrangThaiHoaDon.PENDING: // Đang xử lý
        next = TrangThaiHoaDon.PROCESSING; // Đã xác nhận
        break;
      case TrangThaiHoaDon.PROCESSING: // Đã xác nhận
        next = TrangThaiHoaDon.PACKING; // Đang đóng gói
        break;
      case TrangThaiHoaDon.PACKING: // Đang đóng gói
        next = TrangThaiHoaDon.SHIPPED; // Đang vận chuyển
        break;
      case TrangThaiHoaDon.SHIPPED: // Đang vận chuyển
        next = TrangThaiHoaDon.DELIVERED; // Đã giao
        break;
      case TrangThaiHoaDon.DELIVERED: // Đã giao
        next = TrangThaiHoaDon.COMPLETED; // Hoàn tất
        break;
      // case TrangThaiHoaDon.RETURN: // Hoàn hàng
      //   next = TrangThaiHoaDon.COMPLETED; // Hoàn tất sau khi hoàn hàng
      //   break;
      default:
        next = null;
    }

    return next;
  };


  const onConfirmChange = async () => {
    if (pendingStatus) {
      try {
        if (pendingStatus.id === -1) {
          const idNV = await getCurrentUserId();
          if (idNV === null) {
            toast.error("Không tìm thấy ID nhân viên hiện tại. Vui lòng đăng nhập lại.");
            return;
          }

          const dto = {
            hoaDonIds: selectedIds,
            trangThai: pendingStatus.next,
            idNV: idNV,
          };
          const res = await HoaDonService.updateTrangThaiNhieuHoaDon(dto);
          toast.error(`Cập nhật thành công ${res.thanhCong.length} hóa đơn\nThất bại: ${res.loi.length}`);
        } else {
          // ✅ Hành động đơn
          await HoaDonService.updateTrangThai(pendingStatus.id, pendingStatus.next);
          handleStatusChange(pendingStatus.id, pendingStatus.current, pendingStatus.next);
        }
      } catch (error: any) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        alert(`Lỗi cập nhật trạng thái: ${error.message}`);
      } finally {
        setDialogOpen(false);
        setPendingStatus(null);
        setSelectedIds([]); // clear sau khi xong
        onReload();
      }
    }
  };
  return (
    <>
      {/* Dialog xác nhận */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chuyển trạng thái</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn chuyển trạng thái từ "
              <b>{pendingStatus?.current}</b>" sang "
              <b>{pendingStatus?.next}</b>"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmChange}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tabs lọc */}
      <div className="flex justify-between items-center mb-6 animate-in fade-in slide-in-from-left-10 duration-500">
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
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-blue-800 hover:text-white"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Nút chuyển trạng thái hàng loạt */}
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => {
            const nextStatus = getNextTrangThaiForBatch();
            if (!nextStatus) {
              toast.error("Không thể chuyển trạng thái. Vui lòng chọn các hóa đơn có cùng trạng thái hợp lệ.");
              return;
            }

            setPendingStatus({
              id: -1,
              current: "Nhiều hóa đơn",
              next: nextStatus,
            });
            setDialogOpen(true);
          }}
        >
          Chuyển trạng thái nhanhh
        </Button>
      </div>

      {/* Bảng */}
      <div className="border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
        <Table>
          <TableHeader className="bg-blue-500">
            <TableRow>
              <TableHead>
                <Input
                  type="checkbox"
                  checked={isCheckedAll}
                  onChange={toggleSelectAll}
                  className="form-checkbox w-4 h-4"
                />
              </TableHead>
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
                <TableCell>
                  <Input
                    type="checkbox"
                    checked={selectedIds.includes(hd.id)}
                    onChange={() => toggleSelectOne(hd.id)}
                    className="form-checkbox w-4 h-4"
                  />
                </TableCell>
                <TableCell className="text-white">
                  {page * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="font-semibold">{hd.maHD || "N/A"}</TableCell>
                <TableCell className="text-white">
                  {hd.user?.ten || hd.ten || "Khách lẻ"}
                </TableCell>
                <TableCell className="text-white">
                  {hd.user?.sdt || hd.sdt || "N/A"}
                </TableCell>
                <TableCell className="text-green-400 font-medium">
                  {hd.tongTien.toLocaleString("vi-VN")}₫
                </TableCell>
                <TableCell className="text-white">
                  {formatDateFlexible(hd.ngayTao)}
                </TableCell>
                <TableCell>
                  <Select value={hd.trangThai} disabled>
                    <SelectTrigger className="w-[150px] bg-white/10 border border-blue-400 text-white text-xs font-semibold rounded-lg opacity-60">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#181e29] border border-blue-400 text-white">
                      {Object.values(TrangThaiHoaDon).map((status, idx) => (
                        <SelectItem key={idx} value={status} className="text-xs">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
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
                        title={`Chuyển sang ${status}`}
                        onClick={() => onChuyenTrangThaiClick(hd, status)}
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
                <TableCell colSpan={11} className="text-center text-gray-400 py-8">
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
          className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550] rounded-lg px-4 py-2"
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
          className="text-white border-blue-400 bg-[#232b3b] hover:bg-[#2c3550] rounded-lg px-4 py-2"
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
