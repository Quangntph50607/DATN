'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/context/useLocalStorage';
import ProductList from '../ProductList';
import Cart from '../Cart';
import { toast } from 'sonner';
import Summary from '../Summary';
import { CartItem, PendingOrder } from '@/components/types/order.type';
import { v4 as uuidv4 } from 'uuid';
import { useListKhuyenMaiTheoSanPham } from '@/hooks/useKhuyenmai';
import { KhuyenMaiTheoSanPham } from '@/components/types/khuyenmai-type';
import { useCreateHoaDon } from '@/hooks/useHoaDon';
import { useUserStore } from '@/context/authStore.store';
import { CreateHoaDonDTO } from '@/components/types/hoaDon-types';
import { useRouter } from 'next/navigation';
import { PhieuGiamGia } from '@/components/types/phieugiam.type';

const getValidImageName = (filenameOrObj: string | { url: string }) => {
    let filename = '';
    if (typeof filenameOrObj === 'string') {
        filename = filenameOrObj;
    } else if (filenameOrObj && typeof filenameOrObj === 'object' && 'url' in filenameOrObj) {
        filename = filenameOrObj.url;
    }
    filename = filename.replace(/^anh_/, '');
    const lastUnderscore = filename.lastIndexOf('_');
    if (lastUnderscore !== -1) {
        filename = filename.substring(lastUnderscore + 1);
    }
    filename = filename.replace(/(.jpg)+$/, '.jpg');
    return filename;
};

const OrderPage = () => {
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
    const router = useRouter();
    const paidRef = useRef(false);
    const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
    const [hydrated, setHydrated] = useState(false);

    // Hooks for creating order
    const createHoaDonMutation = useCreateHoaDon();
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        console.log("hydrated:", hydrated, "user:", user);
        if (!hydrated) return;
        if (!user) {
            console.log("Chưa có user, không redirect");
            return;
        }
        if (user.roleId !== 1 && user.roleId !== 2) {
            console.log("User không đủ quyền, redirect về /");
            window.location.href = "/";
        } else {
            console.log("User đủ quyền, ở lại trang admin");
        }
    }, [user, hydrated, router]);

    const filteredProducts = useMemo(
        () => (products as KhuyenMaiTheoSanPham[]).filter((p) => p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())),
        [products, searchTerm]
    );

    const addToCart = (product: KhuyenMaiTheoSanPham) => {
        const existingItem = cart.find((item) => item.id === product.id);
        const firstImage = product.anhUrls && product.anhUrls.length > 0
            ? `/images/${getValidImageName(product.anhUrls[0])}`
            : '/no-image.png';
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
                    danhMucId: typeof product['danhMucId'] === 'number' ? product['danhMucId'] : 0,
                    boSuuTapId: typeof product['boSuuTapId'] === 'number' ? product['boSuuTapId'] : 0,
                    doTuoi: typeof product.doTuoi === 'number' ? product.doTuoi : 0,
                    moTa: typeof product.moTa === 'string' ? product.moTa : '',
                    soLuongManhGhep: typeof product.soLuongManhGhep === 'number' ? product.soLuongManhGhep : 0,
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
    const discountAmount = useMemo(() => {
        if (!selectedVoucher) return 0;
        if (selectedVoucher.loaiPhieuGiam === "Theo %") {
            // Nếu có giamToiDa, không vượt quá giamToiDa
            const percentDiscount = (subtotal * selectedVoucher.giaTriGiam) / 100;
            if (selectedVoucher.giamToiDa) {
                return Math.min(percentDiscount, selectedVoucher.giamToiDa, subtotal);
            }
            return Math.min(percentDiscount, subtotal);
        } else if (selectedVoucher.loaiPhieuGiam === "Theo số tiền") {
            return Math.min(selectedVoucher.giaTriGiam, subtotal);
        }
        return 0;
    }, [subtotal, selectedVoucher]);
    const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

    // Function to create order
    const createOrder = async () => {
        if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
            toast.error("Bạn không có quyền tạo hóa đơn tại quầy!");
            return;
        }

        if (cart.length === 0) {
            toast.error('Giỏ hàng trống');
            return;
        }

        if (!customerPhone) {
            toast.error('Vui lòng nhập số điện thoại khách hàng');
            return;
        }

        if (!paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        const orderData: CreateHoaDonDTO = {
            loaiHD: 1,
            nvId: user.id,
            sdt: customerPhone,
            diaChiGiaoHang: "Tại quầy",
            phuongThucThanhToan: paymentMethod === 'cash' ? 'CASH' : 'BANK_TRANSFER',
            cartItems: cart.map(item => ({
                idSanPham: item.id,
                soLuong: item.quantity
            })),
        };

        console.log('orderData:', orderData);

        try {
            const result = await createHoaDonMutation.mutateAsync(orderData);
            console.log('Order created successfully:', result);
            toast.success(`Tạo hóa đơn thành công! Cảm ơn ${customerName || "quý khách"}`);

            // Clear cart and form
            setCart([]);
            setDiscount(0);
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setPaymentMethod('');
            setCashGiven('');

            // Navigate to orders list
            router.push('/admin/hoadon');
        } catch (error: any) {
            console.error('Lỗi tạo hóa đơn:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            toast.error(`Có lỗi xảy ra khi tạo hóa đơn: ${error.message}`);
        }
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
        // Xóa pending order khỏi localStorage khi lưu chờ
        localStorage.removeItem('pending-order-to-load');
        setCart([]);
        setDiscount(0);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        toast.success('Đã lưu hóa đơn chờ!');
        router.push('/admin/banhang/pending');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pendingOrderStr = localStorage.getItem('pending-order-to-load');
            if (pendingOrderStr) {
                try {
                    const order = JSON.parse(pendingOrderStr);
                    setCart(order.items || []);
                    setCustomerName(order.customerName || '');
                    setCustomerEmail(order.customerEmail || '');
                    setCustomerPhone(order.customerPhone || '');
                    setDiscount(order.discount || 0);
                    localStorage.removeItem('pending-order-to-load'); // Xóa sau khi load
                } catch { }
            }
        }
    }, []);

    return (
        <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
            <div className="flex justify-between items-center">
                <div className="text-center w-full">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Bán Hàng Tại Quầy
                    </h1>
                </div>
                <a href="/admin/banhang/pending">
                    <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-2 rounded-lg shadow transition-all ml-4 min-w-[140px] whitespace-nowrap">
                        Đơn hàng chờ
                    </button>
                </a>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 min-h-screen flex gap-6">
                <ProductList
                    products={filteredProducts}
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    onAddToCart={addToCart}
                    cart={cart}
                    pendingOrders={pendingOrders}
                />
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
                                subtotal={subtotal}
                                discountAmount={discountAmount}
                                total={total}
                                onChangeName={setCustomerName}
                                onChangeEmail={setCustomerEmail}
                                onChangePhone={setCustomerPhone}
                                onCheckout={createOrder}
                                isCheckoutDisabled={cart.length === 0}
                                onSavePending={handleSavePendingOrder}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                cashGiven={cashGiven}
                                setCashGiven={setCashGiven}
                                cart={cart}
                                selectedVoucher={selectedVoucher}
                                setSelectedVoucher={setSelectedVoucher}
                            />
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </Card>
    );
};

export default OrderPage;