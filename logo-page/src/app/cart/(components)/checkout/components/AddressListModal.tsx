"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import {
  Plus,
  Pencil,
  MapPin,
  User,
  Phone,
  Star,
  Check,
  X,
} from "lucide-react";
import AddressForm from "./AddressForm";

export default function AddressListModal({
  open,
  onOpenChange,
  addresses,
  defaultId,
  onSelect,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: ThongTinNguoiNhan[];
  defaultId?: number;
  onSelect: (id: number) => void;
  onConfirm: () => void;
}) {
  const [selectedId, setSelectedId] = useState(defaultId || 0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<ThongTinNguoiNhan | null>(null);

  const handleEditClick = (address: ThongTinNguoiNhan) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <>
      {/* Main Address Selection Modal */}
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Chọn địa chỉ giao hàng"
        className="w-full max-w-lg bg-white text-black rounded-xl mx-4"
      >
        <div className="p-4 md:p-6">
          {/* Address List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 md:pr-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 cursor-pointer group ${
                  selectedId === addr.id
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-gray-200 hover:border-orange-300"
                }`}
                onClick={() => {
                  setSelectedId(addr.id ?? 0);
                  onSelect(addr.id ?? 0);
                }}
              >
                {/* Radio Button */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4">
                  <div
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedId === addr.id
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300 group-hover:border-orange-400"
                    }`}
                  >
                    {selectedId === addr.id && (
                      <Check
                        className="w-2.5 h-2.5 md:w-3 md:h-3 text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>

                {/* Address Content */}
                <div className="pr-6 md:pr-8 space-y-2">
                  {/* Name and Phone */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1 md:gap-2">
                      <User
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm md:text-base font-medium text-gray-900">
                        {addr.hoTen}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Phone
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500"
                        strokeWidth={2.5}
                      />
                      <span className="text-xs md:text-sm text-gray-700">
                        {addr.sdt}
                      </span>
                    </div>
                    {addr.isMacDinh === 1 && (
                      <div className="ml-2 flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 bg-orange-100 text-orange-800 text-[10px] md:text-xs rounded-full">
                        <Star
                          className="w-2.5 h-2.5 md:w-3 md:h-3"
                          strokeWidth={2.5}
                        />
                        Mặc định
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 leading-relaxed">
                    <MapPin
                      className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500 mt-0.5 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <span>
                      {addr.duong}, {addr.xa}, {addr.thanhPho}
                    </span>
                  </div>
                </div>
                {/* Edit Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(addr);
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-9 md:top-4 md:right-12 p-1 h-6 w-6 md:h-7 md:w-7 hover:text-orange-600 rounded-full"
                  aria-label="Edit address"
                >
                  <Pencil className="size-3 md:size-4" />
                </Button>
              </div>
            ))}

            {/* Add New Address Button */}
            <Button
              className="w-full py-2.5 md:py-3.5 border-2 border-dashed border-gray-300 hover:border-orange-400 bg-white text-gray-700 hover:text-orange-600 rounded-lg font-medium transition-colors text-sm md:text-base"
              onClick={handleAddNewAddress}
            >
              <Plus
                className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2"
                strokeWidth={2.5}
              />
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 pt-4 md:pt-5 border-t">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1 h-9 md:h-11 font-medium shadow-sm hover:shadow-md transition-shadow text-sm md:text-base"
              onClick={onConfirm}
              disabled={!selectedId}
            >
              <Check
                className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2"
                strokeWidth={2.5}
              />
              Xác nhận
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="h-9 md:h-11 font-medium flex-1 border-gray-300 hover:bg-gray-400 text-sm md:text-base"
            >
              <X
                className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2"
                strokeWidth={2.5}
              />
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Address Form Modal */}
      <Modal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingAddress(null);
          setIsFormModalOpen(open);
        }}
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        className="w-full max-w-md md:max-w-2xl bg-white text-black rounded-xl mx-4"
      >
        <div className="p-4 md:p-6">
          <AddressForm
            editing={editingAddress}
            setEditing={setEditingAddress}
            onSuccess={handleFormSuccess}
          />
        </div>
      </Modal>
    </>
  );
}
