"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Printer, X } from "lucide-react";
import { HoaDonChiTietDTO, HoaDonDTO } from "@/components/types/hoaDon-types";
import { DTOUser } from "@/components/types/account.type";
import { SanPham } from "@/components/types/product.type";
import {
  exportInvoiceToExcel,
  exportInvoiceToDocx,
  printInvoice,
} from "./invoiceUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HoaDonThongTin } from "./HoaDonThongTin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: HoaDonDTO | null;
  loadingDetail: boolean;
  chiTietSanPham: HoaDonChiTietDTO[];
  sanPhams: SanPham[];
  users: DTOUser[];
}

const format = (val?: number | null) =>
  `${val?.toLocaleString("vi-VN") || "0"}₫`;

export default function HoaDonChiTiet({
  open,
  onOpenChange,
  detail,
  loadingDetail,
  chiTietSanPham,
  sanPhams,
  users,
}: Props) {
  const enrichedChiTietSanPham = chiTietSanPham.map((ct) => {
    // Lấy productId từ spId
    const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
    const matched = sanPhams.find((sp) => sp.id === productId);

    // Log để kiểm tra matching
    console.log(`Processing spId: ${productId}, matched:`, matched);

    // Nếu không tìm thấy sản phẩm, trả về giá trị mặc định
    if (!matched) {
      return {
        ...ct,
        spId: {
          id: productId,
          maSanPham: "N/A",
          tenSanPham: "N/A",
          doTuoi: 0,
          gia: 0,
          soLuongTon: 0,
          trangThai: "N/A",
          danhMucId: 0,
          boSuuTapId: 0,
          soLuongManhGhep: 0,
          moTa: "",
        },
      };
    }

    return {
      ...ct,
      spId: matched,
    };
  });

  console.log("Exporting to Excel", { detail, chiTietSanPham, users });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] lg:max-w-[1000px] h-[90vh] dark:bg-gray-900 text-white rounded-xl border border-gray-700 p-0 overflow-hidden">
        <div>
          <DialogHeader className="px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Chi tiết hóa đơn #{detail?.maHD || "N/A"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                onClick={() =>
                  exportInvoiceToExcel(detail, enrichedChiTietSanPham, users)
                }
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                onClick={() =>
                  exportInvoiceToDocx(detail, enrichedChiTietSanPham, users)
                }
              >
                <FileText className="w-4 h-4 mr-2" />
                DOCX
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg"
                onClick={printInvoice}
              >
                <Printer className="w-4 h-4 mr-2" />
                In hóa đơn
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
          {loadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Đang tải chi tiết hóa đơn...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 pb-6 space-y-6">
                <div className="bg-gray-800/30 rounded-xl p-1">
                  <HoaDonThongTin detail={detail} />
                </div>

                <Separator className="my-2" />
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">
                    Chi tiết sản phẩm
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  <span className="text-sm text-gray-400">
                    {enrichedChiTietSanPham.length} sản phẩm
                  </span>
                </div>
                <div className=" border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
                  <Table>
                    <TableHeader className="bg-blue-500">
                      <TableRow className="w-full">
                        <TableHead className="p-2">STT</TableHead>
                        <TableHead className="p-2">Mã SP</TableHead>
                        <TableHead className="p-2">Tên SP</TableHead>
                        <TableHead className="p-2 text-center">SL</TableHead>
                        <TableHead className="p-2 text-right">
                          Đơn giá
                        </TableHead>
                        <TableHead className="p-2 text-right">
                          Thành tiền
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrichedChiTietSanPham.map((item, idx) => (
                        <TableRow key={item.id || idx} className="border-t">
                          <TableCell className="p-2">{idx + 1}</TableCell>
                          <TableCell className="p-2">
                            {item.spId.maSanPham}
                          </TableCell>
                          <TableCell className="p-2">
                            {item.spId.tenSanPham}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {item.soLuong}
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            {format(item.gia)}
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            {format(item.tongTien)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gradient-to-r from-gray-800 to-gray-700 border-t-2 border-blue-500/50">
                        <TableCell
                          colSpan={4}
                          className="py-4 px-4 text-right font-semibold text-gray-200"
                        >
                          Tổng cộng:
                        </TableCell>
                        <TableCell className="py-4 px-4 text-center font-bold text-white">
                          {enrichedChiTietSanPham.reduce(
                            (sum, item) => sum + item.soLuong,
                            0
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-right">
                          <span className="text-xl font-bold text-green-400">
                            {format(detail?.tongTien)}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
