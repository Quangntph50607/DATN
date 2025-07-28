"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useThongTinNguoiNhan, useCreateThongTin, useUpdateThongTin } from "@/hooks/useThongTinTaiKhoan";
import { useUserStore } from "@/context/authStore.store";
import { toast } from "sonner";
import { accountService } from "@/services/accountService";
import { format, parse } from "date-fns";
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
import { User, Phone, Mail, Calendar, MapPin, Edit2 } from "lucide-react";

export default function ProFile() {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Lấy user từ auth store
  const { user, updateUser } = useUserStore();
  const currentUserId = user?.id;

  // Lấy địa chỉ mặc định
  const { data: thongTinList = [] } = useThongTinNguoiNhan(currentUserId || 0);
  const defaultAddress = thongTinList.find(item => item.isMacDinh === true);

  // State cho địa chỉ
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [allWards, setAllWards] = useState<any>({});
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Form data cho thông tin cá nhân
  const [personalData, setPersonalData] = useState({
    ten: user?.ten || "",
    email: user?.email || "",
    sdt: user?.sdt || "",
    ngaySinh: user?.ngaySinh,
    duong: defaultAddress?.duong || "",
    xa: defaultAddress?.xa || "",
    thanhPho: defaultAddress?.thanhPho || "",
  });

  // Fetch danh sách tỉnh và xã/phường từ public/data
  useEffect(() => {
    fetch("/data/province.json")
      .then((res) => res.json())
      .then((provinceData) => {
        fetch("/data/ward.json")
          .then((res) => res.json())
          .then((wardData) => {
            setAllWards(wardData);
            const parentCodes = new Set();
            Object.values(wardData as Record<string, any>).forEach((w: any) => {
              if (w.parent_code) parentCodes.add(w.parent_code);
            });
            const filteredProvinces = Object.entries(provinceData as Record<string, any>)
              .filter(([code]) => parentCodes.has(code))
              .map(([code, info]) => ({
                code,
                ...info,
              }));
            setProvinces(filteredProvinces);
          });
      });
  }, []);

  // Khi chọn tỉnh, cập nhật danh sách xã/phường
  useEffect(() => {
    if (selectedProvince) {
      const wardsArr = Object.entries(allWards as Record<string, any>)
        .filter(([_, info]) => (info as any).parent_code === selectedProvince)
        .map(([code, info]) => ({ code, ...(info as any) }));
      setWards(wardsArr);
    } else {
      setWards([]);
    }
    setSelectedWard("");
  }, [selectedProvince, allWards]);

  // Cập nhật personalData khi chọn tỉnh/xã
  useEffect(() => {
    const selectedProvinceData = provinces.find(p => p.code === selectedProvince);
    const selectedWardData = wards.find(w => w.code === selectedWard);

    setPersonalData(prev => ({
      ...prev,
      thanhPho: selectedProvinceData?.name || "",
      xa: selectedWardData?.name || "",
    }));
  }, [selectedProvince, selectedWard, provinces, wards]);

  // Cập nhật personalData khi user thay đổi
  useEffect(() => {
    if (user) {
      const parsedDate = user.ngaySinh
        ? (() => {
          try {
            let parsed;
            if (typeof user.ngaySinh === 'string') {
              parsed = parse(user.ngaySinh, "dd-MM-yyyy", new Date());
              if (isNaN(parsed.getTime())) {
                parsed = new Date(user.ngaySinh);
              }
            } else {
              parsed = new Date(user.ngaySinh);
            }
            return isNaN(parsed.getTime()) ? undefined : parsed;
          } catch {
            return undefined;
          }
        })()
        : undefined;

      setPersonalData({
        ten: user.ten || "",
        email: user.email || "",
        sdt: user.sdt || "",
        ngaySinh: parsedDate,
        duong: defaultAddress?.duong || "",
        xa: defaultAddress?.xa || "",
        thanhPho: defaultAddress?.thanhPho || "",
      });
    }
  }, [user, defaultAddress]);

  // Thêm useEffect để set địa chỉ mặc định vào form
  useEffect(() => {
    if (defaultAddress && provinces.length > 0) {
      const province = provinces.find(p => p.name === defaultAddress.thanhPho);
      if (province) {
        setSelectedProvince(province.code);

        setTimeout(() => {
          const wardsArr = Object.entries(allWards as Record<string, any>)
            .filter(([_, info]) => (info as any).parent_code === province.code)
            .map(([code, info]) => ({ code, ...(info as any) }));

          const ward = wardsArr.find(w => w.name === defaultAddress.xa);
          if (ward) {
            setSelectedWard(ward.code);
          }
        }, 100);
      }

      setPersonalData(prev => ({
        ...prev,
        duong: defaultAddress.duong || "",
        xa: defaultAddress.xa || "",
        thanhPho: defaultAddress.thanhPho || "",
      }));
    }
  }, [defaultAddress, provinces, allWards]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }

    if (!personalData.ten.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!personalData.duong.trim() || !personalData.xa.trim() || !personalData.thanhPho.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    const formData = {
      ten: personalData.ten,
      sdt: personalData.sdt,
      ngaySinh: personalData.ngaySinh && !isNaN(new Date(personalData.ngaySinh).getTime())
        ? format(new Date(personalData.ngaySinh), "dd-MM-yyyy")
        : "",
      duong: personalData.duong,
      xa: personalData.xa,
      thanhPho: personalData.thanhPho,
    };

    setPendingFormData(formData);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData || !currentUserId) return;

    setIsLoading(true);

    try {
      const diaChi = pendingFormData.duong && pendingFormData.xa && pendingFormData.thanhPho
        ? `${pendingFormData.duong}, ${pendingFormData.xa}, ${pendingFormData.thanhPho}`
        : "Địa chỉ không xác định";

      await accountService.updateAccount(currentUserId, {
        ten: pendingFormData.ten,
        sdt: pendingFormData.sdt,
        email: user?.email,
        ngaySinh: pendingFormData.ngaySinh,
        diaChi: diaChi,
        role_id: user?.roleId || 3,
        trangThai: 1,
      });

      updateUser({
        ten: pendingFormData.ten,
        sdt: pendingFormData.sdt,
        ngaySinh: pendingFormData.ngaySinh,
        diaChi: diaChi,
      });

      setIsEditingPersonal(false);

      toast.success("🎉 Cập nhật thông tin thành công!", {
        description: "Thông tin cá nhân của bạn đã được cập nhật.",
        duration: 4000,
      });

    } catch (error: any) {
      console.error("Update error:", error);

      toast.error("❌ Cập nhật thông tin thất bại!", {
        description: error.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setPendingFormData(null);
    }
  };

  if (!currentUserId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin tài khoản</p>
        </div>
      </div>
    );
  }

  // Hiển thị form chỉnh sửa
  if (isEditingPersonal) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm border bg-white">
          <CardHeader className="pb-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-black">
                    Chỉnh sửa thông tin tài khoản
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Cập nhật thông tin cá nhân của bạn
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditingPersonal(false)}
                className="text-black border-gray-300"
              >
                Hủy
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 bg-white">
            <form onSubmit={handlePersonalSubmit} className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={personalData.ten}
                  onChange={(e) => setPersonalData({ ...personalData, ten: e.target.value })}
                  required
                  className="h-11 bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">Email</Label>
                <Input
                  type="email"
                  value={personalData.email}
                  disabled={true}
                  className="h-11 bg-gray-100 text-gray-500 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email không thể thay đổi
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">Số điện thoại</Label>
                <Input
                  value={personalData.sdt}
                  onChange={(e) => setPersonalData({ ...personalData, sdt: e.target.value })}
                  className="h-11 bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">Ngày sinh</Label>
                <Input
                  type="date"
                  value={
                    personalData.ngaySinh && !isNaN(new Date(personalData.ngaySinh).getTime())
                      ? new Date(personalData.ngaySinh).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        setPersonalData({ ...personalData, ngaySinh: date });
                      }
                    } else {
                      setPersonalData({ ...personalData, ngaySinh: undefined });
                    }
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                  className="h-11 bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">Tỉnh/Thành phố</Label>
                <Select
                  value={selectedProvince}
                  onValueChange={setSelectedProvince}
                >
                  <SelectTrigger className="h-11 bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.code} className="text-black">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-black mb-2 block">Xã/Phường</Label>
                <Select
                  value={selectedWard}
                  onValueChange={setSelectedWard}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger className="h-11 bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Chọn xã/phường" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.code} className="text-black">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-black mb-2 block">Địa chỉ</Label>
                <Input
                  value={personalData.duong}
                  onChange={(e) => setPersonalData({ ...personalData, duong: e.target.value })}
                  className="h-11 bg-white border-gray-300 text-black"
                  placeholder="Nhập số nhà, tên đường..."
                />
              </div>

              <div className="col-span-2 flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingPersonal(false)}
                  className="flex-1 text-black border-gray-300"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận cập nhật thông tin</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p className="mb-3">Bạn có chắc chắn muốn cập nhật thông tin cá nhân?</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="font-medium mb-2">Thông tin sẽ được cập nhật:</div>
                    <div className="space-y-1 text-gray-600">
                      <div>• <strong>Họ tên:</strong> {pendingFormData?.ten || "Không có"}</div>
                      <div>• <strong>Số điện thoại:</strong> {pendingFormData?.sdt || "Không có"}</div>
                      <div>• <strong>Ngày sinh:</strong> {pendingFormData?.ngaySinh || "Không có"}</div>
                      <div>• <strong>Địa chỉ:</strong> {pendingFormData?.duong && pendingFormData?.xa && pendingFormData?.thanhPho
                        ? `${pendingFormData?.duong}, ${pendingFormData?.xa}, ${pendingFormData?.thanhPho}`
                        : "Không có"}</div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingFormData(null)}>
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmUpdate}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Đang cập nhật..." : "Xác nhận"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Hiển thị thông tin (view mode)
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm border bg-white">
        <CardHeader className="pb-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-black">
                  Thông tin tài khoản
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý thông tin cá nhân của bạn
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditingPersonal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 bg-white">
          <div className="grid grid-cols-2 gap-8">
            {/* Họ và tên */}
            <div>
              <Label className="text-sm font-medium text-black mb-2 block">
                Họ và tên
              </Label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-black font-medium">
                  {user?.ten}
                </span>
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <Label className="text-sm font-medium text-black mb-2 block">
                Số điện thoại
              </Label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-black font-medium">
                  {user?.sdt || "chưa cập nhật"}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm font-medium text-black mb-2 block">
                Email
              </Label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-black font-medium">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Ngày sinh */}
            <div>
              <Label className="text-sm font-medium text-black mb-2 block">
                Ngày sinh
              </Label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-black font-medium">
                  {user?.ngaySinh ?
                    (typeof user.ngaySinh === 'string' ? user.ngaySinh : format(new Date(user.ngaySinh), "dd/MM/yyyy"))
                    : "Chưa cập nhật"
                  }
                </span>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="col-span-2">
              <Label className="text-sm font-medium text-black mb-2 block">
                Địa chỉ
              </Label>
              <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <span className="text-black font-medium">
                  {user.diaChi}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}