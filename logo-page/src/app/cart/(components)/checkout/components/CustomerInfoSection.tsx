import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheckIcon, UserCircle2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useThongTinNguoiNhan } from "@/hooks/useThongTinTaiKhoan";
import { useUserStore } from "@/context/authStore.store";

interface CustomerInfoSectionProps {
  tenNguoiNhan: string;
  phoneNumber: string;
  onTenNguoiNhanChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

export default function CustomerInfoSection({
  tenNguoiNhan,
  phoneNumber,
  onTenNguoiNhanChange,
  onPhoneNumberChange,
}: CustomerInfoSectionProps) {
  return (
    <Card className="p-6 border-gray-200 bg-white text-black">
      <CardContent className="p-0 bg-white text-black">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-500">
            <UserCircle2Icon />
          </span>
          <h2 className="text-lg font-semibold">Thông tin khách hàng</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={tenNguoiNhan}
              onChange={(e) => onTenNguoiNhanChange(e.target.value)}
              placeholder="Nguyễn Văn A"
              className=" border border-gray-400 text-black"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              placeholder="012345678"
              className="border border-gray-400 text-black"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
