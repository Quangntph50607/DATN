"use client";

import {
  HoaDonDTO,
  PaymentMethods,
  TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { Badge } from "@/components/ui/badge";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";

interface Props {
  detail: HoaDonDTO | null;
}

export const HoaDonThongTin = ({ detail }: Props) => {
  if (!detail) return null;

  const isOnline = detail.loaiHD === 2;
  const format = (val?: number | null) =>
    `${val?.toLocaleString("vi-VN") || "0"}đ`;

  const getStatusLabel = (status: string) =>
    TrangThaiHoaDon[status as keyof typeof TrangThaiHoaDon] || status;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case TrangThaiHoaDon.PENDING:
        return "bg-yellow-500 text-white";
      case TrangThaiHoaDon.PROCESSING:
        return "bg-orange-400 text-white";
      case TrangThaiHoaDon.PACKING:
        return "bg-purple-500 text-white";
      case TrangThaiHoaDon.COMPLETED:
        return "bg-blue-500 text-white";
      case TrangThaiHoaDon.SHIPPED:
        return "bg-orange-500 text-white";
      case TrangThaiHoaDon.DELIVERED:
        return "bg-green-600 text-white";
      case TrangThaiHoaDon.CANCELLED:
        return "bg-red-500 text-white";
      case TrangThaiHoaDon.FAILED:
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const InfoItem = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex  gap-5 text-sm">
      <span className="text-gray-400 w-20">{label}:</span>
      <span className="text-white font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-6 text-sm">
      <div className="space-y-2">
        <InfoItem label="Mã hóa đơn" value={detail.maHD || "N/A"} />
        <InfoItem label="Ngày tạo" value={formatDateFlexible(detail.ngayTao)} />
        <InfoItem
          label="Trạng thái"
          value={
            <Badge className={getStatusStyle(detail.trangThai || "")}>
              {getStatusLabel(detail.trangThai || "")}
            </Badge>
          }
        />
        <InfoItem
          label="Phương thức"
          value={
            detail.phuongThucThanhToan
              ? PaymentMethods[detail.phuongThucThanhToan]
              : "Tiền mặt"
          }
        />
        <InfoItem label="Tạm tính" value={format(detail.tamTinh)} />
        <InfoItem label="Giảm giá" value={format(detail.soTienGiam)} />
        <InfoItem
          label="Tổng tiền"
          value={
            <span className="text-green-400 text-lg font-semibold">
              {format(detail.tongTien)}
            </span>
          }
        />
      </div>

      <div className="space-y-2">
        <InfoItem
          label="Khách hàng"
          value={detail.ten || detail.user?.ten || "Khách lẻ"}
        />
        <InfoItem label="SĐT" value={detail.sdt || "N/A"} />

        {isOnline && (
          <>
            <InfoItem label="Địa chỉ" value={detail.diaChiGiaoHang || "N/A"} />
            <InfoItem label="Mã VC" value={detail.maVanChuyen || "N/A"} />
          </>
        )}
      </div>
    </div>
  );
};
