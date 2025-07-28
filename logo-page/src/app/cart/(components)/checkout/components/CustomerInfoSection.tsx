import React from 'react';

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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-500">👤</span>
        <h2 className="text-lg font-semibold text-black">Thông tin khách hàng</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={tenNguoiNhan}
            onChange={(e) => onTenNguoiNhanChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="01 234 567 789"
          />
        </div>
      </div>
    </div>
  );
}