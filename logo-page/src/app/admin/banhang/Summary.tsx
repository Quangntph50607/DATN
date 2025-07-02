'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  customerName: string;
  discount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  onChangeName: (name: string) => void;
  onChangeDiscount: (value: number) => void;
  onCheckout: () => void;
  isCheckoutDisabled: boolean;
  onSavePending: () => void;
  paymentMethod: '' | 'cash' | 'transfer';
  setPaymentMethod: (m: '' | 'cash' | 'transfer') => void;
  cashGiven: number | '';
  setCashGiven: (v: number | '') => void;
}

const discountOptions = [
  { label: 'Không áp dụng', value: 0 },
  { label: 'Phiếu 10%', value: 10 },
  { label: 'Phiếu 20%', value: 20 },
  { label: 'Phiếu 30%', value: 30 },
];

const Summary: React.FC<Props> = ({
  discount,
  subtotal,
  discountAmount,
  total,
  onChangeDiscount,
  onCheckout,
  isCheckoutDisabled,
  onSavePending,
  paymentMethod,
  setPaymentMethod,
  cashGiven,
  setCashGiven,
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const change = paymentMethod === 'cash' && cashGiven !== '' ? Number(cashGiven) - total : 0;

  return (
    <>
      <Separator className="my-4 bg-white/10" />

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between text-gray-300">
          <span>Tạm tính:</span>
          <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center mb-2 justify-between">
          <label htmlFor="discount-select" className="text-gray-300 text-sm min-w-[110px]">Phiếu giảm giá:</label>
          <Select value={String(discount)} onValueChange={val => onChangeDiscount(Number(val))}>
            <SelectTrigger className="h-9 text-sm bg-background/70 border border-white/30 text-white rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm hover:border-primary/60 text-right">
              <SelectValue placeholder="Chọn phiếu giảm giá" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-primary/60 shadow-lg bg-[#23272f] text-white">
              {discountOptions.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)} className="rounded-xl">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-400">
            <span>Tiền giảm giá:</span>
            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold text-white">
          <span>Tổng cộng:</span>
          <span className="pos-gradient-text">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center mb-2 justify-between">
          <label htmlFor="payment-method-select" className="text-gray-300 text-sm min-w-[110px]">Phương thức thanh toán:</label>
          <Select value={paymentMethod} onValueChange={val => setPaymentMethod(val as '' | 'cash' | 'transfer')}>
            <SelectTrigger id="payment-method-select" className="h-9 text-sm bg-background/70 border border-white/30 text-white rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm hover:border-primary/60 text-right">
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-primary/60 shadow-lg bg-[#23272f] text-white">
              <SelectItem value="cash" className="rounded-xl">Tiền mặt</SelectItem>
              <SelectItem value="transfer" className="rounded-xl">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentMethod === 'cash' && (
          <>
            <div className="flex items-center mb-2 justify-between">
              <span className="text-gray-300 text-sm min-w-[110px]">Khách đưa:</span>
              <Input
                type="number"
                min={0}
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-32 text-right bg-background/70 border-white/30 text-white"
                placeholder="Nhập số tiền"
              />
            </div>
            <div className="flex items-center mb-2 justify-between">
              <span className="text-gray-300 text-sm min-w-[110px]">Tiền thừa:</span>
              <span className={`font-bold ${change < 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(change)}</span>
            </div>
          </>
        )}
      </div>

      <Button
        size="lg"
        variant="default"
        className="w-full py-6 text-lg mb-2"
        onClick={onCheckout}
        disabled={isCheckoutDisabled}
      >
        <DollarSign className="mr-2 h-6 w-6" /> Thanh toán
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full py-6 text-lg"
        onClick={onSavePending}
        disabled={isCheckoutDisabled}
      >
        Lưu chờ
      </Button>
    </>
  );
};

export default Summary;
