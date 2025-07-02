'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PendingOrder } from '@/components/types/order.type';

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
    return (
        <Card className="glass-card mt-4 max-h-64 w-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center text-lg text-white">
                    <History className="w-5 h-5 mr-3 text-primary" />
                    Đơn hàng chờ
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-4">
                <ScrollArea className="h-44 pr-3">
                    {orders.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            <p>Không có đơn hàng nào đang chờ.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {orders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-white">{order.id}</p>
                                            <p className="text-xs text-gray-300">
                                                {order.items.length} sản phẩm - {formatPrice(order.totalAmount)}
                                            </p>
                                            {order.customerName && (
                                                <p className="text-xs text-gray-400">Khách: {order.customerName}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => onLoad(order)} className="border-primary text-primary">
                                                <Upload className="w-3 h-3 mr-2" /> Tải lại
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:bg-red-200"
                                                onClick={() => onDelete(order.id)}
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