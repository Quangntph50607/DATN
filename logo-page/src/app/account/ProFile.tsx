"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const defaultAddress = thongTinList.find(item => item.isMacDinh === 1);

  // Mutations cho thông tin tài khoản
  const createThongTinMutation = useCreateThongTin();
  const updateThongTinMutation = useUpdateThongTin();

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
    duong: "",
    xa: "",
    thanhPho: "",
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
            // Kiểm tra nhiều format khác nhau
            let parsed;
            if (typeof user.ngaySinh === 'string') {
              // Thử parse với format dd-MM-yyyy
              parsed = parse(user.ngaySinh, "dd-MM-yyyy", new Date());
              if (isNaN(parsed.getTime())) {
                // Thử parse với format khác
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
      // Set province từ defaultAddress
      const province = provinces.find(p => p.name === defaultAddress.thanhPho);
      if (province) {
        setSelectedProvince(province.code);

        // Set ward sau khi wards được load
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

      // Set personalData với thông tin từ defaultAddress
      setPersonalData(prev => ({
        ...prev,
        duong: defaultAddress.duong || "",
        xa: defaultAddress.xa || "",
        thanhPho: defaultAddress.thanhPho || "",
      }));
    }
  }, [defaultAddress, provinces, allWards]);

  // Sửa lỗi khi submit form
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }

    // Validate dữ liệu (bỏ email validation vì không cho edit)
    if (!personalData.ten.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Chuẩn bị dữ liệu để confirm
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
    setShowConfirmDialog(false);

    try {
      const diaChi = defaultAddress
        ? `${defaultAddress.duong}, ${defaultAddress.xa}, ${defaultAddress.thanhPho}`
        : user?.diaChi || "";

      // update request
      await accountService.updateAccount(currentUserId, {
        ten: pendingFormData.ten,
        sdt: pendingFormData.sdt,
        email: user?.email,
        ngaySinh: pendingFormData.ngaySinh,
        diaChi: diaChi,
        role_id: user?.roleId || 3,
        trangThai: 1,
      });

      // Cập nhật local store (không update email)
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

  // Kiểm tra đăng nhập
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

  return (
    <div className=" p-6 bg-gradient-to-br from-yellow-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-yellow-300">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-100 to-blue-100 p-4 rounded-lg border-2 border-yellow-300">
            <h2 className="text-xl font-semibold text-black">Thông tin tài khoản</h2>
          </div>

          <Card className="p-8 bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-300 shadow-xl">
            <form onSubmit={handlePersonalSubmit} className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={personalData.ten}
                  onChange={(e) => setPersonalData({ ...personalData, ten: e.target.value })}
                  required
                  className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">Email</label>
                <Input
                  type="email"
                  value={personalData.email}
                  disabled={true}
                  className="bg-gray-100 border-2 border-gray-300 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email không thể thay đổi
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">Số điện thoại</label>
                <Input
                  value={personalData.sdt}
                  onChange={(e) => setPersonalData({ ...personalData, sdt: e.target.value })}
                  className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">Ngày sinh</label>
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
                  className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">Tỉnh/Thành phố</label>
                <Select
                  value={selectedProvince}
                  onValueChange={setSelectedProvince}
                  defaultValue={provinces.find(p => p.name === defaultAddress?.thanhPho)?.code}
                >
                  <SelectTrigger className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black">
                    <SelectValue
                      placeholder={defaultAddress?.thanhPho || "Chọn tỉnh/thành phố"}
                      className="text-gray-400"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-yellow-300">
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.code} className="text-black hover:bg-yellow-100">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-black">Xã/Phường</label>
                <Select
                  value={selectedWard}
                  onValueChange={setSelectedWard}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black disabled:bg-gray-100">
                    <SelectValue
                      placeholder={defaultAddress?.xa || "Chọn xã/phường"}
                      className="text-gray-400"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-yellow-300">
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.code} className="text-black hover:bg-yellow-100">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2 text-black">Đường</label>
                <Input
                  value={personalData.duong}
                  onChange={(e) => setPersonalData({ ...personalData, duong: e.target.value })}
                  className="bg-white border-2 border-yellow-300 focus:border-blue-500 text-black placeholder-gray-400"
                  placeholder={defaultAddress?.duong || "Nhập số nhà, tên đường..."}
                />
              </div>

              <div className="col-span-2 flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? "🔄 Đang lưu..." : "💾 Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white border-2 border-yellow-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Xác nhận cập nhật thông tin
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-600">
                <p className="mb-3">
                  Bạn có chắc chắn muốn cập nhật thông tin cá nhân?
                </p>
                <div className="bg-gradient-to-r from-yellow-50 to-blue-50 p-3 rounded-lg text-sm border-2 border-yellow-200">
                  <div className="font-semibold text-black mb-2">Thông tin sẽ được cập nhật:</div>
                  <div className="space-y-1 text-gray-700">
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
            <AlertDialogCancel
              className="bg-white border-2 border-gray-300 text-black hover:bg-gray-50"
              onClick={() => setPendingFormData(null)}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang cập nhật...
                </div>
              ) : (
                "Xác nhận"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}









