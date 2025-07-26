"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HoaDonDTO, TrangThaiHoaDon, PaymentMethods } from "@/components/types/hoaDon-types";

interface OrderFilterProps {
  search: string;
  setSearch: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterPayment: string;
  setFilterPayment: (v: string) => void;
  setPage: (v: number) => void;
  orders: HoaDonDTO[];
  PAGE_SIZE: number;
}

function OrderFilter({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filterPayment,
  setFilterPayment,
  setPage,
  orders,
  PAGE_SIZE,
}: OrderFilterProps) {
  const STATUS = Object.entries(TrangThaiHoaDon).map(([key, label]) => ({
    value: key.toUpperCase(),
    label,
  }));

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-400",
    PROCESSING: "text-blue-400",
    PACKING: "text-purple-400",
    SHIPPED: "text-indigo-400",
    DELIVERED: "text-green-400",
    COMPLETED: "text-emerald-500",
    FAILED: "text-red-500",
    CANCELLED: "text-gray-400",
  };

  // Lọc đúng theo value của PaymentMethods (giá trị là label)
  const paymentMethods = Object.entries(PaymentMethods).map(([key, label]) => ({
    value: label,
    label,
  }));

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
      <Input
        className="md:w-1/2 bg-[#232b3b] border border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-md text-white placeholder-gray-400 rounded-lg transition-all duration-200 ease-in-out"
        placeholder="Tìm mã HĐ, tên khách, địa chỉ hoặc mã vận chuyển..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />

      <Select
        value={filterStatus}
        onValueChange={(v) => {
          setFilterStatus(v);
          setPage(0);
        }}
      >
        <SelectTrigger className="w-48 bg-[#232b3b] border border-blue-500 text-white rounded-lg">
          <SelectValue placeholder="Tất cả trạng thái">
            {filterStatus === "ALL" || !filterStatus
              ? "Tất cả trạng thái"
              : STATUS.find((s) => s.value === filterStatus)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          {STATUS.map((st) => (
            <SelectItem key={st.value} value={st.value}>
              <span className={`text-xs font-semibold ${statusColors[st.value] || "text-white"}`}>
                {st.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filterPayment}
        onValueChange={(v) => {
          setFilterPayment(v);
          setPage(0);
        }}
      >
        <SelectTrigger className="w-48 bg-[#232b3b] border border-blue-500 text-white rounded-lg">
          <SelectValue placeholder="Tất cả thanh toán">
            {filterPayment === "ALL" || !filterPayment
              ? "Tất cả thanh toán"
              : paymentMethods.find((pm) => pm.value === filterPayment)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả thanh toán</SelectItem>
          {paymentMethods.map((pm) => (
            <SelectItem key={pm.value} value={pm.value}>
              {pm.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default OrderFilter;
