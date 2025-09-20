"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AccessDeniedProps {
  requiredRole?: string;
  currentRole?: string;
}

export default function AccessDenied({ 
  requiredRole = "Admin", 
  currentRole = "Nhân viên" 
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-4 p-8 text-center shadow-2xl border-2 border-red-200 dark:border-red-800">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Truy cập bị từ chối
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Bạn không có quyền truy cập trang này
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Vai trò hiện tại:</strong> {currentRole}</p>
              <p><strong>Vai trò yêu cầu:</strong> {requiredRole}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <Button 
              onClick={() => router.push("/admin/banhang")}
              variant="outline"
              className="w-full"
            >
              Đi đến trang bán hàng
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Nếu bạn cần quyền truy cập, vui lòng liên hệ quản trị viên
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
