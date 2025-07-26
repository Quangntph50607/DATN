import { ChiTietKhuyenMai } from "@/components/types/khuyenmai-type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

interface Props {
  readonly onView: (id: number) => void;
  readonly lichSuKM: ChiTietKhuyenMai[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDate = (arr: number[]) => {
  if (!arr || arr.length < 3) return "";
  return `${arr[2]}/${arr[1]}/${arr[0]}`;
};

export default function LichSuKhuyenMai({ onView, lichSuKM }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {lichSuKM.length === 0 ? (
        <p className="text-muted-foreground italic">
          Không có dữ liệu khuyến mãi.
        </p>
      ) : (
        lichSuKM.map((ls) => (
          <Card key={ls.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>{ls.tenKhuyenMai}</CardTitle>
              <CardDescription>
                Giảm {ls.phanTramKhuyenMai}% | {formatDate(ls.ngayBatDau)} →{" "}
                {formatDate(ls.ngayKetThuc)}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <div>Sản phẩm áp dụng: {ls.soSanPhamApDung}</div>
              <div>Tổng số lượng bán: {ls.tongSoLuongBan}</div>
              <div>
                Tổng tiền trước giảm: {formatCurrency(ls.tongTienTruocGiam)}
              </div>
              <div>Tổng số tiền giảm: {formatCurrency(ls.tongSoTienGiam)}</div>
              <div>
                Tổng tiền sau giảm: {formatCurrency(ls.tongTienSauGiam)}
              </div>
              <div>Số hóa đơn: {ls.soHoaDon}</div>

              {/* Danh sách sản phẩm */}
              {ls.sanPhamDaApDung && ls.sanPhamDaApDung.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-black mb-1">
                    Sản phẩm đã áp dụng:
                  </p>
                  <ul className="list-disc list-inside">
                    {ls.sanPhamDaApDung.map((sp, idx) => (
                      <li key={idx}>
                        {sp.tenSanPham} - {sp.maSanPham} |{" "}
                        {formatCurrency(sp.giaGoc)} →{" "}
                        {formatCurrency(sp.giaSauGiam)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
