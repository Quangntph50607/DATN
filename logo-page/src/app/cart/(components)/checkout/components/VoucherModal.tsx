"use client";
import React, { useState } from 'react';
import { useGetPhieuGiam } from "@/hooks/usePhieuGiam";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";

// shadcn/ui components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[80vh] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Chọn Voucher</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            placeholder="Mã Voucher"
            className="flex-1 bg-white text-black"
          />
          <Button onClick={handleApplyVoucher} className="bg-blue-500 hover:bg-blue-600 text-white">
            Áp dụng
          </Button>
        </div>

        <div className="mb-2 font-semibold">Danh sách Voucher</div>
        <ScrollArea className="max-h-60">
          {loadingVouchers ? (
            <div className="text-center py-4 text-black/60">
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
                    } ${notEnough ? "opacity-50 cursor-not-allowed" : ""} bg-white text-black`}
                >
                  <span className="text-2xl">🧧</span>
                  <div className="flex-1">
                    <div className="font-bold text-orange-600">
                      {v.tenPhieu}
                    </div>
                    <div className="text-xs text-black/60">
                      HSD: {v.ngayKetThuc || "31.12.2025"}
                    </div>
                    <div className="text-xs text-black/60">
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
        </ScrollArea>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} className="bg-white text-black">
              Trở lại
            </Button>
          </DialogClose>
          <Button
            className="bg-orange-500 text-white font-bold hover:bg-orange-600"
            onClick={handleOkVoucher}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}