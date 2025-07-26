"use client";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThongTinNguoiNhan, useCreateThongTin, useUpdateThongTin, useDeleteThongTin } from "@/hooks/useThongTinTaiKhoan";
import { DTOThongTinNguoiNhan, ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { useUserStore } from "@/context/authStore.store";
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2, Star, User, Phone, Home, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

export default function AddressInfo() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();
  const currentUserId = user?.id;

  const { data: thongTinList = [], isLoading, refetch } = useThongTinNguoiNhan(currentUserId || 0);
  const createMutation = useCreateThongTin();
  const updateMutation = useUpdateThongTin();
  const deleteMutation = useDeleteThongTin();

  // State cho địa chỉ
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [formData, setFormData] = useState<DTOThongTinNguoiNhan>({
    hoTen: "",
    sdt: "",
    duong: "",
    xa: "",
    thanhPho: "",
    isMacDinh: 0,
    idUser: currentUserId || 0,
  });

  // Load địa chỉ data
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const provinceRes = await fetch("/data/province.json");
        const provinceData = await provinceRes.json();

        const wardRes = await fetch("/data/ward.json");
        const wardData = await wardRes.json();

        const wardsByProvince: Record<string, any[]> = {};
        Object.entries(wardData).forEach(([code, ward]: [string, any]) => {
          const provinceCode = ward.parent_code;
          if (!wardsByProvince[provinceCode]) {
            wardsByProvince[provinceCode] = [];
          }
          wardsByProvince[provinceCode].push({ code, ...ward });
        });

        const filteredProvinces = Object.entries(provinceData)
          .filter(([code]) => wardsByProvince[code] && wardsByProvince[code].length > 0)
          .map(([code, info]) => ({
            code,
            ...info,
            wards: wardsByProvince[code] || []
          }));

        setProvinces(filteredProvinces);
      } catch (error) {
        console.error("Error loading address data:", error);
        toast.error("Không thể tải dữ liệu địa chỉ");
      }
    };

    loadAddressData();
  }, []);

  // Update wards khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      const selectedProvinceData = provinces.find(p => p.code === selectedProvince);
      setWards(selectedProvinceData?.wards || []);
    } else {
      setWards([]);
    }
    setSelectedWard("");
  }, [selectedProvince, provinces]);

  // Update formData khi chọn tỉnh/xã
  useEffect(() => {
    const selectedProvinceData = provinces.find(p => p.code === selectedProvince);
    const selectedWardData = wards.find(w => w.code === selectedWard);

    setFormData(prev => ({
      ...prev,
      thanhPho: selectedProvinceData?.name || "",
      xa: selectedWardData?.name || "",
    }));
  }, [selectedProvince, selectedWard, provinces, wards]);

  // Update idUser
  useEffect(() => {
    if (currentUserId) {
      setFormData(prev => ({ ...prev, idUser: currentUserId }));
    }
  }, [currentUserId]);

  // Reset form
  const resetForm = () => {
    setFormData({
      hoTen: "",
      sdt: "",
      duong: "",
      xa: "",
      thanhPho: "",
      isMacDinh: 0,
      idUser: currentUserId || 0,
    });
    setSelectedProvince("");
    setSelectedWard("");
    setShowDialog(false);
    setEditingId(null);
  };

  // Validate form
  const validateForm = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return false;
    }

    if (!formData.hoTen.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.sdt.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!formData.duong.trim()) {
      toast.error("Vui lòng nhập địa chỉ đường");
      return false;
    }

    if (!formData.xa.trim() || !formData.thanhPho.trim()) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return false;
    }

    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editingId) {
        // EDIT MODE
        await updateMutation.mutateAsync({
          id: editingId,
          data: formData
        });
        toast.success("✅ Cập nhật địa chỉ thành công!");
      } else {
        // CREATE MODE
        await createMutation.mutateAsync(formData);
        toast.success("✅ Thêm địa chỉ thành công!");
      }

      resetForm();
      await refetch();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit - chỉnh sửa thông tin mà không thay đổi trạng thái mặc định
  const handleEdit = (item: ThongTinNguoiNhan) => {
    setFormData({
      hoTen: item.hoTen,
      sdt: item.sdt,
      duong: item.duong,
      xa: item.xa,
      thanhPho: item.thanhPho,
      isMacDinh: item.isMacDinh, // Giữ nguyên trạng thái mặc định hiện tại
      idUser: currentUserId || 0
    });

    // Set province và ward
    const province = provinces.find(p => p.name === item.thanhPho);
    if (province) {
      setSelectedProvince(province.code);
      setTimeout(() => {
        const ward = province.wards?.find(w => w.name === item.xa);
        if (ward) {
          setSelectedWard(ward.code);
        }
      }, 100);
    }

    setEditingId(item.id);
    setShowDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("✅ Xóa địa chỉ thành công!");
      await refetch();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Không thể xóa địa chỉ");
    } finally {
      setDeleteId(null);
    }
  };

  // Handle set default - chỉ đặt mặc định, không bỏ
  const handleSetDefault = async (id: number) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const targetAddress = thongTinList.find(item => item.id === id);
      if (!targetAddress) {
        toast.error("Địa chỉ không tồn tại");
        await refetch();
        return;
      }

      if (targetAddress.isMacDinh === 1) {
        toast.info("Địa chỉ này đã là mặc định rồi!");
        return;
      }

      // Chỉ update trạng thái mặc định, giữ nguyên thông tin khác
      await updateMutation.mutateAsync({
        id: id,
        data: {
          hoTen: targetAddress.hoTen,
          sdt: targetAddress.sdt,
          duong: targetAddress.duong,
          xa: targetAddress.xa,
          thanhPho: targetAddress.thanhPho,
          isMacDinh: 1, // Chỉ thay đổi này
          idUser: currentUserId
        }
      });

      toast.success("⭐ Đã đặt làm địa chỉ mặc định!");
      await refetch();
    } catch (error: any) {
      console.error("Set default failed:", error);
      toast.error(error.message || "Không thể đặt làm mặc định");
    }
  };

  // Handle unset default - chỉ bỏ trạng thái mặc định
  const handleUnsetDefault = async (id: number) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const targetAddress = thongTinList.find(item => item.id === id);
      if (!targetAddress) {
        toast.error("Địa chỉ không tồn tại");
        await refetch();
        return;
      }

      // Chỉ update trạng thái mặc định, giữ nguyên thông tin khác
      await updateMutation.mutateAsync({
        id: id,
        data: {
          hoTen: targetAddress.hoTen,
          sdt: targetAddress.sdt,
          duong: targetAddress.duong,
          xa: targetAddress.xa,
          thanhPho: targetAddress.thanhPho,
          isMacDinh: 0, // Chỉ thay đổi này
          idUser: currentUserId
        }
      });

      toast.success("🔄 Đã bỏ địa chỉ mặc định!");
      await refetch();
    } catch (error: any) {
      console.error("Unset default failed:", error);
      toast.error(error.message || "Không thể bỏ mặc định");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-blue-50 border-2 border-yellow-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <MapPin className="h-6 w-6 text-yellow-100" />
          Thông tin địa chỉ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Add button */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Thêm địa chỉ mới
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-gradient-to-br from-yellow-50 to-blue-50 border-2 border-yellow-300">
              <DialogHeader className="bg-gradient-to-r from-yellow-400 to-blue-500 text-white p-4 -m-6 mb-4 rounded-t-lg">
                <DialogTitle className="text-xl font-bold">
                  {editingId ? "✏️ Sửa địa chỉ" : "➕ Thêm địa chỉ mới"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-800">Họ tên</label>
                  <Input
                    value={formData.hoTen}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoTen: e.target.value }))}
                    placeholder="Nhập họ tên"
                    className="border-2 border-gray-500 focus:border-blue-500 bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">Số điện thoại</label>
                  <Input
                    value={formData.sdt}
                    onChange={(e) => setFormData(prev => ({ ...prev, sdt: e.target.value }))}
                    placeholder="Nhập số điện thoại"
                    className="border-2 border-gray-500 focus:border-blue-500 bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">Tỉnh/Thành phố</label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="border-2 border-gray-500  focus:border-blue-500 bg-white text-black">
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-500 text-black">
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code} className="hover:bg-yellow-100">
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">Xã/Phường</label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger className="border-2 border-gray-500 focus:border-blue-500 bg-white text-black">
                      <SelectValue placeholder="Chọn xã/phường" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2border-gray-500 text-black">
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.code} className="hover:bg-yellow-100">
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800">Địa chỉ đường</label>
                  <Input
                    value={formData.duong}
                    onChange={(e) => setFormData(prev => ({ ...prev, duong: e.target.value }))}
                    placeholder="Nhập địa chỉ đường"
                    className="border-2 border-gray-500 focus:border-blue-500 bg-white text-black"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-2 border-gray-400 hover:bg-gray-100 text-gray-700"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                  >
                    {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Address list */}
          <div className="space-y-3">
            {thongTinList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${item.isMacDinh === 1
                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400 shadow-lg"
                  : "bg-white border-gray-300 hover:border-blue-300 hover:shadow-md"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800">{item.hoTen}</h3>
                      {item.isMacDinh === 1 && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold px-2 py-1">
                          ⭐ Mặc định
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">📞 {item.sdt}</p>
                    <p className="text-gray-600">
                      📍 {item.duong}, {item.xa}, {item.thanhPho}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>

                    {item.isMacDinh !== 1 && (
                      <Button
                        size="sm"
                        onClick={() => handleSetDefault(item.id)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-3 py-1"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Đặt mặc định
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(item.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {thongTinList.length === 0 && (
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Chưa có địa chỉ nào</p>
                <p className="text-gray-500 text-sm">Thêm địa chỉ đầu tiên của bạn</p>
              </div>
            )}
          </div>

          {/* Delete confirmation dialog */}
          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-800 font-bold">🗑️ Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription className="text-red-700">
                  Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 pt-4">
                <AlertDialogCancel className="flex-1 border-2 border-gray-400 hover:bg-gray-100">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  Xóa
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}








