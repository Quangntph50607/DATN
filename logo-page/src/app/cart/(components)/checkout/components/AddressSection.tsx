"use client";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/context/authStore.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useThongTinNguoiNhan } from "@/hooks/useThongTinNguoiNhan";
import AddressListModal from "./AddressListModal";
import { MapPin, Phone, User, PlusCircle } from "lucide-react";
import { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import AddressForm from "./AddressForm";
import { Skeleton } from "@/components/ui/skeleton";
interface AddressSectionProps {
  onAddressChange?: (address: ThongTinNguoiNhan | null) => void;
}
export default function AddressSection({
  onAddressChange,
}: AddressSectionProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { data: thongTinList = [], isLoading } = useThongTinNguoiNhan(
    currentUserId || 0
  );

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<ThongTinNguoiNhan | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  const defaultAddress = thongTinList.find(
    (item) => item.isMacDinh === 1 || item.isMacDinh === true
  );
  const displayAddress =
    thongTinList.find((item) => item.id === selectedAddressId) ||
    defaultAddress;

  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(displayAddress || null);
    }
  }, [displayAddress, onAddressChange]);
  function handleFormSuccess() {
    setIsFormModalOpen(false);
    setEditing(null);
  }

  return (
    <Card className="border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Địa chỉ giao hàng
            </h2>
          </div>
          {thongTinList.length > 0 && (
            <Button
              size="sm"
              onClick={() => setIsListModalOpen(true)}
              className="text-orange-600 hover:bg-orange-300 bg-orange-200"
            >
              Thay đổi
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        ) : thongTinList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <MapPin className="h-10 w-10 text-gray-400" />
            <p className="text-gray-500 text-center">
              Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ để tiếp tục.
            </p>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2"
              onClick={() => setIsFormModalOpen(true)}
            >
              <PlusCircle className="h-5 w-5" />
              Thêm địa chỉ mới
            </Button>
          </div>
        ) : (
          displayAddress && (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900">
                    {displayAddress.hoTen}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">{displayAddress.sdt}</span>
                </div>
                <div className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Mặc định
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>
                  {displayAddress.duong}, {displayAddress.xa} ,
                  {displayAddress.thanhPho}
                </span>
              </div>
            </div>
          )
        )}
      </CardContent>

      {/* Address List Modal */}
      <AddressListModal
        open={isListModalOpen}
        onOpenChange={setIsListModalOpen}
        addresses={thongTinList}
        defaultId={defaultAddress?.id}
        onSelect={(id) => setSelectedAddressId(id)}
        onConfirm={() => setIsListModalOpen(false)}
      />

      {/* Address Form Modal */}
      <Modal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
          setIsFormModalOpen(open);
        }}
        title={editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        className="max-w-2xl bg-white text-black rounded-xl"
      >
        <div className="p-6">
          <AddressForm
            editing={editing}
            setEditing={setEditing}
            onSuccess={handleFormSuccess}
          />
        </div>
      </Modal>
    </Card>
  );
}
