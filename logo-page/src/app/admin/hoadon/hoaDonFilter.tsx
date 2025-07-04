// app/components/sanpham/HoaDonFilter.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { HoaDonDTO, PaymentMethods, TrangThaiHoaDon } from "@/components/types/hoaDon-types";

interface HoaDonFilterProps {
    filters: {
        keyword: string;
        trangThai: keyof typeof TrangThaiHoaDon | "all";
        phuongThuc: keyof typeof PaymentMethods | "all";
        from: string;
        to: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        keyword: string;
        trangThai: keyof typeof TrangThaiHoaDon | "all";
        phuongThuc: keyof typeof PaymentMethods | "all";
        from: string;
        to: string;
    }>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hoaDons: HoaDonDTO[];
}

export default function HoaDonFilter({ filters, setFilters, setPage, hoaDons }: HoaDonFilterProps) {
    const [suggestions, setSuggestions] = useState<HoaDonDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [fromDate, setFromDate] = useState<Date | undefined>(filters.from ? new Date(filters.from) : undefined);
    const [toDate, setToDate] = useState<Date | undefined>(filters.to ? new Date(filters.to) : undefined);

    const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        if (!inputValue) return [];

        return hoaDons
            .filter(
                (hd) =>
                    (hd.id + "").includes(inputValue) ||
                    (hd.maHD?.toLowerCase().includes(inputValue)) ||
                    (hd.ten?.toLowerCase().includes(inputValue)) ||
                    (hd.sdt?.includes(inputValue))
            )
            .slice(0, 5);
    };

    return (
        <form
            className="w-full border border-blue-400 rounded-xl p-6 mb-8 shadow bg-[#181e29] text-white"
            onSubmit={(e) => e.preventDefault()}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Trạng thái */}
                <div>
                    <label htmlFor="trangThai" className="text-sm text-muted-foreground mb-1 block">
                        Trạng thái đơn hàng
                    </label>
                    <Select

                        value={filters.trangThai}
                        onValueChange={(value) => {
                            setFilters((f) => ({ ...f, trangThai: value as keyof typeof TrangThaiHoaDon | "all" }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {Object.entries(TrangThaiHoaDon).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Phương thức thanh toán */}
                <div>
                    <label htmlFor="phuongThuc" className="text-sm text-muted-foreground mb-1 block">
                        Phương thức thanh toán
                    </label>
                    <Select

                        value={filters.phuongThuc}
                        onValueChange={(value) => {
                            setFilters((f) => ({ ...f, phuongThuc: value as keyof typeof PaymentMethods | "all" }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {Object.entries(PaymentMethods).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Từ ngày */}
                <div>
                    <label htmlFor="fromDate" className="text-sm text-muted-foreground mb-1 block">
                        Từ ngày
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fromDate ? format(fromDate, "PPP") : "Chọn ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                onSelect={(date) => {
                                    setFromDate(date);
                                    setFilters((f) => ({ ...f, from: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "" }));
                                    setPage(0);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Đến ngày */}
                <div>
                    <label htmlFor="toDate" className="text-sm text-muted-foreground mb-1 block">
                        Đến ngày
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {toDate ? format(toDate, "PPP") : "Chọn ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={toDate}
                                onSelect={(date) => {
                                    setToDate(date);
                                    setFilters((f) => ({ ...f, to: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "" }));
                                    setPage(0);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Tìm kiếm + Đặt lại */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-4 relative">
                    <label htmlFor="keyword" className="text-sm text-muted-foreground mb-1 block">
                        Tìm kiếm (Mã đơn, Mã HD, tên, SĐT...)
                    </label>
                    <Input
                        id="keyword"
                        placeholder="Nhập mã hóa đơn, tên khách hoặc SĐT..."
                        value={filters.keyword}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilters((f) => ({ ...f, keyword: value }));
                            setPage(0);
                            if (value) {
                                setSuggestions(getSuggestions(value));
                                setShowSuggestions(true);
                            } else {
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }
                        }}
                        onFocus={() => {
                            if (filters.keyword) {
                                setSuggestions(getSuggestions(filters.keyword));
                                setShowSuggestions(true);
                            }
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-popover border rounded w-full mt-1 max-h-40 overflow-y-auto text-sm shadow-lg">
                            {suggestions.map((hd) => (
                                <li
                                    key={hd.id}
                                    className="px-3 py-2 hover:bg-muted cursor-pointer"
                                    onMouseDown={() => {
                                        setFilters((f) => ({
                                            ...f,
                                            keyword: hd.maHD || hd.ten || hd.sdt || hd.id.toString(),
                                        }));
                                        setPage(0);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <span className="font-semibold text-blue-600">
                                        {hd.maHD || `#${hd.id}`}
                                    </span>{" "}
                                    - {hd.ten || "N/A"} - {hd.sdt || "N/A"}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn đặt lại tất cả bộ lọc?")) {
                                setFilters({
                                    keyword: "",
                                    trangThai: "all",
                                    phuongThuc: "all",
                                    from: "",
                                    to: "",
                                    loaiHD: "all",
                                });
                                setFromDate(undefined);
                                setToDate(undefined);
                                setPage(0);
                            }
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại
                    </Button>
                </div>
            </div>
        </form>
    );
}