"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCreateHoaDon, useGuiEmail } from "@/hooks/useHoaDon";
import { GuiHoaDonRequest } from "@/components/types/hoadondientu.type";

export default function VNPayCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const createHoaDonMutation = useCreateHoaDon();
  const { mutate: guiEmail } = useGuiEmail();
  const hasRunRef = useRef(false);

  useEffect(() => {
    try {
      if (hasRunRef.current) return; // Prevent double-run (StrictMode, fast refresh)
      hasRunRef.current = true;

      const statusKey = "pendingOrderStatus";
      const currentStatus = localStorage.getItem(statusKey);
      if (currentStatus === "done") {
        // Đã xử lý xong trước đó -> không làm gì thêm
        return;
      }
      if (currentStatus === "processing") {
        // Đang xử lý ở phiên khác. Không làm gì nữa để tránh lặp.
        return;
      }
      localStorage.setItem(statusKey, "processing");

      const vnp_ResponseCode = search.get("vnp_ResponseCode");
      const vnp_TransactionStatus = search.get("vnp_TransactionStatus");
      const isSuccess =
        vnp_ResponseCode === "00" &&
        (vnp_TransactionStatus === "00" || vnp_TransactionStatus === null);
      console.log("VNPay callback:", {
        vnp_ResponseCode,
        vnp_TransactionStatus,
        isSuccess,
      });


      const pendingOrderRaw = localStorage.getItem("pendingOrder");
      if (!pendingOrderRaw) {
        toast.error("Không tìm thấy thông tin đơn hàng tạm.");
        localStorage.setItem(statusKey, "done");
        router.replace("/thanh-toan-that-bai");
        return;
      }

      const pending = JSON.parse(pendingOrderRaw);

      // Tạo hóa đơn nếu thanh toán thành công, ngược lại chuyển thất bại
      (async () => {
        try {
          if (!isSuccess) {
            localStorage.removeItem("pendingOrder");
            toast.error("Thanh toán thất bại hoặc bị hủy.");
            localStorage.setItem(statusKey, "done");
            router.replace("/thanh-toan-that-bai");
            return;
          }
          const hoaDon = await createHoaDonMutation.mutateAsync(pending.orderData as any);

          const emailData: GuiHoaDonRequest = {
            idHD: hoaDon.id,
            toEmail: pending.userEmail || "",
            tenKH: pending.orderData.tenNguoiNhan,
            maHD: hoaDon.maHD,
            ngayTao: new Date().toLocaleDateString("vi-VN"),
            diaChi: pending.diaChiGiaoHang,
            pttt: "Chuyển khoản VNPay",
            ptvc: pending.shippingMethod === "Nhanh" ? "GIAO NHANH" : "GIAO TIẾT KIỆM",
            listSp: pending.listSp,
            phiShip: String(pending.shippingFee || 0),
            totalAmount: String(pending.checkoutTotal || 0),
            tienGiam: String(pending.checkoutDiscount || 0),
          };

          guiEmail(emailData, {
            onSuccess: () => console.log("Gửi email thành công"),
            onError: (err) => console.error("Gửi email thất bại:", err),
          });

          // Xóa cart local sau khi thành công
          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("checkoutItems");
          localStorage.removeItem("selectedVoucher");
          localStorage.removeItem("checkoutDiscount");
          localStorage.removeItem("selectedVoucherCode");
          localStorage.setItem(statusKey, "done");
          router.replace(`/thanh-toan-thanh-cong?hoaDonId=${hoaDon.id}`);
        } catch (e) {
          console.error(e);
          localStorage.removeItem("pendingOrder");
          toast.error("Có lỗi khi tạo hóa đơn sau khi thanh toán.");
          localStorage.setItem(statusKey, "done");
          router.replace("/thanh-toan-that-bai");
        }
      })();
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem("pendingOrderStatus", "done");
      } catch {}
      router.replace("/thanh-toan-that-bai");
    }
  }, [createHoaDonMutation, guiEmail, router, search]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 mx-auto mb-3" />
        <p className="text-gray-700">Đang xử lý thanh toán, vui lòng chờ...</p>
      </div>
    </div>
  );
}


