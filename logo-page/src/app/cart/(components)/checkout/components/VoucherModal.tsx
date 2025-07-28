"use client";
import React, { useState } from 'react';
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";

interface VoucherModalProps {
  show: boolean;
  onClose: () => void;
  onVoucherSelect: (voucher: PhieuGiamGia | null) => void;
  onDiscountChange: (discount: number) => void;
  total: number;
}

export default function VoucherModal({
  show,
  onClose,
  onVoucherSelect,
  onDiscountChange,
  total,
}: VoucherModalProps) {
  const [voucherInput, setVoucherInput] = useState("");
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");
  const { data: voucherList = [], isLoading: loadingVouchers } = useGetPhieuGiam();

  if (!show) return null;

  const handleApplyVoucher = () => {
    const v = voucherList.find(
      (v) => v.maPhieu?.toLowerCase() === voucherInput.trim().toLowerCase()
    );
    if (v) {
      onVoucherSelect(v);
      if (v.loaiPhieuGiam === "Theo %") onDiscountChange((v.giaTriGiam || 0) / 100);
      else if (v.loaiPhieuGiam === "Theo số tiền") onDiscountChange(v.giaTriGiam || 0);
    } else {
      onDiscountChange(0);
      onVoucherSelect(null);
    }
    onClose();
    setVoucherInput("");
  };

  const handleSelectVoucherRadio = (code: string) => {
    setSelectedVoucherCode(code);
  };

  const handleOkVoucher = () => {
    const v = voucherList.find((v) => v.maPhieu === selectedVoucherCode);
    if (v) {
      onVoucherSelect(v);
      if (v.loaiPhieuGiam === "Theo %") onDiscountChange((v.giaTriGiam || 0) / 100);
      else if (v.loaiPhieuGiam === "Theo số tiền") onDiscountChange(v.giaTriGiam || 0);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-black mb-4">Chọn Voucher</h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            placeholder="Mã Voucher"
            className="border border-gray-300 rounded px-3 py-2 flex-1 text-black bg-white"
          />
          <button
            onClick={handleApplyVoucher}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Áp dụng
          </button>
        </div>

        <div className="mb-2 font-semibold text-black">Danh sách Voucher</div>
        <div className="max-h-60 overflow-y-auto">
          {loadingVouchers ? (
            <div className="text-center text-gray-500 py-4">
              Đang tải phiếu giảm giá...
            </div>
          ) : (
            voucherList.map((v) => {
              const notEnough = total < (v.giaTriToiThieu || 0);
              return (
                <label
                  key={v.id}
                  className={`flex items-center gap-3 border rounded-lg p-3 mb-2 cursor-pointer transition ${selectedVoucherCode === v.maPhieu
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                    } ${notEnough ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl">🧧</span>
                  <div className="flex-1">
                    <div className="font-bold text-orange-600">
                      {v.tenPhieu}
                    </div>
                    <div className="text-xs text-gray-500">
                      HSD: {v.ngayKetThuc || "31.12.2025"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {v.loaiPhieuGiam === "Theo %"
                        ? `Giảm ${v.giaTriGiam}%`
                        : `Giảm ${v.giaTriGiam?.toLocaleString()}đ`}
                    </div>
                    {notEnough && (
                      <div className="text-xs text-red-500 mt-1">
                        Đơn tối thiểu{" "}
                        {v.giaTriToiThieu?.toLocaleString()}đ
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="voucher"
                    checked={selectedVoucherCode === v.maPhieu}
                    onChange={() => handleSelectVoucherRadio(v.maPhieu || "")}
                    className="accent-orange-500"
                    disabled={notEnough}
                  />
                </label>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Trở lại
          </button>
          <button
            className="px-6 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600"
            onClick={handleOkVoucher}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}