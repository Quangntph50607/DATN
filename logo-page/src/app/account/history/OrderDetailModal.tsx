"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { EnrichedOrder } from "./types";
import { statusBadge } from "./palette";
import Image from "next/image";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: EnrichedOrder | null;
}

export default function OrderDetailModal({
  open,
  onOpenChange,
  selectedOrder,
}: OrderDetailModalProps) {
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

  React.useEffect(() => {
    const loadImages = async () => {
      try {
        const pids = (selectedOrder?.chiTietSanPham || [])
          .map((it: any) => it?.sanPham?.id)
          .filter((id: any): id is number => Boolean(id));
        const uniquePids = Array.from(new Set(pids));
        await Promise.all(
          uniquePids.map(async (pid) => {
            try {
              const list = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(
                pid
              );
              if (Array.isArray(list) && list.length > 0) {
                const main = list.find((i) => i.anhChinh) || list[0];
                if (main?.url) {
                  setImageUrls((prev) => ({ ...prev, [pid]: main.url }));
                }
              }
            } catch (e) {
              // ignore per-item errors
            }
          })
        );
      } catch (e) {
        // ignore
      }
    };
    if (open && selectedOrder) loadImages();
  }, [open, selectedOrder]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl md:max-w-5xl lg:max-w-7xl xl:w-[90vw] max-h-[95vh] overflow-y-auto bg-white border border-yellow-200 rounded-2xl shadow-xl text-base">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-600">
            Chi Tiết Đơn Hàng
          </DialogTitle>
        </DialogHeader>

        {selectedOrder && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-yellow-800" />
                  </div>
                  <h3 className="font-semibold text-lg text-yellow-800">
                    Thông Tin Đơn Hàng
                  </h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã đơn hàng:</span>
                    <span className="font-medium">{selectedOrder.maHD}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày đặt:</span>
                    <span className="font-medium">
                      {formatDateFlexible(selectedOrder.ngayTao, false)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={statusBadge(selectedOrder.trangThai)}>
                      {selectedOrder.trangThai}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tổng tiền:</span>
                    <span className="font-extrabold text-red-500 text-lg">
                      ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-orange-600">
                    Lịch Sử Đơn Hàng
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      status: "Đặt hàng thành công",
                      date: formatDateFlexible(selectedOrder.ngayTao, false),
                      icon: CheckCircle,
                    },
                    ...(selectedOrder.trangThai !== "Chờ xác nhận"
                      ? [
                          {
                            status: "Đang xử lý",
                            date: "Đơn hàng đang được xử lý",
                            icon: Clock,
                          },
                        ]
                      : []),
                    ...(selectedOrder.trangThai === "Đã xác nhận" ||
                    selectedOrder.trangThai === "Đang đóng gói" ||
                    selectedOrder.trangThai === "Đang vận chuyển" ||
                    selectedOrder.trangThai === "Đã giao" ||
                    selectedOrder.trangThai === "Hoàn tất"
                      ? [
                          {
                            status: "Xác nhận đơn hàng",
                            date: "Đã xác nhận đơn",
                            icon: CheckCircle,
                          },
                        ]
                      : []),
                    ...(selectedOrder.trangThai === "Đang đóng gói" ||
                    selectedOrder.trangThai === "Đang vận chuyển" ||
                    selectedOrder.trangThai === "Đã giao" ||
                    selectedOrder.trangThai === "Hoàn tất"
                      ? [
                          {
                            status: "Đang đóng gói",
                            date: "Đang chuẩn bị hàng",
                            icon: Package,
                          },
                        ]
                      : []),
                    ...(selectedOrder.trangThai === "Đang vận chuyển" ||
                    selectedOrder.trangThai === "Đã giao" ||
                    selectedOrder.trangThai === "Hoàn tất"
                      ? [
                          {
                            status: "Đang vận chuyển",
                            date: "Đang giao hàng",
                            icon: Truck,
                          },
                        ]
                      : []),
                    ...(selectedOrder.trangThai === "Đã giao" ||
                    selectedOrder.trangThai === "Hoàn tất"
                      ? [
                          {
                            status: "Giao hàng thành công",
                            date: "Đã giao thành công",
                            icon: CheckCircle,
                          },
                        ]
                      : []),
                    ...(selectedOrder.trangThai === "Đã hủy"
                      ? [
                          {
                            status: "Đã hủy",
                            date: "Đơn hàng đã bị hủy",
                            icon: XCircle,
                          },
                        ]
                      : []),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-300 rounded-full flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.status}
                        </p>
                        <p className="text-gray-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-lg text-green-700">
                  Thông Tin Giao Hàng
                </h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ:</span>
                  <p className="font-medium">
                    {selectedOrder.diaChiGiaoHang || "Chưa có địa chỉ"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-medium">
                    {selectedOrder.loaiVanChuyen === 1 ||
                    selectedOrder.isFast === 1
                      ? "Giao hàng nhanh"
                      : "Giao hàng thường"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí giao hàng:</span>
                  <span className="font-medium">
                    ₫{(selectedOrder.phiShip || 0).toLocaleString()}
                  </span>
                </div>
                {selectedOrder.tenNguoiNhan && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Người nhận:</span>
                    <span className="font-medium">
                      {selectedOrder.tenNguoiNhan}
                    </span>
                  </div>
                )}
                {selectedOrder.sdt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="font-medium">{selectedOrder.sdt}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <h3 className="font-semibold text-lg text-purple-700">
                  Sản Phẩm ({selectedOrder.chiTietSanPham?.length || 0})
                </h3>
              </div>
              {selectedOrder.chiTietSanPham?.length ? (
                <div className="space-y-4">
                  {selectedOrder.chiTietSanPham.map((item, index) => (
                    <div key={index}>
                      <Image
                        src={
                          imageUrls[item.sanPham?.id as number] ||
                          "/images/logoM.jpg"
                        }
                        alt={item.sanPham?.tenSanPham || ""}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-yellow-300"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">
                          {item.sanPham?.tenSanPham || "Sản phẩm không tồn tại"}
                        </h4>
                        <p className="text-gray-500">
                          Mã SP: {item.sanPham?.maSanPham || "N/A"}
                        </p>
                        <p className="text-gray-500">
                          Số lượng: {item.soLuong || 0}
                        </p>
                        <p className="text-gray-500">
                          Đơn giá: ₫
                          {(
                            (item as any)?.gia ??
                            (item.sanPham as any)?.giaKhuyenMai ??
                            (item.sanPham?.gia || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-red-500">
                        ₫
                        {(() => {
                          const unit =
                            (item as any)?.gia ??
                            (item.sanPham as any)?.giaKhuyenMai ??
                            (item.sanPham?.gia || 0);
                          return Number(
                            unit * (item.soLuong || 0)
                          ).toLocaleString();
                        })()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Không có sản phẩm nào</p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-yellow-800" />
                </div>
                <h3 className="font-semibold text-lg text-yellow-800">
                  Thông Tin Thanh Toán
                </h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-medium">
                    ₫{(selectedOrder.tamTinh || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span className="font-medium">
                    ₫{(selectedOrder.phiShip || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá:</span>
                  <span className="font-medium text-green-600">
                    -₫{(selectedOrder.soTienGiam || 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-yellow-200 pt-3 flex justify-between">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="font-extrabold text-red-500 text-lg">
                    ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-medium">
                    {selectedOrder.phuongThucThanhToan || "COD"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
