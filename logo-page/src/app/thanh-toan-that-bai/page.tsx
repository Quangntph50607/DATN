"use client";
import {
  AlertCircle,
  Package,
  ArrowLeft,
  Phone,
  MessageCircle,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThanhToanThatBaiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy thông tin lỗi từ URL params
  const errorType = searchParams.get("type") || "payment_failed";
  const errorMessage = searchParams.get("message") || "";
  const orderId = searchParams.get("orderId") || "";

  // Định nghĩa các loại lỗi và thông báo tương ứng
  const getErrorInfo = () => {
    switch (errorType) {
      case "out_of_stock":
        return {
          title: "Hết hàng",
          icon: <Package className="w-8 h-8 text-orange-600" />,
          description:
            "Một số sản phẩm trong giỏ hàng đã hết hàng trước khi bạn hoàn tất đặt hàng.",
          bgColor: "from-orange-50 to-red-50",
          headerColor: "from-orange-500 to-red-600",
          suggestions: [
            "Kiểm tra lại giỏ hàng để xem sản phẩm nào còn lại",
            "Giảm số lượng sản phẩm đã hết hàng",
            "Chọn sản phẩm thay thế tương tự",
          ],
        };

      case "payment_failed":
        return {
          title: "Thanh toán thất bại",
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          description:
            "Quá trình thanh toán không thành công. Đơn hàng chưa được tạo.",
          bgColor: "from-red-50 to-pink-50",
          headerColor: "from-red-500 to-pink-600",
          suggestions: [
            "Kiểm tra lại thông tin thẻ/tài khoản",
            "Đảm bảo có đủ số dư trong tài khoản",
            "Thử phương thức thanh toán khác",
          ],
        };

      case "validation_error":
        return {
          title: "Thông tin không hợp lệ",
          icon: <AlertCircle className="w-8 h-8 text-yellow-600" />,
          description: "Thông tin đơn hàng không hợp lệ hoặc thiếu sót.",
          bgColor: "from-yellow-50 to-orange-50",
          headerColor: "from-yellow-500 to-orange-600",
          suggestions: [
            "Kiểm tra lại thông tin cá nhân",
            "Cập nhật địa chỉ giao hàng",
            "Xác nhận số điện thoại",
          ],
        };

      default:
        return {
          title: "Lỗi hệ thống",
          icon: <AlertCircle className="w-8 h-8 text-gray-600" />,
          description:
            "Đã xảy ra lỗi không mong muốn trong quá trình xử lý đơn hàng.",
          bgColor: "from-gray-50 to-blue-50",
          headerColor: "from-gray-500 to-blue-600",
          suggestions: [
            "Kiểm tra kết nối internet",
            "Thử lại sau vài phút",
            "Liên hệ hỗ trợ nếu vấn đề tiếp tục",
          ],
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${errorInfo.bgColor} flex items-center justify-center p-4`}
    >
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header Failed */}
        <div
          className={`bg-gradient-to-r ${errorInfo.headerColor} text-white p-8 text-center`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {errorInfo.icon}
          </div>
          <h1 className="text-2xl font-bold mb-2">❌ {errorInfo.title}</h1>
          <p className="text-white/90">
            {errorMessage || errorInfo.description}
          </p>
          {orderId && (
            <p className="text-sm text-white/75 mt-2">
              Mã đơn hàng: #{orderId}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error message */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Rất tiếc, đơn hàng của bạn chưa được tạo thành công 😔
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Đừng lo lắng! Sản phẩm LEGO của bạn vẫn còn trong giỏ hàng và bạn
              có thể thử lại bất cứ lúc nào.
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-3 h-3 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  🔍 Nguyên nhân có thể:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Quay lại giỏ hàng
            </Button>

            <Button
              className="w-full border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Button>

            {/* Retry Button for specific errors */}
            {(errorType === "system_error" ||
              errorType === "payment_failed") && (
              <Button
                className="w-full border-blue-300 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>

          {/* Additional Info for specific error types */}
          {errorType === "out_of_stock" && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">
                💡 Mẹo nhỏ:
              </h4>
              <p className="text-orange-700 text-sm">
                Để tránh tình trạng hết hàng, bạn có thể đặt hàng nhanh bằng
                cách sử dụng tính năng "Mua ngay" thay vì thêm vào giỏ hàng và
                đặt sau.
              </p>
            </div>
          )}

          {errorType === "payment_failed" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                💳 Phương thức thanh toán:
              </h4>
              <p className="text-blue-700 text-sm">
                Chúng tôi hỗ trợ nhiều phương thức thanh toán: COD, VNPay,
                Chuyển khoản ngân hàng. Bạn có thể thử phương thức khác nếu gặp
                vấn đề.
              </p>
            </div>
          )}

          {/* Support */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Cần hỗ trợ?</p>
            <div className="flex justify-center gap-6">
              <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
                <Phone className="w-4 h-4" />
                Hotline: 1900-1234
              </button>
              <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                Chat hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
