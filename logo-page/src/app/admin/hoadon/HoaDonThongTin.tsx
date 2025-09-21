"use client";

import {
  HoaDonDTO,
  PaymentMethods,
  TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { Badge } from "@/components/ui/badge";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";
import Image from "next/image";

interface Props {
  detail: HoaDonDTO | null;
}

export const HoaDonThongTin = ({ detail }: Props) => {
  if (!detail) return null;

  const isOnline = detail.loaiHD === 2;
  const format = (val?: number | null) =>
    `${val?.toLocaleString("vi-VN") || "0"}đ`;

  const statusStyles: Record<string, string> = {
    [TrangThaiHoaDon.PENDING]: "bg-yellow-500 hover:bg-yellow-600 text-white",
    [TrangThaiHoaDon.PROCESSING]:
      "bg-orange-400 hover:bg-orange-500 text-white",
    [TrangThaiHoaDon.PACKING]: "bg-purple-500 hover:bg-purple-600 text-white",
    [TrangThaiHoaDon.COMPLETED]: "bg-blue-500 hover:bg-blue-600 text-white",
    [TrangThaiHoaDon.SHIPPED]: "bg-orange-500 hover:bg-orange-600 text-white",
    [TrangThaiHoaDon.DELIVERED]: "bg-green-600 hover:bg-green-700 text-white",
    [TrangThaiHoaDon.CANCELLED]: "bg-red-500 hover:bg-red-600 text-white",
    [TrangThaiHoaDon.FAILED]: "bg-red-600 hover:bg-red-700 text-white",
    default: "bg-gray-600 hover:bg-gray-700 text-white",
  };

  const InfoItem = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
      <span className="text-gray-300 font-medium text-sm">{label}:</span>
      <div
        className={`text-right max-w-[65%] ${
          highlight ? "text-green-400 font-bold" : "text-white"
        } text-sm`}
      >
        {value}
      </div>
    </div>
  );

  const InfoSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <h3 className="text-base font-semibold text-white mb-3 pb-1 border-b border-gray-600/50">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <InfoSection title="Thông tin hóa đơn & khách hàng">
        <InfoItem
          label="Mã hóa đơn"
          value={
            <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-xs">
              {detail.maHD || "N/A"}
            </span>
          }
        />
        <InfoItem label="Ngày tạo" value={formatDateFlexible(detail.ngayTao)} />
        <InfoItem
          label="Trạng thái"
          value={
            <Badge
              className={`${
                statusStyles[detail.trangThai || "default"]
              } px-2 py-0.5 text-xs`}
            >
              {TrangThaiHoaDon[
                detail.trangThai as keyof typeof TrangThaiHoaDon
              ] ||
                detail.trangThai ||
                "N/A"}
            </Badge>
          }
        />
        <InfoItem
          label="Phương thức TT"
          value={
            <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
              {PaymentMethods[
                detail.phuongThucThanhToan as keyof typeof PaymentMethods
              ] || "Tiền mặt"}
            </span>
          }
        />
        <InfoItem
          label="Khách hàng"
          value={
            detail.tenNguoiNhan || detail.ten || detail.user?.ten || "Khách lẻ"
          }
        />
        <InfoItem
          label="Số điện thoại"
          value={
            <span className="font-mono">
              {detail.sdt || detail.sdt1 || detail.user?.sdt || "Chưa có"}
            </span>
          }
        />
        {isOnline && (
          <>
            <InfoItem
              label="Địa chỉ giao hàng"
              value={
                <span className="text-xs">
                  {detail.diaChiGiaoHang || "N/A"}
                </span>
              }
            />
            <InfoItem
              label="Mã vận chuyển"
              value={
                <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-xs">
                  {detail.maVanChuyen || "N/A"}
                </span>
              }
            />
          </>
        )}
      </InfoSection>

      <InfoSection title="Chi tiết thanh toán">
        <InfoItem label="Tạm tính" value={format(detail.tamTinh)} />
        <InfoItem label="Phí ship" value={format(detail.phiShip)} />
        <InfoItem
          label="Giảm giá"
          value={
            <span className="text-red-400">-{format(detail.soTienGiam)}</span>
          }
        />
        <InfoItem label="Tổng tiền" value={format(detail.tongTien)} highlight />
        {detail.qrCodeUrl && (
          <div className="mt-4 pt-3 border-t border-gray-600/50 text-center">
            <span className="text-gray-300 text-sm mb-2 block">
              Mã QR chuyển khoản
            </span>
            <div className="relative inline-block">
              <Image
                src={detail.qrCodeUrl}
                alt="QR chuyển khoản"
                width={120}
                height={120}
                className="rounded-lg border border-gray-600/50"
                unoptimized
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg blur opacity-20" />
            </div>
          </div>
        )}
      </InfoSection>
    </div>
  );
};
