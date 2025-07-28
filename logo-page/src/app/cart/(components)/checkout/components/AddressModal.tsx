"use client";
import React, { useState, useEffect } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useThongTinNguoiNhan } from "@/hooks/useThongTinTaiKhoan";
import type { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
// Import các component của shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            fetch("/data/ward.json"),
          ]);

          const provinceData = await provinceRes.json();
          const wardData = await wardRes.json();

          setAllWards(wardData);

          const parentCodes = new Set();
          Object.values(wardData as Record<string, any>).forEach((w: any) => {
            if (w.parent_code) parentCodes.add(w.parent_code);
          });

          const filteredProvinces = Object.entries(
            provinceData as Record<string, any>
          )
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

  const handleSelectAddress = (item: ThongTinNguoiNhan) => {
    // Tìm province theo tên
    const foundProvince = provinces.find((p) => p.name === item.thanhPho);

    let foundWard = null;

    if (foundProvince) {
      const wardsForProvince = Object.entries(allWards as Record<string, any>)
        .filter(([_, info]) => (info as any).parent_code === foundProvince.code)
        .map(([code, info]) => ({ code: Number(code), ...(info as any) }));

      foundWard = wardsForProvince.find((w) => w.name === item.xa);

      if (!foundWard) {
        // Thử tìm ward với tên tương tự
        foundWard = wardsForProvince.find(
          (w) =>
            w.name.toLowerCase().includes(item.xa.toLowerCase()) ||
            item.xa.toLowerCase().includes(w.name.toLowerCase())
        );
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

  // Sử dụng Dialog của shadcn/ui thay thế modal truyền thống
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96 space-y-3 pr-2">
          {thongTinList.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-gray-500">Chưa có địa chỉ nào được lưu</span>
            </div>
          ) : (
            thongTinList.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="w-full p-4 text-left border flex flex-col items-start mb-2"
                onClick={() => handleSelectAddress(item)}
              >
                <div className="flex items-center gap-2 mb-1">
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
              </Button>
            ))
          )}
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}