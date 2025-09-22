"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/context/authStore.store";
import { toast } from "sonner";
import { accountService } from "@/services/accountService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { User, Edit2, Shield, Building } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState<{
    sdt?: string;
    diaChi?: string;
  }>({});

  // Lấy user từ auth store
  const { user, updateUser } = useUserStore();

  // Form data cho thông tin cá nhân
  const [profileData, setProfileData] = useState({
    ten: user?.ten || "",
    email: user?.email || "",
    sdt: user?.sdt || "",
    diaChi: user?.diaChi || "",
    role_id: user?.roleId || 0,
  });

  // Cập nhật form data khi user thay đổi
  useEffect(() => {
    if (user) {
      setProfileData({
        ten: user.ten || "",
        email: user.email || "",
        sdt: user.sdt || "",
        diaChi: user.diaChi || "",
        role_id: user.roleId || 0,
      });
    }
  }, [user]);

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return "Quản trị viên";
      case 2:
        return "Nhân viên";
      case 3:
        return "Khách hàng";
      default:
        return "Không xác định";
    }
  };

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1:
        return "bg-red-100 text-red-800 border-red-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate SĐT
    if (profileData.sdt && !/^0\d{9}$/.test(profileData.sdt)) {
      newErrors.sdt = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await accountService.updateAccount(user?.id || 0, {
        ten: profileData.ten,
        email: profileData.email,
        sdt: profileData.sdt,
        diaChi: profileData.diaChi,
        role_id: profileData.role_id,
        trangThai: 1,
      });

      if (response) {
        // Cập nhật user trong store
        updateUser({
          ...user!,
          ten: profileData.ten,
          email: profileData.email,
          sdt: profileData.sdt,
          diaChi: profileData.diaChi,
        });

        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || "Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmCancel = () => {
    if (user) {
      setProfileData({
        ten: user.ten || "",
        email: user.email || "",
        sdt: user.sdt || "",
        diaChi: user.diaChi || "",
        role_id: user.roleId || 0,
      });
    }
    setIsEditing(false);
    setShowConfirmDialog(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Thông tin cá nhân
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Xem và chỉnh sửa thông tin cá nhân của bạn
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isEditing
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin cá nhân
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ten" className="text-sm font-medium text-gray-700">
                      Họ và tên
                    </Label>
                    <Input
                      id="ten"
                      value={profileData.ten}
                      onChange={(e) =>
                        setProfileData({ ...profileData, ten: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 text-gray-900 font-medium placeholder:text-gray-400"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 text-gray-900 font-medium placeholder:text-gray-400"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sdt" className="text-sm font-medium text-gray-700">
                      Số điện thoại
                    </Label>
                    <Input
                      id="sdt"
                      value={profileData.sdt}
                      onChange={(e) =>
                        setProfileData({ ...profileData, sdt: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 text-gray-900 font-medium placeholder:text-gray-400"
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.sdt && (
                      <p className="text-red-500 text-xs mt-1">{errors.sdt}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="diaChi" className="text-sm font-medium text-gray-700">
                      Địa chỉ liên hệ
                    </Label>
                    <Input
                      id="diaChi"
                      value={profileData.diaChi}
                      onChange={(e) =>
                        setProfileData({ ...profileData, diaChi: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 text-gray-900 font-medium placeholder:text-gray-400"
                      placeholder="Nhập địa chỉ liên hệ"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin quyền hạn */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Thông tin tài khoản
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Vai trò
                    </Label>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                          profileData.role_id
                        )}`}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        {getRoleName(profileData.role_id)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Trạng thái
                    </Label>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Hoạt động
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Ngày tạo tài khoản
                    </Label>
                    <div className="mt-2 text-sm text-gray-600">
                      {"Không xác định"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút lưu */}
            {isEditing && (
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-6 py-2"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog xác nhận hủy */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy chỉnh sửa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn hủy các thay đổi chưa được lưu? Tất cả thông tin sẽ được khôi phục về trạng thái ban đầu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
