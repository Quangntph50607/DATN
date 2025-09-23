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
    if (hasRunRef.current) return; // Prevent double-run (StrictMode, fast refresh)
    hasRunRef.current = true;

    const statusKey = "pendingOrderStatus";
    const currentStatus = localStorage.getItem(statusKey);
    if (currentStatus === "processing" || currentStatus === "done") {
      return;
    }
    localStorage.setItem(statusKey, "processing");

    const vnp_ResponseCode = search.get("vnp_ResponseCode");
    const vnp_TransactionStatus = search.get("vnp_TransactionStatus");

    // Kiểm tra kết quả thanh toán VNPAY (00 là thành công)
    const isSuccess = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00";

    const pendingOrderRaw = localStorage.getItem("pendingOrder");
    if (!pendingOrderRaw) {
      toast.error("Không tìm thấy thông tin đơn hàng tạm.");
      localStorage.setItem(statusKey, "done");
      router.replace("/thanh-toan-that-bai");
      return;
    }

    const pending = JSON.parse(pendingOrderRaw);

    if (!isSuccess) {
      // Xóa nháp nếu thất bại
      localStorage.removeItem("pendingOrder");
      toast.error("Thanh toán thất bại hoặc bị hủy.");
      localStorage.setItem(statusKey, "done");
      router.replace("/thanh-toan-that-bai");
      return;
    }

    // Thanh toán thành công -> tạo hóa đơn
    (async () => {
      try {
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
  }, [createHoaDonMutation, guiEmail, router, search]);

  return null;
}


