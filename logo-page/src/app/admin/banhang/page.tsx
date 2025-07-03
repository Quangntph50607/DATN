'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/context/useLocalStorage';
import ProductList from './ProductList';
import Cart from './Cart';
import { toast } from 'sonner';
import Summary from './Summary';
import PendingOrders from './PendingOrders';
import { CartItem, PendingOrder } from '@/components/types/order.type';
import { v4 as uuidv4 } from 'uuid';
import { useListKhuyenMaiTheoSanPham } from '@/hooks/useKhuyenmai';
import { SanPham } from '@/components/types/product.type';

const POSPage = () => {
  const { data: products = [] } = useListKhuyenMaiTheoSanPham();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pendingOrders, setPendingOrders] = useLocalStorage('pending-orders', []);
  const [paymentMethod, setPaymentMethod] = useState<'' | 'cash' | 'transfer'>('');
  const [cashGiven, setCashGiven] = useState<number | ''>('');

  const filteredProducts = useMemo(
    () => (products as SanPham[]).filter((p) => p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const addToCart = (product: SanPham) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const firstImage = product.anhSps && product.anhSps.length > 0 ? product.anhSps[0].url : product.anhDaiDien || '/no-image.png';
    if (existingItem) {
      if (existingItem.quantity < (product.soLuongTon ?? 0)) {
        setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        toast.error(`Chỉ còn ${product.soLuongTon ?? 0} sản phẩm trong kho`);
      }
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          anhDaiDien: firstImage,
        },
      ]);
    }
  };

  const updateQuantity = (id: number, amount: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.soLuongTon) {
          toast.error(`Chỉ còn ${item.soLuongTon} sản phẩm trong kho`);
          return { ...item, quantity: item.soLuongTon };
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.gia * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discount) / 100, [subtotal, discount]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    toast.success(`Thanh toán thành công! Cảm ơn ${customerName || "quý khách"}`);
  };

  const handleSavePendingOrder = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    const newOrder = {
      id: uuidv4(),
      items: cart,
      totalAmount: total,
      customerName,
      customerEmail,
      customerPhone,
      discount,
      discountAmount,
      timestamp: new Date(),
    };
    setPendingOrders([newOrder, ...pendingOrders]);
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    toast.success('Đã lưu hóa đơn chờ!');
  };

  const handleLoadPendingOrder = (order: PendingOrder) => {
    setCart(order.items as unknown as CartItem[]);
    setCustomerName(order.customerName);
    setCustomerEmail(order.customerEmail || '');
    setCustomerPhone(order.customerPhone || '');
    setDiscount(order.discount);
    setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== order.id));
  };

  const handleDeletePendingOrder = (orderId: string) => {
    setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== orderId));
  };

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Bán Hàng
        </h1>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 min-h-screen flex gap-6">
        <ProductList products={filteredProducts} searchTerm={searchTerm} onSearch={setSearchTerm} onAddToCart={addToCart} />
        <div className="w-2/5 mx-auto h-full">
          <Card className="glass-card flex flex-col max-h-[700px]">
            <CardHeader><CardTitle className="text-2xl font-bold text-white">Đơn hàng</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col p-4 max-h-[600px] overflow-y-auto">
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                onChangeName={setCustomerName}
                onChangeEmail={setCustomerEmail}
                onChangePhone={setCustomerPhone}
              />
              <Summary
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                discount={discount}
                subtotal={subtotal}
                discountAmount={discountAmount}
                total={total}
                onChangeName={setCustomerName}
                onChangeEmail={setCustomerEmail}
                onChangePhone={setCustomerPhone}
                onChangeDiscount={setDiscount}
                onCheckout={handleCheckout}
                isCheckoutDisabled={cart.length === 0}
                onSavePending={handleSavePendingOrder}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashGiven={cashGiven}
                setCashGiven={setCashGiven}
                cart={cart}
              />
            </CardContent>
          </Card>
          <PendingOrders
            orders={pendingOrders}
            onLoad={handleLoadPendingOrder}
            onDelete={handleDeletePendingOrder}
          />
        </div>
      </motion.div>
    </Card>
  );
};

export default POSPage;
