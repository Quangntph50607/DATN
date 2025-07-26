"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";
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
import {
  HoaDonDTO,
  TrangThaiHoaDon,
  PaymentMethods,
} from "@/components/types/hoaDon-types";
import { HoaDonService } from "@/services/hoaDonService";
import { toast } from "sonner";

interface OrderTableProps {
  data: { content: HoaDonDTO[]; totalPages: number } | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleViewDetail: (id: number) => void;
  PAGE_SIZE: number;
  fetchData: () => void;
}

const isValidTrangThaiTransition = (current: string, next: string): boolean => {
  const currentKey = Object.keys(TrangThaiHoaDon).find(
    (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === current
  );
  const nextKey = Object.keys(TrangThaiHoaDon).find(
    (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === next
  );

  if (!currentKey || !nextKey) return false;

  switch (currentKey) {
    case "PENDING":
      return nextKey === "PROCESSING" || nextKey === "CANCELLED";
    case "PROCESSING":
      return nextKey === "PACKING";
    case "PACKING":
      return nextKey === "SHIPPED";
    case "SHIPPED":
      return nextKey === "DELIVERED" || nextKey === "FAILED";
    case "DELIVERED":
      return nextKey === "COMPLETED";
    case "FAILED":
      return nextKey === "CANCELLED" || nextKey === "PENDING";
    default:
      return false;
  }
};

const parseBackendDate = (date: any): string => {
  if (!date) return "N/A";
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
    const d = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nano / 1e6)
    );
    return d.toLocaleString("vi-VN");
  }
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN");
};

const getPaymentMethodLabel = (method: string | null | undefined): string => {
  if (!method) return "N/A";
  const normalized = method.toUpperCase();
  const key = Object.keys(PaymentMethods).find(
    (k) =>
      PaymentMethods[k as keyof typeof PaymentMethods].toUpperCase() ===
      normalized
  );
  return key
    ? PaymentMethods[key as keyof typeof PaymentMethods]
    : `Không xác định (${method})`;
};

const OrderTable = memo(
  ({ data, page, setPage, PAGE_SIZE, fetchData }: OrderTableProps) => {
    const isMounted = useRef(true);

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    const handleStatusUpdate = useCallback(
      async (id: number, currentStatus: string, nextStatus: string) => {
        if (!isValidTrangThaiTransition(currentStatus, nextStatus)) {
          toast.warning("⚠️ Chuyển trạng thái không hợp lệ!");
          return;
        }

        const confirmed = window.confirm(
          `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentStatus}" sang "${nextStatus}" không?`
        );
        if (!confirmed) return;

        try {
          const response = await HoaDonService.updateTrangThai(id, nextStatus);
          if (isMounted.current && response?.trangThai) {
            toast.success("✅ Cập nhật trạng thái thành công!");
            fetchData();
          } else {
            throw new Error("Trạng thái trả về không hợp lệ.");
          }
        } catch (err: any) {
          if (isMounted.current) {
            toast.error(`❌ Lỗi cập nhật: ${err.message || "Không xác định"}`);
          }
        }
      },
      [fetchData]
    );

    return (
      <>
        <div className="rounded-2xl shadow-xl overflow-x-auto bg-[#1A1F2E] border border-[#3B82F6]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#2A2F4E]">
                {[
                  "STT",
                  "Mã HĐ",
                  "Khách hàng",
                  "Tổng tiền",
                  "Ngày tạo",
                  "Trạng thái",
                  "Thanh toán",
                  "Loại HĐ",
                  "Mã VC",
                ].map((header, idx) => (
                  <TableHead
                    key={idx}
                    className="text-white text-center text-sm font-semibold bg-blue-500"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.content.map((hd, index) => (
                <TableRow key={hd.id} className="hover:bg-[#232b3b] transition">
                  <TableCell className="text-white text-center">
                    {page * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="text-[#A855F7] font-semibold text-center">
                    {hd.maHD || "N/A"}
                  </TableCell>
                  <TableCell className="text-white text-center">
                    {hd.ten || "N/A"}
                  </TableCell>
                  <TableCell className="text-green-400 text-center font-medium">
                    {hd.tongTien?.toLocaleString("vi-VN") || "0"}₫
                  </TableCell>
                  <TableCell className="text-white text-center">
                    {parseBackendDate(hd.ngayTao)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={hd.trangThai || ""}
                      onValueChange={(value) =>
                        handleStatusUpdate(hd.id, hd.trangThai || "", value)
                      }
                    >
                      <SelectTrigger className="w-[130px] bg-[#2A2F4E] border border-[#3B82F6] text-white text-xs font-semibold rounded-lg">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2E] border border-[#3B82F6] text-white">
                        {Object.values(TrangThaiHoaDon).map((status, idx) => (
                          <SelectItem
                            key={idx}
                            value={status}
                            disabled={
                              hd.trangThai
                                ? !isValidTrangThaiTransition(
                                    hd.trangThai,
                                    status
                                  ) || hd.trangThai === status
                                : false
                            }
                            className="text-xs"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-white text-center">
                    {getPaymentMethodLabel(hd.phuongThucThanhToan)}
                  </TableCell>
                  <TableCell className="text-white text-center">
                    {hd.loaiHD === 1
                      ? "Tại quầy"
                      : hd.loaiHD === 2
                      ? "Online"
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-white text-center">
                    {hd.maVanChuyen || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {!data?.content.length && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-gray-400 py-8"
                  >
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center items-center mt-4 bg-[#1A1F2E] p-2 rounded-lg">
          <Button
            variant="outline"
            className="text-white border-[#3B82F6] bg-[#2A2F4E] hover:bg-[#3B82F6] hover:text-white rounded-lg px-4 py-2"
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
            className="text-white border-[#3B82F6] bg-[#2A2F4E] hover:bg-[#3B82F6] hover:text-white rounded-lg px-4 py-2"
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
);

export default OrderTable;
