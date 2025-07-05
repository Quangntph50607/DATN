"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
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
      console.warn(`Không tìm thấy sản phẩm cho spId: ${productId}`);
      return {
        ...ct,
        spId: {
          id: productId,
          maSanPham: "N/A",
          tenSanPham: "N/A",
        },
      };
    }

    return {
      ...ct,
      spId: {
        id: productId,
        maSanPham: matched.maSanPham ?? "N/A",
        tenSanPham: matched.tenSanPham ?? "N/A",
      },
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full  !max-w-[800px] h-[90vh] overflow-y-auto dark:bg-gray-800 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Chi tiết hóa đơn
            <span className="text-blue-400">#{detail?.maHD || "N/A"}</span>
          </DialogTitle>
        </DialogHeader>

        {loadingDetail ? (
          <div className="text-center py-16 text-gray-300">Đang tải...</div>
        ) : (
          <>
            <HoaDonThongTin detail={detail} />

            <div className="flex justify-end gap-2 mb-4">
              <Button
                className="bg-green-400"
                onClick={() =>
                  exportInvoiceToExcel(detail, enrichedChiTietSanPham, users)
                }
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button
                className="bg-blue-400"
                onClick={() =>
                  exportInvoiceToDocx(detail, enrichedChiTietSanPham, users)
                }
              >
                <FileText className="w-4 h-4 mr-2" /> DOCX
              </Button>
              <Button onClick={printInvoice}>
                <Printer className="w-4 h-4 mr-2  " /> In
              </Button>
            </div>

            <Separator className="my-2" />
            <h3 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h3>
            <div className="border-3 border-blue-500 rounded-2xl mt-3 overflow-x-auto">
              <Table className="min-w-full table-auto text-sm">
                <TableHeader className="bg-blue-500">
                  <TableRow className="w-full">
                    <TableHead className="p-2">STT</TableHead>
                    <TableHead className="p-2">Mã SP</TableHead>
                    <TableHead className="p-2">Tên SP</TableHead>
                    <TableHead className="p-2 text-center">SL</TableHead>
                    <TableHead className="p-2 text-right">Đơn giá</TableHead>
                    <TableHead className="p-2 text-right">Thành tiền</TableHead>
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
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
