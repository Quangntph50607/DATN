'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MinusCircle, PlusCircle, Trash2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useAccounts, useCreateUser } from '@/hooks/useAccount';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, AccountFormData } from '@/lib/accountSchema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CartItem } from '@/components/types/order.type';

interface Props {
  cart: CartItem[];
  updateQuantity: (id: number, amount: number) => void;
  removeFromCart: (id: number) => void;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onChangeName: (name: string) => void;
  onChangeEmail: (email: string) => void;
  onChangePhone: (phone: string) => void;
}

const Cart: React.FC<Props> = ({ cart, updateQuantity, removeFromCart, customerName, customerEmail, customerPhone, onChangeName, onChangeEmail, onChangePhone }) => {
  const { data: accounts = [] } = useAccounts();
  const [openDialog, setOpenDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const createUser = useCreateUser();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema as any),
    defaultValues: {
      ten: '',
      email: '',
      matKhau: '',
      sdt: '',
      diaChi: '',
      roleId: 3,
      trangThai: 1,
    },
  });

  const customers = accounts.filter(acc => acc.role_id === 3 || acc.role?.name === 'Khách hàng');
  const suggestions = customerName
    ? customers.filter(acc => acc.ten?.toLowerCase().includes(customerName.toLowerCase()))
    : customers;

  const formatCurrency = (amount?: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (open) {
            form.reset({ ten: '', email: '', matKhau: '', sdt: '', diaChi: '', roleId: 3, trangThai: 1 });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setOpenDialog(true)}>
              <UserPlus className="text-gray-400 w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (data) => {
                  try {
                    const res = await createUser.mutateAsync({
                      ten: data.ten,
                      email: data.email,
                      matKhau: data.matKhau,
                      sdt: data.sdt,
                      diaChi: data.diaChi,
                      role_id: 3,
                      trangThai: 1,
                    });
                    onChangeName(res.ten);
                    setOpenDialog(false);
                  } catch (e) {
                    alert('Thêm khách hàng thất bại!');
                  }
                })}
                className="grid gap-2"
              >
                <FormField
                  control={form.control}
                  name="ten"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên khách hàng</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="matKhau"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sdt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diaChi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createUser.isPending}>Thêm</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder="Tên khách hàng (Gõ để tìm nhanh)"
            value={customerName}
            onChange={(e) => {
              onChangeName(e.target.value);
            }}
            className="bg-background/70 border-white/20 text-white placeholder:text-gray-400"
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 left-0 right-0 bg-slate-200/80 border border-input rounded-md shadow-xs mt-1 max-h-40 overflow-y-auto px-3 py-1 text-base">
              {suggestions.map(acc => (
                <div
                  key={acc.id}
                  className="px-2 py-2 hover:bg-primary/20 cursor-pointer text-gray-900 rounded"
                  onMouseDown={() => {
                    onChangeName(acc.ten || '');
                    onChangeEmail(acc.email || '');
                    onChangePhone(acc.sdt || '');
                    setShowSuggestions(false);
                  }}
                >
                  <div className="font-medium">{acc.ten}</div>
                  <div className="text-xs text-gray-600">
                    {acc.email} {acc.sdt && <>• {acc.sdt}</>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4  ml-9">
        <Input
          placeholder="Email khách hàng"
          value={customerEmail}
          onChange={(e) => onChangeEmail(e.target.value)}
          className="bg-background/70 border-white/20 text-white placeholder:text-gray-400 flex-1 min-w-0"
          style={{ marginLeft: 0 }}
        />
        <Input
          placeholder="Số điện thoại"
          value={customerPhone}
          onChange={(e) => onChangePhone(e.target.value)}
          className="bg-background/70 border-white/20 text-white placeholder:text-gray-400 w-48"
        />
      </div>
      <ScrollArea className="flex-grow mb-4 pr-2 scrollable-area">
        {cart.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Giỏ hàng trống</p>
        ) : (
          cart.map(item => {
            const image = item.anhDaiDien || (item.anhSps && item.anhSps.length > 0 ? item.anhSps[0].url : '/no-image.png');
            return (
              <motion.div key={item.id} layout className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-md overflow-hidden mr-3 bg-white/10">
                    <img src={image} alt={item.tenSanPham} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white line-clamp-1">{item.tenSanPham}</h4>
                    <p className="text-xs text-gray-400">
                      {item.giaKhuyenMai != null && item.giaKhuyenMai > 0 ? (
                        <>
                          {formatCurrency(item.giaKhuyenMai)}
                          <span className="ml-1 line-through text-xs text-gray-500">{formatCurrency(item.gia)}</span>
                        </>
                      ) : (
                        formatCurrency(item.gia)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7">
                    <MinusCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                  </Button>
                  <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7">
                    <PlusCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="w-7 h-7 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </ScrollArea>
    </>
  );
};

export default Cart;
