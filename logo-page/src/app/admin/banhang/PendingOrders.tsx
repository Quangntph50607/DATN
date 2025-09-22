'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PendingOrder } from '@/components/types/order.type';
import { Input } from '@/components/ui/input';

interface PendingOrdersProps {
    orders: PendingOrder[];
    onLoad: (order: PendingOrder) => void;
    onDelete: (orderId: string) => void;
}

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const PendingOrders: React.FC<PendingOrdersProps> = ({ orders, onLoad, onDelete }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredOrders = orders.filter(order => {
        // If search term is empty, show all orders
        if (!searchTerm.trim()) {
            return true;
        }

        // Check if order matches search term
        const matchesName = order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPhone = order.customerPhone && order.customerPhone.includes(searchTerm);

        return matchesName || matchesPhone;
    });

    return (
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-400/60 rounded-2xl mt-4 w-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center text-lg text-white">
                    <History className="w-5 h-5 mr-3 text-primary" />
                    Đơn hàng chờ
                </CardTitle>
            </CardHeader>
            <Input
                type="text"
                placeholder="Tìm theo SĐT hoặc tên khách..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mx-auto w-[90%] px-3 py-2 rounded-lg bg-white/5 text-white placeholder-gray-400 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
            />
            <CardContent className="flex-grow flex flex-col p-4">
                <ScrollArea className="pr-3">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            <p>Không có đơn hàng nào đang chờ.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredOrders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                                        onClick={() => onLoad(order)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-white">{order.id}</p>
                                            <p className="text-xs text-gray-300">
                                                {order.items.length} sản phẩm - {formatPrice(order.totalAmount)}
                                            </p>
                                            {order.customerName ? (
                                                <p className="text-xs text-gray-400">Khách: {order.customerName}</p>
                                            ) : (
                                                <p className="text-xs text-gray-400">Khách: Khách lẻ</p>
                                            )}
                                            {order.customerPhone ? (
                                                <p className="text-xs text-gray-400">SĐT: {order.customerPhone}</p>
                                            ) : (
                                                <p className="text-xs text-gray-400">SĐT: Chưa có</p>
                                            )}
                                            {order.items && order.items.length > 0 && (
                                                <div className="text-xs text-blue-300 max-w-xs">
                                                    Sản phẩm:
                                                    <div className="ml-2">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx}>{item.tenSanPham}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="border-primary text-primary">
                                                <Upload className="w-3 h-3 mr-2" /> Tải lại
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:bg-red-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(order.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default PendingOrders;