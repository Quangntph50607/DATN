"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ThanhToanThatBaiPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-1">Thanh toán thất bại</h1>
          <p className="text-red-100">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-gray-700 text-center">
            Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <Button className="w-full" onClick={() => router.push("/cart/checkout")}>Quay lại thanh toán</Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>Về trang chủ</Button>
        </div>
      </Card>
    </div>
  );
}


