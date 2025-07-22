import React, { useState } from "react";
import type { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { useRouter } from "next/navigation";

interface CartTotalBarProps {
    selectedItems: any[];
    total: number;
    totalAfterDiscount: number;
    selectedVoucher: PhieuGiamGia | null;
    onShowVoucherModal: () => void;
    onCheckout: () => void; // Bắt buộc
}

const CartTotalBar: React.FC<CartTotalBarProps> = ({
    selectedItems,
    total,
    totalAfterDiscount,
    selectedVoucher,
    onShowVoucherModal,
    onCheckout, // Nhận prop này
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = () => {
        if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
            return;
        }
        setIsLoading(true);
        try {
            onCheckout(); // Gọi hàm từ parent
        } catch (err) {
            console.error("[Mua Hàng] Lỗi khi lưu vào localStorage:", err);
            alert("Lỗi khi lưu sản phẩm vào localStorage!");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 bg-white rounded shadow gap-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onShowVoucherModal}
                    className="flex items-center gap-2 border px-4 py-2 rounded text-orange-600 font-semibold"
                >
                    <span>🧧</span> Shopee Voucher
                </button>
                {selectedVoucher && (
                    <span className="ml-2 text-green-600">{selectedVoucher.tenPhieu}</span>
                )}
            </div>
            <div>
                <span className="font-semibold">Tổng cộng ({selectedItems.length} Sản phẩm): </span>
                <span className="text-gray-500 line-through mr-2">{total.toLocaleString()}đ</span>
                <span className="text-red-500 font-bold text-xl">{totalAfterDiscount.toLocaleString()}đ</span>
            </div>
            <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded text-lg disabled:bg-orange-300"
                onClick={handleCheckout}

            >
                {isLoading ? "Đang xử lý..." : "Mua Hàng"}
            </button>
        </div>
    );
};

export default CartTotalBar;