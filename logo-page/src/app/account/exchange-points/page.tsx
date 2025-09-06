"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetPhieuGiamGiaNoiBat } from "@/hooks/usePhieuGiam";
import { useDoiDiemLayPhieu } from "@/hooks/useViPhieuGiamGia";
import { useUserStore } from "@/context/authStore.store";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Gift,
  Star,
  Clock,
  Coins,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Trophy
} from "lucide-react";
import { SuccessNotification } from "@/components/ui/success-notification";

export default function ExchangePointsPage() {
  const { user } = useUserStore();
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const { data: vouchers = [], isLoading } = useGetPhieuGiamGiaNoiBat();
  const doiDiemMutation = useDoiDiemLayPhieu();

  // Lọc phiếu giảm giá có thể đổi bằng điểm (có diemDoi > 0) và còn hạn sử dụng
  const exchangeableVouchers = vouchers.filter((voucher) => {
    if (!voucher.diemDoi || voucher.diemDoi <= 0 || voucher.soLuong <= 0) {
      return false;
    }

    // Kiểm tra hạn sử dụng
    try {
      const now = new Date();
      const endDate = new Date(voucher.ngayKetThuc);
      return endDate > now; // Chỉ lấy phiếu còn hạn
    } catch {
      return false; // Nếu không parse được ngày thì loại bỏ
    }
  });

  const handleExchange = async () => {
    if (!selectedVoucher || !user?.id) return;

    try {
      await doiDiemMutation.mutateAsync({
        userId: user.id,
        phieuGiamGiaId: selectedVoucher.id,
      });

      setNotificationMessage(`Đổi phiếu thành công! 🎉 Bạn đã đổi thành công phiếu "${selectedVoucher.tenPhieu}". Phiếu đã được thêm vào ví của bạn!`);
      setShowSuccessNotification(true);
      setSelectedVoucher(null);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đổi phiếu";
      setNotificationMessage(`Đổi phiếu thất bại: ${errorMessage}`);
      setShowErrorNotification(true);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    }
  };

  const canAfford = (voucher: PhieuGiamGia) => {
    return user?.diemTichLuy && voucher.diemDoi
      ? user.diemTichLuy >= voucher.diemDoi
      : false;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getDiscountText = (voucher: PhieuGiamGia) => {
    if (voucher.loaiPhieuGiam === "theo_phan_tram") {
      return `Giảm ${voucher.giaTriGiam}%`;
    }
    return `Giảm ${voucher.giaTriGiam.toLocaleString()}₫`;
  };

  return (
    <>
      {/* Thông báo thành công */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message={notificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Thông báo lỗi */}
      {showErrorNotification && (
        <div
          className="fixed z-[9999]"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <div
            className="bg-red-900 rounded-lg shadow-2xl p-6 w-80"
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex-shrink-0">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg font-medium">{notificationMessage}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-red-700 rounded-full h-1">
                <div className="bg-red-400 h-1 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Gift className="h-8 w-8" />
                    Đổi Điểm Lấy Phiếu Giảm Giá
                  </h1>
                  <p className="text-orange-100 mt-1">
                    Sử dụng điểm tích lũy để đổi phiếu giảm giá nổi bật còn hạn sử dụng
                  </p>
                </div>
              </div>

              {/* Điểm hiện tại */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-6 w-6 text-yellow-300" />
                    <div>
                      <div className="text-sm text-orange-100">Điểm hiện tại</div>
                      <div className="text-2xl font-bold text-white">
                        {user?.diemTichLuy || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-95">Tổng phiếu có thể đổi</div>
                    <div className="text-3xl font-bold">{exchangeableVouchers.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-95">Có thể đổi ngay</div>
                    <div className="text-3xl font-bold">
                      {exchangeableVouchers.filter(v => canAfford(v)).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-95">Phiếu nổi bật còn hạn</div>
                    <div className="text-3xl font-bold">{exchangeableVouchers.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danh sách phiếu giảm giá */}
          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="ml-2">Đang tải phiếu giảm giá...</span>
                </div>
              </CardContent>
            </Card>
          ) : exchangeableVouchers.length === 0 ? (
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Gift className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  Hiện tại không có phiếu giảm giá nổi bật nào còn hạn để đổi
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Các phiếu giảm giá có thể đã hết hạn hoặc hết số lượng
                </p>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto shadow-sm">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <span className="text-white text-lg">💡</span>
                    </div>
                    <h4 className="font-bold text-gray-800">Mẹo hữu ích</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Tích lũy điểm bằng cách mua hàng và tham gia các hoạt động trên website để sẵn sàng đổi phiếu mới!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exchangeableVouchers.map((voucher) => {
                const affordable = canAfford(voucher);
                const isSelected = selectedVoucher?.id === voucher.id;

                return (
                  <Card
                    key={voucher.id}
                    className={`relative transition-all duration-300 cursor-pointer bg-white border-0 shadow-md ${isSelected
                        ? "ring-2 ring-orange-500 shadow-2xl scale-105 bg-gradient-to-br from-orange-50 to-red-50"
                        : "hover:shadow-xl hover:scale-102 hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50"
                      } ${!affordable ? "opacity-70 bg-gray-50" : ""
                      }`}
                    onClick={() => affordable && setSelectedVoucher(voucher)}
                  >
                    <CardContent className="p-6">
                      {/* Badge nổi bật */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-lg border-0">
                          <Star className="h-3 w-3 mr-1" />
                          Nổi bật
                        </Badge>
                      </div>

                      {/* Thông tin phiếu */}
                      <div className="mb-4">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                          {voucher.tenPhieu}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Mã: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{voucher.maPhieu}</span>
                        </p>
                      </div>

                      {/* Giá trị giảm */}
                      <div className="mb-4">
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          {getDiscountText(voucher)}
                        </div>
                        {voucher.giamToiDa && (
                          <div className="text-sm text-gray-600 font-medium">
                            Tối đa: {voucher.giamToiDa.toLocaleString()}₫
                          </div>
                        )}
                      </div>

                      {/* Điều kiện sử dụng */}
                      <div className="mb-4 space-y-2">
                        <div className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          Đơn tối thiểu: {voucher.giaTriToiThieu.toLocaleString()}₫
                        </div>
                        <div className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                          <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                          Còn lại: {voucher.soLuong} phiếu
                        </div>
                      </div>

                      {/* Thời hạn */}
                      <div className="mb-4 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 font-medium">HSD: {formatDate(voucher.ngayKetThuc)}</span>
                        <div className="ml-auto">
                          <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Còn hạn
                          </div>
                        </div>
                      </div>

                      {/* Điểm cần thiết */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
                            <Coins className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                            {voucher.diemDoi} điểm
                          </span>
                        </div>

                        {/* Trạng thái */}
                        <div className="flex items-center gap-2">
                          {affordable ? (
                            <div className="p-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="p-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full">
                              <XCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <span className={`text-sm font-bold ${affordable ? "text-emerald-600" : "text-red-600"
                            }`}>
                            {affordable ? "Có thể đổi" : "Không đủ điểm"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Footer với nút đổi */}
          {selectedVoucher && (
            <Card className="mt-8 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-xl text-gray-800 mb-2">Phiếu đã chọn:</h4>
                    <p className="text-gray-700 font-medium text-lg">{selectedVoucher.tenPhieu}</p>
                    <p className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full inline-block mt-1">
                      Mã: {selectedVoucher.maPhieu}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium mb-1">Cần trả:</div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
                        <Coins className="h-6 w-6 text-white" />
                      </div>
                      {selectedVoucher.diemDoi} điểm
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVoucher(null)}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-medium"
                    size="lg"
                  >
                    Hủy chọn
                  </Button>
                  <Button
                    onClick={handleExchange}
                    disabled={doiDiemMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                    size="lg"
                  >
                    {doiDiemMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Đang đổi...
                      </>
                    ) : (
                      <>
                        <Gift className="h-5 w-5 mr-2" />
                        Đổi phiếu ngay
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
