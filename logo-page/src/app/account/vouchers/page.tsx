"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { viPhieuGiamService } from "@/services/viPhieuGiamService";
import { format, isValid } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TicketPercent, ArrowRight, ClipboardCopy, Gift, Coins } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast-provider";
import { useToast } from "@/context/use-toast";
import { useUserStore } from "@/context/authStore.store";

interface Voucher {
    id: number;
    tenPhieu: string;
    soLuong: number;
    giaTriToiThieu: number;
    giaTriGiam: number;
    ngayBatDau?: string;
    ngayKetThuc?: string;
    trangThaiThucTe: string;
    maVoucher?: string;
    ngayNhan?: string;
    maPhieu?: string;
    loaiPhieuGiam?: string;
    giamTriToiDa?: number;
}

// API types
type ApiDateTuple = [number, number, number, number?, number?, number?, number?] | undefined;
interface ApiVoucher {
    id: number;
    tenPhieu: string;
    soLuong: number;
    giaTriToiThieu: number;
    giaTriGiam: number;
    ngayBatDau?: ApiDateTuple;
    ngayKetThuc?: ApiDateTuple;
    ngayNhan?: ApiDateTuple;
    trangThaiThucTe: string;
    maVoucher?: string;
    maPhieu?: string;
    loaiPhieuGiam?: string;
    giamTriToiDa?: number;
}

const PRODUCT_LIST_PATH = "/product";

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

// Helper: Status badge classes
const getStatusBadgeClasses = (status: string) => {
    if (status === "active") {
        return "bg-teal-100 text-teal-800 border border-teal-200";
    }
    return "bg-gray-100 text-gray-700 border border-gray-200";
};

// Helper: Check if voucher is percentage type
const isPercentageType = (type?: string) => {
    return type === "Theo %" || type === "theo_phan_tram";
};

// Helper: Voucher type badge classes
const getTypeBadgeClasses = (type?: string) => {
    if (isPercentageType(type)) {
        return "bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-sm";
    }
    return "bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-sm";
};

// Helper: Card ring classes
const getCardRingClasses = (status: string) => {
    if (status === "active") {
        return "ring-1 ring-peach-200 hover:ring-2 hover:ring-peach-300 border-peach-200 hover:border-peach-300";
    }
    return "ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300 border-gray-200 hover:border-gray-300";
};

const VoucherPageContent = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    // Removed unused totalValue state
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useUserStore();

    useEffect(() => {
        const id = getUserIdFromLocalStorage();
        setUserId(id);
        if (id) {
            fetchUserVouchers(id);
        }
    }, []);

    const fetchUserVouchers = async (userId: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await viPhieuGiamService.layPhieuGiamTheoUser(userId, "active");

            const mappedVouchers: Voucher[] = (data as unknown as ApiVoucher[]).map((item: ApiVoucher) => {
                const formatDate = (arr: ApiDateTuple): string | undefined => {
                    if (Array.isArray(arr) && arr.length >= 3) {
                        const [y, m, d, h = 0, min = 0, s = 0, nano = 0] = arr as [number, number, number, number?, number?, number?, number?];
                        const date = new Date(y, m - 1, d, h, min, s, Math.floor(nano / 1_000_000));
                        return isValid(date) ? format(date, "dd/MM/yyyy HH:mm:ss") : "Ngày không hợp lệ";
                    }
                    return undefined;
                };

                return {
                    id: item.id,
                    tenPhieu: item.tenPhieu,
                    soLuong: item.soLuong,
                    giaTriToiThieu: item.giaTriToiThieu,
                    giaTriGiam: item.giaTriGiam,
                    ngayBatDau: formatDate(item.ngayBatDau),
                    ngayKetThuc: formatDate(item.ngayKetThuc),
                    ngayNhan: formatDate(item.ngayNhan),
                    trangThaiThucTe: item.trangThaiThucTe,
                    maVoucher: item.maVoucher,
                    maPhieu: item.maPhieu,
                    loaiPhieuGiam: item.loaiPhieuGiam,
                    giamTriToiDa: item.giamTriToiDa,
                };
            });

            setVouchers(mappedVouchers);
        } catch (err) {
            console.error("Error fetching vouchers:", err);
            setError("Không thể tải danh sách voucher. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };


    const handleCopy = async (text?: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            toast({
                message: `Mã ${text} đã được copy.`,
                type: "success",
            });
        } catch {
            toast({
                message: "Không thể sao chép. Vui lòng copy thủ công.",
                type: "error",
            });
        }
    };

    if (loading || !userId) {
        return (
            <div className="container mx-auto p-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-gradient-to-r from-peach-100 to-orange-100 text-orange-800 border border-peach-200 shadow-sm">
                    <TicketPercent className="h-4 w-4 animate-pulse" />
                    <span className="animate-pulse">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="min-h-screen p-4 bg-gradient-to-b from-peach-50 via-orange-50 to-yellow-50">
            <Card className="mb-6 bg-gradient-to-r from-peach-400 via-orange-300 to-yellow-300 text-gray-900 shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex flex-col md:flex-row justify-between items-center p-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-extrabold drop-shadow-sm">Voucher Của Tôi</span>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                                <Coins className="h-4 w-4 text-yellow-600" />
                                <span className="text-yellow-800 font-medium">
                                    Điểm hiện tại: {user?.diemTichLuy || 0}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                            <Button
                                asChild
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                            >
                                <Link href="/account/exchange-points">
                                    <Gift className="mr-2 h-4 w-4" />
                                    Đổi điểm lấy phiếu
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                asChild
                            >
                                <Link href={PRODUCT_LIST_PATH}>
                                    Khám Phá Thêm <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vouchers.map((voucher) => {
                    const isActive = voucher.trangThaiThucTe === "active";
                    const canUse = isActive;
                    const appliedCode = voucher.maVoucher || voucher.maPhieu || "";

                    return (
                        <div
                            key={voucher.id}
                            className={[
                                "group relative rounded-xl overflow-hidden transition-all duration-300",
                                "bg-white border backdrop-blur-sm",
                                "hover:-translate-y-1 hover:shadow-xl",
                                getCardRingClasses(voucher.trangThaiThucTe),
                            ].join(" ")}
                        >
                            <div
                                className={[
                                    "absolute left-0 top-0 h-full w-1",
                                    isActive
                                        ? "bg-gradient-to-b from-orange-300 to-yellow-400"
                                        : "bg-gradient-to-b from-gray-200 to-gray-300",
                                ].join(" ")}
                            />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-peach-50/50 via-transparent to-orange-50/50 pointer-events-none" />

                            <Card className="bg-transparent shadow-none border-0">
                                <CardContent className="p-5 relative">
                                    <div className="flex justify-between items-center mb-3">
                                        <Badge
                                            variant="secondary"
                                            className={`mr-2 ${getStatusBadgeClasses(voucher.trangThaiThucTe)} rounded-full px-3 py-1`}
                                        >
                                            {isActive ? "Đang hoạt động" : "Hết hạn"}
                                        </Badge>

                                        <Badge className={`${getTypeBadgeClasses(voucher.loaiPhieuGiam)} rounded-full px-3 py-1`}>
                                            {isPercentageType(voucher.loaiPhieuGiam)
                                                ? `${voucher.giaTriGiam}% OFF`
                                                : `${voucher.giaTriGiam?.toLocaleString()}đ OFF`}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-800 tracking-tight flex items-center gap-2">
                                        <TicketPercent className="h-5 w-5 opacity-80 text-orange-600" />
                                        {voucher.tenPhieu}
                                    </h3>

                                    <p className="text-sm text-gray-600 mt-1">
                                        Giảm{" "}
                                        <span className="font-semibold text-gray-800">
                                            {isPercentageType(voucher.loaiPhieuGiam)
                                                ? `${voucher.giaTriGiam}%`
                                                : `${voucher.giaTriGiam?.toLocaleString()}đ`}
                                        </span>{" "}
                                        khi đơn từ{" "}
                                        <span className="font-semibold text-gray-800">
                                            {voucher.giaTriToiThieu?.toLocaleString()}đ
                                        </span>
                                    </p>

                                    {voucher.giamTriToiDa != null && isPercentageType(voucher.loaiPhieuGiam) && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Giảm tối đa: {voucher.giamTriToiDa.toLocaleString()}đ
                                        </p>
                                    )}

                                    {appliedCode && (
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <p className="text-sm text-gray-700 truncate">
                                                Mã: <span className="font-mono font-semibold">{appliedCode}</span>
                                            </p>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        // variant="outline"
                                                        size="sm"
                                                        className="border-yellow-300 text-yellow-700 bg-yellow-00 hover:bg-yellow-500 hover:border-yellow-400 focus:ring-2 focus:ring-yellow-300"
                                                        onClick={() => handleCopy(appliedCode)}
                                                    >
                                                        <ClipboardCopy className="h-4 w-4 mr-1" />
                                                        Copy
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Copy mã để dùng ở trang sản phẩm</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )}

                                    <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                                        <p>
                                            Hiệu lực:{" "}
                                            <span className="font-medium text-gray-800">{voucher.ngayBatDau || "N/A"}</span> -{" "}
                                            <span className="font-medium text-gray-800">{voucher.ngayKetThuc || "N/A"}</span>
                                        </p>
                                        <p>
                                            Đơn tối thiểu:{" "}
                                            <span className="font-medium text-gray-800">
                                                {voucher.giaTriToiThieu?.toLocaleString()}đ
                                            </span>
                                        </p>
                                        {voucher.ngayNhan && (
                                            <p>
                                                Ngày nhận: <span className="font-medium text-gray-800">{voucher.ngayNhan}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex">
                                                    <Button
                                                        className={[
                                                            "transition-all",
                                                            "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
                                                            "hover:from-yellow-600 hover:to-yellow-600",
                                                            "shadow-md hover:shadow-lg",
                                                            !canUse ? "opacity-60 cursor-not-allowed" : "",
                                                        ].join(" ")}
                                                        disabled={!canUse}
                                                        asChild
                                                    >
                                                        <Link
                                                            href={{
                                                                pathname: PRODUCT_LIST_PATH,
                                                                query: { voucher: appliedCode },
                                                            }}
                                                            aria-disabled={!canUse}
                                                            tabIndex={canUse ? 0 : -1}
                                                        >
                                                            Sử dụng ngay <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {canUse ? "Đi tới trang sản phẩm và áp dụng voucher" : "Voucher hiện không khả dụng"}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default function VoucherPage() {
    return (
        <ToastProvider>
            <TooltipProvider delayDuration={150}>
                <VoucherPageContent />
            </TooltipProvider>
        </ToastProvider>
    );
}