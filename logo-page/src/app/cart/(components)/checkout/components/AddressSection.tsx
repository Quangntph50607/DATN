"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUserStore } from "@/context/authStore.store";
import { useThongTinNguoiNhan, useCreateThongTin } from "@/hooks/useThongTinTaiKhoan";

// Import Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface AddressSectionProps {
  address: string;
  province: number | null;
  ward: number | null;
  onAddressChange: (value: string) => void;
  onProvinceChange: (value: number | null) => void;
  onWardChange: (value: number | null) => void;
  onShowAddressForm: () => void;
  onShippingFeeChange: (fee: number) => void;
  onDeliveryDaysChange: (days: number) => void;
  products: any[];
  shippingMethod: string;
  onTenNguoiNhanChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  provinces: any[];
  wards: any[];
  allWards: any;
}

export default function AddressSection({
  address,
  province,
  ward,
  onAddressChange,
  onProvinceChange,
  onWardChange,
  onShowAddressForm,
  onTenNguoiNhanChange,
  onPhoneNumberChange,
  provinces,
  wards,
  allWards,
}: AddressSectionProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { data: thongTinList = [], refetch } = useThongTinNguoiNhan(currentUserId || 0);
  const createMutation = useCreateThongTin();

  // Tìm địa chỉ mặc định
  const defaultAddress = thongTinList.find((item) => item.isMacDinh === true);

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    hoTen: "",
    sdt: "",
    duong: "",
    xa: "",
    thanhPho: "",
    selectedProvince: null as number | null,
    selectedWard: null as number | null,
  });

  // Set địa chỉ mặc định khi có dữ liệu
  useEffect(() => {
    if (defaultAddress && provinces.length > 0 && Object.keys(allWards).length > 0) {
      // Set thông tin người nhận
      onTenNguoiNhanChange(defaultAddress.hoTen);
      onPhoneNumberChange(defaultAddress.sdt);
      onAddressChange(defaultAddress.duong);

      // Tìm province theo tên
      const foundProvince = provinces.find((p) => p.name === defaultAddress.thanhPho);

      if (foundProvince) {
        onProvinceChange(foundProvince.code);

        // Tìm ward ngay lập tức
        const wardsForProvince = Object.entries(allWards as Record<string, any>)
          .filter(([_, info]) => (info as any).parent_code === foundProvince.code)
          .map(([code, info]) => ({ code: Number(code), ...(info as any) }));

        const foundWard = wardsForProvince.find((w) => w.name === defaultAddress.xa);

        if (foundWard) {
          // Delay nhỏ để đảm bảo province được set trước
          setTimeout(() => {
            onWardChange(foundWard.code);
          }, 50);
        } else {
          // Thử tìm ward với tên tương tự
          const similarWard = wardsForProvince.find((w) =>
            w.name.toLowerCase().includes(defaultAddress.xa.toLowerCase()) ||
            defaultAddress.xa.toLowerCase().includes(w.name.toLowerCase())
          );
          if (similarWard) {
            setTimeout(() => {
              onWardChange(similarWard.code);
            }, 50);
          }
        }
      }
    }
  }, [defaultAddress, provinces, allWards, onTenNguoiNhanChange, onPhoneNumberChange, onAddressChange, onProvinceChange, onWardChange]);

  // Update new address form khi chọn province/ward
  useEffect(() => {
    if (newAddressData.selectedProvince) {
      const selectedProvinceData = provinces.find(p => p.code === newAddressData.selectedProvince);
      setNewAddressData(prev => ({
        ...prev,
        thanhPho: selectedProvinceData?.name || "",
      }));
    }
  }, [newAddressData.selectedProvince, provinces]);

  useEffect(() => {
    if (newAddressData.selectedWard) {
      const selectedWardData = Object.entries(allWards)
        .filter(([_, info]) => (info as any).parent_code === newAddressData.selectedProvince)
        .map(([code, info]) => ({ code: Number(code), ...(info as any) }))
        .find(w => w.code === newAddressData.selectedWard);
      setNewAddressData(prev => ({
        ...prev,
        xa: selectedWardData?.name,
      }));
    }
  }, [newAddressData.selectedWard, newAddressData.selectedProvince, allWards]);

  const validateNewAddress = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return false;
    }
    if (!newAddressData.hoTen.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }
    if (!newAddressData.sdt.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!newAddressData.duong.trim()) {
      toast.error("Vui lòng nhập địa chỉ đường");
      return false;
    }
    if (!newAddressData.selectedProvince || !newAddressData.selectedWard) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return false;
    }
    return true;
  };

  const handleAddNewAddress = async () => {
    if (!validateNewAddress()) return;
    setIsAddingAddress(true);

    try {
      const addressData = {
        hoTen: newAddressData.hoTen.trim(),
        sdt: newAddressData.sdt.trim(),
        duong: newAddressData.duong.trim(),
        xa: newAddressData.xa.trim(),
        thanhPho: newAddressData.thanhPho.trim(),
        isMacDinh: 0,
        idUser: currentUserId || 0,
      };

      const newAddress = await createMutation.mutateAsync(addressData);
      toast.success("✅ Thêm địa chỉ thành công!");
      await refetch();

      // Auto select new address
      onTenNguoiNhanChange(newAddress.hoTen);
      onPhoneNumberChange(newAddress.sdt);
      onAddressChange(newAddress.duong);

      const foundProvince = provinces.find((p) => p.name === newAddress.thanhPho);
      if (foundProvince) {
        onProvinceChange(foundProvince.code);
        const wardsForProvince = Object.entries(allWards as Record<string, any>)
          .filter(([_, info]) => (info as any).parent_code === foundProvince.code)
          .map(([code, info]) => ({ code: Number(code), ...(info as any) }));
        const foundWard = wardsForProvince.find((w) => w.name === newAddress.xa);
        if (foundWard) {
          onWardChange(foundWard.code);
        }
      }

      // Reset form
      setNewAddressData({
        hoTen: "",
        sdt: "",
        duong: "",
        xa: "",
        thanhPho: "",
        selectedProvince: null,
        selectedWard: null,
      });
      setShowNewAddressForm(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm địa chỉ mới");
    } finally {
      setIsAddingAddress(false);
    }
  };

  return (
    <Card className="p-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">📍</span>
          <h2 className="text-lg font-semibold">Địa chỉ thanh toán</h2>
        </div>

        {/* Quick Address Selection */}
        <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📍</span>
              <span className="text-sm">
                {defaultAddress ?
                  `Địa chỉ mặc định: ${defaultAddress.hoTen} - ${defaultAddress.duong}, ${defaultAddress.xa}, ${defaultAddress.thanhPho}` :
                  "Chọn từ sổ địa chỉ có sẵn"
                }
              </span>
            </div>
            <Button
              variant="outline"
              onClick={onShowAddressForm}
              className="text-blue-700 border-blue-300 hover:bg-blue-50 bg-white"
              size="sm"
            >
              Chọn địa chỉ
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className="text-black bg-white"
              placeholder="Số nhà, tên đường"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <Select
                value={province ? String(province) : ""}
                onValueChange={val => onProvinceChange(val ? Number(val) : null)}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={String(p.code)} className="text-black">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <Select
                value={ward ? String(ward) : ""}
                onValueChange={val => onWardChange(val ? Number(val) : null)}
                disabled={!province}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {wards.map((w) => (
                    <SelectItem key={w.code} value={String(w.code)} className="text-black">
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form thêm địa chỉ mới */}
          <div className="border-t border-gray-200 pt-4">
            <Button
              variant="ghost"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium px-0 bg-white"
              onClick={() => setShowNewAddressForm(!showNewAddressForm)}
            >
              + Thêm địa chỉ mới
            </Button>

            {showNewAddressForm && (
              <div className="mt-4 p-4 bg-white rounded-lg space-y-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newAddressData.hoTen}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, hoTen: e.target.value }))}
                      placeholder="Nhập họ tên"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newAddressData.sdt}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, sdt: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                      className="bg-white text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newAddressData.duong}
                    onChange={(e) => setNewAddressData(prev => ({ ...prev, duong: e.target.value }))}
                    placeholder="Số nhà, tên đường"
                    className="bg-white text-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={newAddressData.selectedProvince ? String(newAddressData.selectedProvince) : ""}
                      onValueChange={val =>
                        setNewAddressData(prev => ({
                          ...prev,
                          selectedProvince: val ? Number(val) : null,
                          selectedWard: null
                        }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white text-black">
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {provinces.map((p) => (
                          <SelectItem key={p.code} value={String(p.code)} className="text-black">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={newAddressData.selectedWard ? String(newAddressData.selectedWard) : ""}
                      onValueChange={val =>
                        setNewAddressData(prev => ({
                          ...prev,
                          selectedWard: val ? Number(val) : null
                        }))
                      }
                      disabled={!newAddressData.selectedProvince}
                    >
                      <SelectTrigger className="w-full bg-white text-black">
                        <SelectValue placeholder="Chọn phường/xã" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {newAddressData.selectedProvince &&
                          Object.entries(allWards as Record<string, any>)
                            .filter(([_, info]) => (info as any).parent_code === newAddressData.selectedProvince)
                            .map(([code, info]) => (
                              <SelectItem key={code} value={String(code)} className="text-black">
                                {(info as any).name}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNewAddress}
                    disabled={isAddingAddress}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    {isAddingAddress ? "Đang thêm..." : "Thêm địa chỉ"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewAddressForm(false)}
                    className="bg-white text-black"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}