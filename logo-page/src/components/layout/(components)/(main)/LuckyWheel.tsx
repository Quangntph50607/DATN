"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, RotateCcw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useGetPhieuGiam, useGetPhieuGiamGiaNoiBat } from "@/hooks/usePhieuGiam";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { viPhieuGiamService } from "@/services/viPhieuGiamService";
import { toast } from "sonner";


interface VoucherPrize {
    id: number;
    name: string;
    discount: string;
    probability: number;
    color: string;
    bgColor: string;
}
const getUserIdFromLocalStorage = (): number | null => {
    try {
        const stored = localStorage.getItem("lego-store");
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed?.state?.user?.id ?? null;
    } catch (err) {
        console.error("Lỗi lấy userId:", err);
        return null;
    }
};

// Hàm helper để lấy màu
const getColorByIndex = (index: number): string => {
    const colors = ["text-red-600", "text-orange-600", "text-yellow-600", "text-green-600", "text-blue-600", "text-gray-600"];
    return colors[index % colors.length];
};

// Hàm helper để lấy background color
const getBgColorByIndex = (index: number): string => {
    const bgColors = ["bg-red-100", "bg-orange-100", "bg-yellow-100", "bg-green-100", "bg-blue-100", "bg-gray-100"];
    return bgColors[index % bgColors.length];
};

export default function LuckyWheel() {
    const { data: phieuGiamList, isLoading } = useGetPhieuGiamGiaNoiBat();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedPrize, setSelectedPrize] = useState<VoucherPrize | null>(null);
    const [showResult, setShowResult] = useState(false);
    const wheelRef = useRef<HTMLDivElement>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const id = getUserIdFromLocalStorage();
        setUserId(id);
    }, []);


    React.useEffect(() => {
        if (phieuGiamList) {
            // Log trạng thái các voucher để debug
            console.log("Voucher API FE trạngThai:", phieuGiamList.map(v => v.trangThai));
        }
    }, [phieuGiamList]);

    // Chuyển đổi phiếu giảm giá thành VoucherPrize
    const voucherPrizes: VoucherPrize[] = React.useMemo(() => {
        const activeList = phieuGiamList?.filter(
            (phieu: PhieuGiamGia) =>
                phieu.trangThai && phieu.trangThai.trim().toLowerCase() === "active"
        );

        const prizes: VoucherPrize[] = [];

        if (activeList && activeList.length > 0) {
            // Tạo voucher prizes
            const mappedVouchers = activeList.map((phieu: PhieuGiamGia, index: number) => ({
                id: phieu.id,
                name: phieu.tenPhieu,
                discount: phieu.loaiPhieuGiam === "Theo %"
                    ? `${phieu.giaTriGiam}% OFF`
                    : `${phieu.giaTriGiam.toLocaleString()}₫ OFF`,
                probability: Math.max(5, 25 - index * 3),
                color: getColorByIndex(index),
                bgColor: getBgColorByIndex(index)
            }));

            // Sắp xếp đan xen: voucher, may mắn, voucher, may mắn...
            for (let i = 0; i < Math.max(mappedVouchers.length, 3); i++) {
                if (i < mappedVouchers.length) {
                    prizes.push(mappedVouchers[i]);
                }
                // Thêm may mắn lần sau sau mỗi voucher
                prizes.push({
                    id: -(i + 1),
                    name: "May mắn lần sau",
                    discount: "Chúc bạn may mắn lần sau!",
                    probability: 50,
                    color: "text-gray-600",
                    bgColor: "bg-gray-100"
                });
            }
        }

        return prizes;
    }, [phieuGiamList]);

    // Helper lấy ngày hiện tại dạng yyyy-mm-dd
    const getToday = () => {
        const d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
    };

    // State số lượt quay còn lại trong ngày
    const [spinsLeft, setSpinsLeft] = useState(1);

    // Kiểm tra localStorage khi load
    useEffect(() => {
        const lastSpinDate = localStorage.getItem('luckyWheelLastSpinDate');
        const today = getToday();
        console.log('Last spin date:', lastSpinDate);
        console.log('Today:', today);
        console.log('Are they equal?', lastSpinDate === today);

        if (lastSpinDate === today) {
            setSpinsLeft(0);
            console.log('Already spun today, setting spins to 0');
        } else {
            setSpinsLeft(1);
            console.log('First spin of the day, setting spins to 1');
        }
    }, []);

    const spinWheel = () => {
        if (isSpinning || spinsLeft <= 0) return;

        setIsSpinning(true);
        setShowResult(false);
        setSelectedPrize(null);

        // Tính toán phần thưởng dựa trên xác suất
        const random = Math.random() * 100;
        let cumulativeProbability = 0;
        let selectedPrizeIndex = 0;

        for (let i = 0; i < voucherPrizes.length; i++) {
            cumulativeProbability += voucherPrizes[i].probability;
            if (random <= cumulativeProbability) {
                selectedPrizeIndex = i;
                break;
            }
        }

        const prize = voucherPrizes[selectedPrizeIndex];
        setSelectedPrize(prize);

        // Tính góc quay
        const segmentAngle = 360 / voucherPrizes.length;
        const targetAngle = 360 - (selectedPrizeIndex * segmentAngle + segmentAngle / 2);
        const newRotation = rotation + 1440 + targetAngle; // 4 vòng + góc đích

        setRotation(newRotation);
        setSpinsLeft(0);
        localStorage.setItem('luckyWheelLastSpinDate', getToday());

        // Hiển thị kết quả sau khi quay xong
        setTimeout(async () => {
            setIsSpinning(false);
            setShowResult(true);

            if (prize.id > 0 && userId) {
                try {
                    await viPhieuGiamService.themPhieuGiamChoUser({
                        userId: Number(userId),
                        phieuGiamGiaId: prize.id,
                    });
                    console.log("Đã thêm phiếu giảm giá cho userID:", userId + "với phiếu giảm giá cóa ID:" + prize.id);
                } catch (error) {
                    const err = error as any;
                    let message = "Lỗi không xác định khi thêm phiếu giảm giá.";

                    try {
                        const parsed = JSON.parse(err.message);
                        message = parsed.message;
                    } catch {
                        message = err?.response?.data?.message || err.message;
                    }

                    if (message.includes("đã nhận")) {
                        toast.error("❌ Bạn đã nhận phiếu giảm giá này rồi!");
                    } else {
                        toast.error(`❌ ${message}`);
                    }

                    console.error("Lỗi khi thêm phiếu giảm giá:", err);
                }
            }
        }, 3000);
    };

    const resetWheel = () => {
        setSpinsLeft(1);
        setSelectedPrize(null);
        setShowResult(false);
        setRotation(0);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải phiếu giảm giá...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Nếu không có voucher đang hoạt động
    if (voucherPrizes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Gift className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700">Hiện không có voucher nào đang hoạt động.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-purple-800 flex items-center justify-center gap-2">
                        <Gift className="w-8 h-8" />
                        Vòng Quay May Mắn
                        <Star className="w-6 h-6 text-yellow-500" />
                    </CardTitle>
                    <p className="text-gray-600">Quay để nhận voucher giảm giá!</p>
                </CardHeader>

                <CardContent className="flex flex-col lg:flex-row items-center justify-center gap-8">
                    {/* Vòng quay */}
                    <div className="relative">
                        <div className="relative w-80 h-80">
                            {/* Mũi tên chỉ bên phải, đầu nhọn hướng ra ngoài */}
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
                                <div className="w-0 h-0 border-t-[18px] border-b-[18px] border-r-[36px] border-t-transparent border-b-transparent border-r-blue-500 drop-shadow-lg"></div>
                            </div>

                            {/* Vòng quay */}
                            <motion.div
                                ref={wheelRef}
                                className="w-full h-full rounded-full border-8 border-purple-300 shadow-2xl relative overflow-hidden bg-white"
                                animate={{ rotate: rotation }}
                                transition={{ duration: 3, ease: "easeOut" }}
                                style={{ transformOrigin: "center" }}
                            >
                                {voucherPrizes.map((prize, index) => {
                                    const angle = (360 / voucherPrizes.length) * index;
                                    // Tạo màu nền riêng cho từng lát
                                    const bg = [
                                        "bg-gradient-to-br from-pink-200 to-pink-400",
                                        "bg-gradient-to-br from-yellow-200 to-yellow-400",
                                        "bg-gradient-to-br from-green-200 to-green-400",
                                        "bg-gradient-to-br from-blue-200 to-blue-400",
                                        "bg-gradient-to-br from-purple-200 to-purple-400",
                                        "bg-gradient-to-br from-gray-200 to-gray-400"
                                    ][index % 6];
                                    return (
                                        <div
                                            key={prize.id}
                                            className={`absolute w-full h-full ${bg}`}
                                            style={{
                                                transform: `rotate(${angle}deg)`,
                                                clipPath: `polygon(50% 50%, 0% 0%, 100% 0%)`
                                            }}
                                        >
                                            {/* Viền phân cách lát */}
                                            <div className="absolute left-1/2 top-0 w-1 h-1/2 bg-white opacity-80" style={{ transform: "translateX(-50%)" }} />
                                            {/* Tên phần thưởng */}
                                            <div
                                                className="absolute left-1/2 top-8 w-32 text-center text-xs font-bold"
                                                style={{
                                                    transform: `translateX(-50%) rotate(${-angle}deg)`,
                                                    color: index === voucherPrizes.length - 1 ? "#666" : "#b91c1c"
                                                }}
                                            >
                                                {prize.name}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Hiệu ứng sáng ở tâm */}
                                <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                                    boxShadow: "0 0 60px 10px #fff inset"
                                }} />
                            </motion.div>

                            {/* Nút quay */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                <Button
                                    onClick={spinWheel}
                                    disabled={isSpinning || spinsLeft <= 0}
                                    className={`w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 shadow-xl border-4 border-white text-2xl font-extrabold tracking-wider transition-all duration-200 hover:scale-105`}
                                    style={{ boxShadow: "0 4px 32px 0 #f472b6" }}
                                >
                                    {isSpinning ? "..." : spinsLeft > 0 ? "QUAY" : "HẾT"}
                                </Button>
                            </div>
                        </div>

                        {/* Số lượt quay còn lại */}
                        <div className="text-center mt-4">
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                                Còn lại: {spinsLeft} lượt
                            </Badge>
                        </div>
                    </div>

                    {/* Kết quả và thông tin */}
                    <div className="flex flex-col gap-6 min-w-[300px]">
                        {/* Kết quả */}
                        {showResult && selectedPrize && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <Card className={`${selectedPrize.bgColor} border-2 border-purple-300`}>
                                    <CardContent className="p-6">
                                        <div className={`text-2xl font-bold ${selectedPrize.color} mb-2`}>
                                            {selectedPrize.discount}
                                        </div>
                                        <p className="text-gray-700">{selectedPrize.name}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Voucher đã được thêm vào tài khoản của bạn!
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Danh sách phần thưởng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Phần thưởng có thể nhận</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {voucherPrizes.map((prize: VoucherPrize) => (
                                        <div key={prize.id} className="flex items-center justify-between p-2 rounded-lg bg-white">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${prize.bgColor}`}></div>
                                                <span className="font-semibold text-purple-800 group-hover:text-white transition-colors">
                                                    {prize.name}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className={prize.color}>
                                                {prize.discount}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nút reset */}
                        {spinsLeft === 0 && (
                            <Button
                                onClick={resetWheel}
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Quay lại từ đầu
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 