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
import { Eye } from "lucide-react";
import {
  TrangThaiHoaDon,
  PaymentMethods,
  HoaDonDTO,
} from "@/components/types/hoaDon-types";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";

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
}

function HoaDonTable({
  data,
  page,
  setPage,
  handleViewDetail,
  handleStatusChange,
  isValidTrangThaiTransition,
  PAGE_SIZE,
}: HoaDonListProps) {
  const [filterLoaiHD, setFilterLoaiHD] = useState<"all" | 1 | 2>("all");

  const filteredData = useMemo(() => {
    return filterLoaiHD == "all"
      ? data?.content || []
      : data?.content.filter((hd) => hd.loaiHD === filterLoaiHD) || [];
  }, [data, filterLoaiHD]);

  const getLoaiHDLabel = (loaiHD: number | undefined) => {
    if (loaiHD === 1) return "Tại quầy";
    if (loaiHD === 2) return "Online";
    return "Không rõ";
  };
  const onTrangThaiChange = (hd: HoaDonDTO, newValue: string) => {
    if (
      hd.trangThai &&
      newValue !== hd.trangThai &&
      isValidTrangThaiTransition(hd.trangThai, newValue)
    ) {
      const confirmed = window.confirm(
        `Chuyển từ "${hd.trangThai}" sang "${newValue}"?`
      );
      if (confirmed) {
        handleStatusChange(hd.id, hd.trangThai, newValue);
      }
    }
  };

  return (
    <>
      {/* Tabs lọc loại hóa đơn */}
      <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-left-10 duration-500">
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
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white
                                    text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-blue-800 hover:text-white"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Bảng hóa đơn */}
      <div className=" border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
        <Table>
          <TableHeader className="bg-blue-500">
            <TableRow className="">
              <TableHead>STT</TableHead>
              <TableHead>Mã Hóa Đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh Toán</TableHead>
              <TableHead>Loại HĐ</TableHead>
              <TableHead>Xem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((hd, index) => (
              <TableRow key={hd.id} className="">
                <TableCell className="text-white">
                  {page * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="text-blue-400 font-semibold ">
                  {hd.maHD || "N/A"}
                </TableCell>
                <TableCell className="text-white ">
                  {hd.user?.ten || hd.ten || "Khách lẻ"}
                </TableCell>
                <TableCell className="text-green-400 font-medium">
                  {hd.tongTien.toLocaleString("vi-VN")}₫
                </TableCell>
                <TableCell className="text-white ">
                  {formatDateFlexible(hd.ngayTao)}
                </TableCell>
                <TableCell>
                  <Select
                    value={hd.trangThai as TrangThaiHoaDon}
                    onValueChange={(value) => onTrangThaiChange(hd, value)}
                  >
                    <SelectTrigger className="w-[150px] bg-white/10 border border-blue-400 text-white text-xs font-semibold rounded-lg">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#181e29] border border-blue-400 text-white">
                      {Object.values(TrangThaiHoaDon).map((status, idx) => (
                        <SelectItem
                          key={idx}
                          value={status}
                          disabled={
                            // hd.trangThai
                            //   ? !isValidTrangThaiTransition(
                            //       hd.trangThai,
                            //       status
                            //     ) || hd.trangThai === status
                            //   : false
                            ["Hoàn tất", "Đã hủy", "Thất bại"].includes(
                              hd.trangThai
                            )
                          }
                          className="text-xs"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-white ">
                  {hd.phuongThucThanhToan
                    ? PaymentMethods[hd.phuongThucThanhToan]
                    : "N/A"}
                </TableCell>
                <TableCell className="text-white ">
                  {getLoaiHDLabel(hd.loaiHD)}
                </TableCell>
                <TableCell className="">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleViewDetail(hd.id)}
                  >
                    <Eye className="w-5 h-5 text-blue-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!data || filteredData.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={10}
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
      <div className="flex justify-center items-center mt-4 p-2 rounded-lg ">
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
