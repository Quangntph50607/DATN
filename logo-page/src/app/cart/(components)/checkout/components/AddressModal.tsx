"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useThongTinNguoiNhan } from "@/hooks/useThongTinTaiKhoan";
import type { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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

interface Province {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
  parent_code: string;
}

export default function AddressModal({
  show,
  onClose,
  onAddressSelect,
}: AddressModalProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { data: thongTinList = [] } = useThongTinNguoiNhan(currentUserId || 0);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allWards, setAllWards] = useState<Record<string, Ward>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;

    let isMounted = true;
    const loadLocationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [provinceRes, wardRes] = await Promise.all([
          fetch("/data/province.json"),
          fetch("/data/ward.json"),
        ]);

        if (!provinceRes.ok || !wardRes.ok) {
          throw new Error("Failed to fetch location data");
        }

        const provinceData = await provinceRes.json();
        const wardData = await wardRes.json();

        if (isMounted) {
          setAllWards(wardData);

          const parentCodes = new Set<string>();
          Object.values(wardData as Record<string, Ward>).forEach((w) => {
            if (w.parent_code) parentCodes.add(w.parent_code);
          });

          const filteredProvinces = Object.entries(
            provinceData as Record<string, Province>
          )
            .filter(([code]) => parentCodes.has(code))
            .map(([code, info]) => ({ ...info, code: Number(code) }));

          setProvinces(filteredProvinces);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading location data:", error);
          setError("Không thể tải dữ liệu địa chỉ. Vui lòng thử lại.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadLocationData();

    return () => {
      isMounted = false;
    };
  }, [show]);

  const handleSelectAddress = useCallback(
    (item: ThongTinNguoiNhan) => {
      const foundProvince = provinces.find((p) => p.name === item.thanhPho);
      let foundWard: Ward | null = null;

      if (foundProvince) {
        const wardsForProvince = Object.values(allWards).filter(
          (w) => w.parent_code === foundProvince.code.toString()
        );

        foundWard = wardsForProvince.find((w) => w.name === item.xa) || null;

        if (!foundWard) {
          foundWard =
            wardsForProvince.find(
              (w) =>
                w.name.toLowerCase().includes(item.xa.toLowerCase()) ||
                item.xa.toLowerCase().includes(w.name.toLowerCase())
            ) || null;
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
    },
    [provinces, allWards, onAddressSelect, onClose]
  );

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Chọn địa chỉ giao hàng
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] px-6 py-2 bg-gray-50 ">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-red-500">{error}</span>
            </div>
          ) : thongTinList.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-gray-600">
                Chưa có địa chỉ nào được lưu
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {thongTinList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4  rounded-lg cursor-pointer border  border-orange-500 transition-all duration-200 ${
                    item.isMacDinh === true
                      ? "border-orange-300 bg-orange-50 hover:bg-orange-200"
                      : "border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300"
                  }`}
                  onClick={() => handleSelectAddress(item)}
                >
                  <div className="flex items-start justify-between ">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {item.hoTen}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-700 font-medium">
                          {item.sdt}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {item.duong}, {item.xa}, {item.thanhPho}
                      </div>
                    </div>
                    {item.isMacDinh && (
                      <div className="ml-3 flex flex-col items-end gap-1">
                        <span className="px-3 py-1 bg-orange-500 text-black text-xs font-medium rounded-full whitespace-nowrap">
                          Địa chỉ mặc định
                        </span>
                        <span className="text-orange-600 text-xs font-medium">
                          Ưu tiên
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-white">
          <DialogClose asChild>
            <Button
              className="h-12 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
              onClick={onClose}
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
