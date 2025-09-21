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

  // State cho guest checkout
  const [isGuestMode, setIsGuestMode] = useState(!user);
  const [guestAddress, setGuestAddress] = useState<ThongTinNguoiNhan | null>(
    null
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
  const displayAddress = isGuestMode
    ? guestAddress
    : thongTinList.find((item) => item.id === selectedAddressId) ||
      defaultAddress;

  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(displayAddress || null);
    }
  }, [displayAddress, onAddressChange]);

  // Cập nhật guest mode khi user thay đổi
  useEffect(() => {
    setIsGuestMode(!user);
  }, [user]);

  function handleFormSuccess() {
    setIsFormModalOpen(false);
    setEditing(null);
  }

  function handleGuestAddressSuccess(address?: ThongTinNguoiNhan) {
    if (address) {
      setGuestAddress(address);
    }
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
            {isGuestMode && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Mua hàng không cần đăng nhập
              </span>
            )}
          </div>
          {!isGuestMode && thongTinList.length > 0 && (
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
        ) : isGuestMode ? (
          <div>
            {/* Thông báo guest checkout */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Mua hàng không cần đăng nhập
                  </h3>
                  <p className="text-sm text-blue-700">
                    Bạn có thể đặt hàng mà không cần tạo tài khoản. Chỉ cần nhập
                    thông tin giao hàng để tiếp tục.
                  </p>
                </div>
              </div>
            </div>
            {/* Guest mode - hiển thị form nhập địa chỉ trực tiếp */}
            {guestAddress ? (
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-900">
                      {guestAddress.hoTen}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">{guestAddress.sdt}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Khách
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    {guestAddress.duong}, {guestAddress.xa} ,
                    {guestAddress.thanhPho}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsFormModalOpen(true)}
                  className="text-orange-600 hover:bg-orange-300 border-orange-200"
                >
                  Thay đổi địa chỉ
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MapPin className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500 text-center">
                  Vui lòng nhập địa chỉ giao hàng để tiếp tục.
                </p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2"
                  onClick={() => setIsFormModalOpen(true)}
                >
                  <PlusCircle className="h-5 w-5" />
                  Nhập địa chỉ giao hàng
                </Button>
              </div>
            )}
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
        title={
          editing
            ? "Chỉnh sửa địa chỉ"
            : isGuestMode
            ? "Nhập địa chỉ giao hàng"
            : "Thêm địa chỉ mới"
        }
        className="max-w-2xl bg-white text-black rounded-xl"
      >
        <div className="p-6">
          <AddressForm
            editing={editing}
            setEditing={setEditing}
            onSuccess={
              isGuestMode ? handleGuestAddressSuccess : handleFormSuccess
            }
            isGuestMode={isGuestMode}
          />
        </div>
      </Modal>
    </Card>
  );
}
