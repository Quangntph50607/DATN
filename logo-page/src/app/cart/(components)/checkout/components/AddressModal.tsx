"use client";
import React, { useState, useEffect } from 'react';
import { useUserStore } from "@/context/authStore.store";
import { useThongTinNguoiNhan } from "@/hooks/useThongTinTaiKhoan";
import type { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";

interface AddressModalProps {
  show: boolean;
  onClose: () => void;
  onAddressSelect: (addressData: {
    address: string;
    province: number | null;
    ward: number | null;
    tenNguoiNhan: string;
    phoneNumber: string;
  }) => void;
}

export default function AddressModal({
  show,
  onClose,
  onAddressSelect,
}: AddressModalProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { data: thongTinList = [] } = useThongTinNguoiNhan(currentUserId || 0);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [allWards, setAllWards] = useState<any>({});

  // Load location data
  useEffect(() => {
    if (show) {
      const loadLocationData = async () => {
        try {
          const [provinceRes, wardRes] = await Promise.all([
            fetch("/data/province.json"),
            fetch("/data/ward.json")
          ]);

          const provinceData = await provinceRes.json();
          const wardData = await wardRes.json();

          setAllWards(wardData);

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
        }
      };

      loadLocationData();
    }
  }, [show]);

  if (!show) return null;

  const handleSelectAddress = (item: ThongTinNguoiNhan) => {
    console.log("Selecting address:", item);
    console.log("Available provinces:", provinces);
    console.log("Available wards:", allWards);

    // Tìm province theo tên
    const foundProvince = provinces.find((p) => p.name === item.thanhPho);
    console.log("Found province:", foundProvince);

    let foundWard = null;

    if (foundProvince) {
      const wardsForProvince = Object.entries(allWards as Record<string, any>)
        .filter(([_, info]) => (info as any).parent_code === foundProvince.code)
        .map(([code, info]) => ({ code: Number(code), ...(info as any) }));

      console.log("Wards for province:", wardsForProvince);
      console.log("Looking for ward:", item.xa);

      foundWard = wardsForProvince.find((w) => w.name === item.xa);
      console.log("Found ward:", foundWard);

      if (!foundWard) {
        // Thử tìm ward với tên tương tự
        foundWard = wardsForProvince.find((w) =>
          w.name.toLowerCase().includes(item.xa.toLowerCase()) ||
          item.xa.toLowerCase().includes(w.name.toLowerCase())
        );
        console.log("Found similar ward:", foundWard);
      }
    }

    onAddressSelect({
      address: item.duong,
      province: foundProvince ? foundProvince.code : null,
      ward: foundWard ? foundWard.code : null,
      tenNguoiNhan: item.hoTen,
      phoneNumber: item.sdt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-black mb-4">Chọn địa chỉ giao hàng</h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {thongTinList.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-gray-500">Chưa có địa chỉ nào được lưu</span>
            </div>
          ) : (
            thongTinList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectAddress(item)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-black">{item.hoTen}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-600">{item.sdt}</span>
                      {item.isMacDinh === 1 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {item.duong}, {item.xa}, {item.thanhPho}
                    </div>
                  </div>
                  <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                    Chọn
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

