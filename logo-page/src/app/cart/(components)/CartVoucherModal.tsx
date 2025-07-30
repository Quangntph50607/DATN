import React from "react";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { Card } from "@/components/ui/card";

interface CartVoucherModalProps {
  show: boolean;
  onClose: () => void;
  voucherList: PhieuGiamGia[];
  loadingVouchers: boolean;
  total: number;
  selectedVoucherCode: string;
  onSelectVoucherRadio: (code: string) => void;
  voucherInput: string;
  setVoucherInput: (val: string) => void;
  handleApplyVoucher: () => void;
  handleOkVoucher: () => void;
}

const CartVoucherModal: React.FC<CartVoucherModalProps> = ({
  show,
  onClose,
  voucherList,
  loadingVouchers,
  total,
  selectedVoucherCode,
  onSelectVoucherRadio,
  voucherInput,
  setVoucherInput,
  handleApplyVoucher,
  handleOkVoucher,
}) => {
  if (!show) return null;
  return (
    <>
      <Card className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
          <h2 className="text-xl font-bold mb-4">Chọn phiếu giảm giá</h2>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
              placeholder="Mã Voucher"
              className="border rounded px-3 py-2 flex-1 text-black placeholder-black"
            />
            <button
              onClick={handleApplyVoucher}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Áp dụng
            </button>
          </div>
          <div className="mb-2 font-semibold">Danh sách phiếu giảm giá</div>
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
                    className={`flex items-center gap-3 border rounded-lg p-3 mb-2 cursor-pointer transition ${
                      selectedVoucherCode === v.maPhieu
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
                          Đơn tối thiểu {v.giaTriToiThieu?.toLocaleString()}đ
                        </div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="voucher"
                      checked={selectedVoucherCode === v.maPhieu}
                      onChange={() => onSelectVoucherRadio(v.maPhieu || "")}
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
      </Card>
    </>
  );
};

export default CartVoucherModal;
