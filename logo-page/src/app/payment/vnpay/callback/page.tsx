"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCreateHoaDon, useGuiEmail } from "@/hooks/useHoaDon";
import { CreateHoaDonDTO } from "@/components/types/hoaDon-types";
import { GuiHoaDonRequest } from "@/components/types/hoadondientu.type";
import { CartItemType } from "@/components/types/cart";
import { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { toast } from "sonner";

export default function VNPayCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "processing" | "success" | "failed" | "error"
  >("processing");
  const [loadingText, setLoadingText] = useState("Đang xử lý thanh toán...");

  const createHoaDonMutation = useCreateHoaDon();
  const { mutate: guiEmail } = useGuiEmail();

  // Helper function để xóa localStorage một lần
  const clearCheckoutData = () => {
    const keysToRemove = [
      "pendingOrder",
      "checkoutTotal",
      "checkoutDiscount",
      "checkoutProducts",
      "selectedAddress",
      "shippingMethod",
      "shippingFee",
      "soNgayGiao",
      "userEmail",
      "checkoutItems",
      "selectedVoucher",
      "selectedVoucherCode",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  };

  // Helper function để xử lý lỗi và chuyển hướng
  const handleError = (errorType: string, message: string) => {
    setStatus("error");
    setLoadingText("Có lỗi xảy ra");
    toast.error(message);
    clearCheckoutData();

    setTimeout(() => {
      router.push(
        `/thanh-toan-that-bai?type=${errorType}&message=${encodeURIComponent(
          message
        )}`
      );
    }, 1500);
  };

  // Helper function để kiểm tra tồn kho đơn giản
  const checkStockSimple = async (products: CartItemType[]) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/lego-store/san-pham/check-stock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: products.map((p) => ({
              idSanPham: p.id,
              soLuong: p.quantity,
            })),
          }),
        }
      );

      if (!response.ok) {
        console.warn("Không thể kiểm tra tồn kho, tiếp tục tạo đơn hàng");
        return true; // Cho phép tiếp tục nếu API lỗi
      }

      const result = await response.json();
      return !result.outOfStock || result.outOfStock.length === 0;
    } catch (error) {
      console.warn("Lỗi kiểm tra tồn kho:", error);
      return true; // Cho phép tiếp tục nếu có lỗi
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      try {
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");

        // Kiểm tra thanh toán thành công
        if (vnpResponseCode === "00" && vnpTransactionStatus === "00") {
          setLoadingText("Thanh toán thành công! Đang tạo đơn hàng...");

          // Lấy thông tin đơn hàng từ localStorage
          const pendingOrderStr = localStorage.getItem("pendingOrder");
          const checkoutProductsStr = localStorage.getItem("checkoutProducts");
          const selectedAddressStr = localStorage.getItem("selectedAddress");

          if (!pendingOrderStr || !checkoutProductsStr || !selectedAddressStr) {
            handleError(
              "validation_error",
              "Không tìm thấy thông tin đơn hàng"
            );
            return;
          }

          const pendingOrder: CreateHoaDonDTO = JSON.parse(pendingOrderStr);
          const checkoutProducts: CartItemType[] =
            JSON.parse(checkoutProductsStr);
          const selectedAddress: ThongTinNguoiNhan =
            JSON.parse(selectedAddressStr);

          // Kiểm tra tồn kho đơn giản
          setLoadingText("Đang kiểm tra tồn kho...");
          const stockOk = await checkStockSimple(checkoutProducts);

          if (!stockOk) {
            handleError("out_of_stock", "Một số sản phẩm đã hết hàng");
            return;
          }

          // Tạo hóa đơn
          setLoadingText("Đang tạo hóa đơn...");
          try {
            const hoaDon = await createHoaDonMutation.mutateAsync(pendingOrder);

            // Gửi email (không đợi kết quả)
            setLoadingText("Đang gửi email xác nhận...");
            const emailData: GuiHoaDonRequest = {
              idHD: hoaDon.id,
              toEmail: localStorage.getItem("userEmail") || "",
              tenKH: selectedAddress.hoTen,
              maHD: hoaDon.maHD,
              ngayTao: new Date().toLocaleDateString("vi-VN"),
              diaChi: `${selectedAddress.duong}, ${selectedAddress.xa}, ${selectedAddress.thanhPho}`,
              pttt:
                pendingOrder.phuongThucThanhToan === "VNPay"
                  ? "Thanh toán VNPay"
                  : "Chuyển khoản ngân hàng",
              ptvc:
                localStorage.getItem("shippingMethod") === "Nhanh"
                  ? "GIAO NHANH"
                  : "GIAO TIẾT KIỆM",
              listSp: checkoutProducts.map((item) => ({
                ten: item.name,
                ma: item.id.toString(),
                gia: item.price.toString(),
                soLuong: item.quantity,
                tongTien: (item.price * item.quantity).toString(),
              })),
              phiShip: localStorage.getItem("shippingFee") || "0",
              totalAmount: localStorage.getItem("checkoutTotal") || "0",
              tienGiam: localStorage.getItem("checkoutDiscount") || "0",
            };

            guiEmail(emailData, {
              onSuccess: () => console.log("Email sent successfully"),
              onError: () => console.warn("Email sending failed"),
            });

            // Xóa dữ liệu và cập nhật giỏ hàng
            clearCheckoutData();
            const currentCart = JSON.parse(
              localStorage.getItem("cartItems") || "[]"
            );
            const orderedProductIds = checkoutProducts.map((p) => p.id);
            const updatedCart = currentCart.filter(
              (item: CartItemType) => !orderedProductIds.includes(item.id)
            );
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));

            setStatus("success");
            toast.success("Thanh toán thành công! Đơn hàng đã được tạo.");

            setTimeout(() => {
              router.push(`/thanh-toan-thanh-cong?hoaDonId=${hoaDon.id}`);
            }, 1500);
          } catch (createOrderError: any) {
            console.error("Lỗi khi tạo hóa đơn:", createOrderError);

            if (
              createOrderError.message?.includes("hết hàng") ||
              createOrderError.message?.includes("out of stock")
            ) {
              handleError(
                "out_of_stock",
                "Một số sản phẩm đã hết hàng trong quá trình tạo đơn hàng"
              );
            } else {
              handleError("system_error", "Có lỗi xảy ra khi tạo đơn hàng");
            }
          }
        } else {
          // Thanh toán thất bại
          setStatus("failed");
          setLoadingText("Thanh toán thất bại");

          let errorMessage = "Thanh toán không thành công";
          if (vnpResponseCode === "24") {
            errorMessage = "Giao dịch bị hủy bởi người dùng";
          } else if (vnpResponseCode === "51") {
            errorMessage = "Tài khoản không đủ số dư";
          } else if (vnpResponseCode === "65") {
            errorMessage = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
          }

          toast.error("Thanh toán thất bại. Vui lòng thử lại.");
          clearCheckoutData();

          setTimeout(() => {
            router.push(
              `/thanh-toan-that-bai?type=payment_failed&message=${encodeURIComponent(
                errorMessage
              )}`
            );
          }, 1500);
        }
      } catch (error) {
        console.error("Lỗi xử lý callback:", error);
        handleError("system_error", "Lỗi hệ thống không xác định");
      }
    };

    processPayment();
  }, [searchParams, router, createHoaDonMutation, guiEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Loading Animation */}
        {status === "processing" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-orange-500 border-t-transparent"></div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {loadingText}
            </h2>
            <p className="text-sm text-gray-600">Vui lòng đợi...</p>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-sm text-gray-600">Đang chuyển hướng...</p>
          </>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-sm text-gray-600">Đang chuyển hướng...</p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-sm text-gray-600">Đang chuyển hướng...</p>
          </>
        )}
      </div>
    </div>
  );
}
