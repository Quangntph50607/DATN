"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUserStore } from "@/context/authStore.store";
import { useThongTinNguoiNhan, useCreateThongTin } from "@/hooks/useThongTinTaiKhoan";
import { HoaDonService } from "@/services/hoaDonService";
import { ShippingCalculator } from "@/utils/shippingCalculator";

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
}

export default function AddressSection({
  address,
  province,
  ward,
  onAddressChange,
  onProvinceChange,
  onWardChange,
  onShowAddressForm,
  onShippingFeeChange,
  onDeliveryDaysChange,
  products,
  shippingMethod,
  onTenNguoiNhanChange,
  onPhoneNumberChange,
}: AddressSectionProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { data: thongTinList = [], refetch } = useThongTinNguoiNhan(currentUserId || 0);
  const createMutation = useCreateThongTin();

  // Tìm địa chỉ mặc định
  const defaultAddress = thongTinList.find((item) => item.isMacDinh === 1);

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [allWards, setAllWards] = useState<any>({});
  const [newAddressData, setNewAddressData] = useState({
    hoTen: "",
    sdt: "",
    duong: "",
    xa: "",
    thanhPho: "",
    selectedProvince: null as number | null,
    selectedWard: null as number | null,
  });

  // Load provinces và wards data
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [provinceRes, wardRes] = await Promise.all([
          fetch("/data/province.json"),
          fetch("/data/ward.json")
        ]);

        const provinceData = await provinceRes.json();
        const wardData = await wardRes.json();

        setAllWards(wardData);

        // Lọc provinces có wards
        const parentCodes = new Set();
        Object.values(wardData as Record<string, any>).forEach((w: any) => {
          if (w.parent_code) parentCodes.add(w.parent_code);
        });

        const filteredProvinces = Object.entries(provinceData as Record<string, any>)
          .filter(([code]) => parentCodes.has(code))
          .map(([code, info]) => ({ code: Number(code), ...info }));

        setProvinces(filteredProvinces);
      } catch (error) {
        console.error("Error loading location data:", error);
        toast.error("Không thể tải dữ liệu tỉnh/thành phố");
      }
    };

    loadLocationData();
  }, []);

  // Set địa chỉ mặc định khi có dữ liệu
  useEffect(() => {
    if (defaultAddress && provinces.length > 0 && Object.keys(allWards).length > 0) {
      console.log("Setting default address:", defaultAddress);
      console.log("Available provinces:", provinces);
      console.log("Available wards:", allWards);

      // Set thông tin người nhận
      onTenNguoiNhanChange(defaultAddress.hoTen);
      onPhoneNumberChange(defaultAddress.sdt);
      onAddressChange(defaultAddress.duong);

      // Tìm province theo tên
      const foundProvince = provinces.find((p) => p.name === defaultAddress.thanhPho);
      console.log("Found province:", foundProvince);

      if (foundProvince) {
        onProvinceChange(foundProvince.code);

        // Tìm ward ngay lập tức
        const wardsForProvince = Object.entries(allWards as Record<string, any>)
          .filter(([_, info]) => (info as any).parent_code === foundProvince.code)
          .map(([code, info]) => ({ code: Number(code), ...(info as any) }));

        console.log("Wards for province:", wardsForProvince);
        console.log("Looking for ward:", defaultAddress.xa);

        const foundWard = wardsForProvince.find((w) => w.name === defaultAddress.xa);
        console.log("Found ward:", foundWard);

        if (foundWard) {
          // Delay nhỏ để đảm bảo province được set trước
          setTimeout(() => {
            onWardChange(foundWard.code);
          }, 50);
        } else {
          console.warn("Ward not found:", defaultAddress.xa);
          // Thử tìm ward với tên tương tự
          const similarWard = wardsForProvince.find((w) =>
            w.name.toLowerCase().includes(defaultAddress.xa.toLowerCase()) ||
            defaultAddress.xa.toLowerCase().includes(w.name.toLowerCase())
          );
          if (similarWard) {
            console.log("Found similar ward:", similarWard);
            setTimeout(() => {
              onWardChange(similarWard.code);
            }, 50);
          }
        }
      } else {
        console.warn("Province not found:", defaultAddress.thanhPho);
      }
    }
  }, [defaultAddress, provinces, allWards, onTenNguoiNhanChange, onPhoneNumberChange, onAddressChange, onProvinceChange, onWardChange]);

  // Update wards khi province thay đổi
  useEffect(() => {
    if (province && allWards) {
      const wardsArr = Object.entries(allWards as Record<string, any>)
        .filter(([_, info]) => (info as any).parent_code === province)
        .map(([code, info]) => ({ code: Number(code), ...(info as any) }));

      console.log("Updated wards for province", province, ":", wardsArr);
      setWards(wardsArr);
    } else {
      setWards([]);
    }
  }, [province, allWards]);

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
      const selectedWardData = wards.find(w => w.code === newAddressData.selectedWard);
      setNewAddressData(prev => ({
        ...prev,
        xa: selectedWardData?.name || "",
      }));
    }
  }, [newAddressData.selectedWard, wards]);

  // Tính phí ship
  useEffect(() => {
    if (!province || !ward || !address) {
      onShippingFeeChange(0);
      onDeliveryDaysChange(0);
      return;
    }

    const provinceName = provinces.find((p) => p.code === province)?.name || "";
    const wardName = wards.find((w) => w.code === ward)?.name || "";
    const isFast = shippingMethod === "Nhanh" ? 1 : 0;
    const totalWeight = products.reduce((sum, p) => sum + (p.quantity * 0.5), 0);

    const result = ShippingCalculator.calculateShipping(
      address,
      wardName,
      provinceName,
      isFast,
      totalWeight
    );

    onShippingFeeChange(result.phiShip);
    onDeliveryDaysChange(result.soNgayGiao);

    console.log("AddressSection - Phí ship:", result);
  }, [province, ward, address, shippingMethod, provinces, wards, products]);

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

  // Thêm vào cuối component, trước return
  const debugInfo = () => {
    if (defaultAddress) {
      console.log("=== DEBUG INFO ===");
      console.log("Default address:", defaultAddress);
      console.log("Current province:", province);
      console.log("Current ward:", ward);
      console.log("Available provinces:", provinces.map(p => ({ code: p.code, name: p.name })));
      console.log("Available wards:", wards.map(w => ({ code: w.code, name: w.name })));
      console.log("All wards sample:", Object.entries(allWards).slice(0, 5));
    }
  };

  // Gọi debug khi cần
  useEffect(() => {
    if (defaultAddress && provinces.length > 0) {
      debugInfo();
    }
  }, [defaultAddress, provinces, wards]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-500">📍</span>
        <h2 className="text-lg font-semibold text-black">Địa chỉ thanh toán</h2>
      </div>

      {/* Quick Address Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📍</span>
            <span className="text-sm text-gray-700">
              {defaultAddress ?
                `Địa chỉ mặc định: ${defaultAddress.hoTen} - ${defaultAddress.duong}, ${defaultAddress.xa}, ${defaultAddress.thanhPho}` :
                "Chọn từ sổ địa chỉ có sẵn"
              }
            </span>
          </div>
          <button
            onClick={onShowAddressForm}
            className="px-3 py-1 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded text-sm"
          >
            Chọn địa chỉ
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Số nhà, tên đường"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={province || ""}
              onChange={(e) => onProvinceChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code} className="text-black">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              value={ward || ""}
              onChange={(e) => onWardChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={!province}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code} className="text-black">
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form thêm địa chỉ mới */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowNewAddressForm(!showNewAddressForm)}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            + Thêm địa chỉ mới
          </button>

          {showNewAddressForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressData.hoTen}
                    onChange={(e) => setNewAddressData(prev => ({ ...prev, hoTen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressData.sdt}
                    onChange={(e) => setNewAddressData(prev => ({ ...prev, sdt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressData.duong}
                  onChange={(e) => setNewAddressData(prev => ({ ...prev, duong: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Số nhà, tên đường"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAddressData.selectedProvince || ""}
                    onChange={(e) => setNewAddressData(prev => ({
                      ...prev,
                      selectedProvince: e.target.value ? Number(e.target.value) : null,
                      selectedWard: null
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code} className="text-black">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAddressData.selectedWard || ""}
                    onChange={(e) => setNewAddressData(prev => ({
                      ...prev,
                      selectedWard: e.target.value ? Number(e.target.value) : null
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={!newAddressData.selectedProvince}
                  >
                    <option value="">Chọn phường/xã</option>
                    {newAddressData.selectedProvince &&
                      Object.entries(allWards as Record<string, any>)
                        .filter(([_, info]) => (info as any).parent_code === newAddressData.selectedProvince)
                        .map(([code, info]) => (
                          <option key={code} value={code} className="text-black">
                            {(info as any).name}
                          </option>
                        ))
                    }
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddNewAddress}
                  disabled={isAddingAddress}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {isAddingAddress ? "Đang thêm..." : "Thêm địa chỉ"}
                </button>
                <button
                  onClick={() => setShowNewAddressForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





