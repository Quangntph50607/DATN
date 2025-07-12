// 'use client';
// import React, { useEffect, useState } from 'react';
// import { PendingOrder } from '@/components/types/order.type';
// import { useLocalStorage } from '@/context/useLocalStorage';
// import { useRouter } from 'next/navigation';
// import { Card } from '@/components/ui/card';
// import PendingOrders from '../PendingOrders';

// const PendingOrdersPage = () => {
//     const [pendingOrders, setPendingOrders] = useLocalStorage('pending-orders', []);
//     const [isClient, setIsClient] = useState(false);
//     const router = useRouter();

//     useEffect(() => {
//         setIsClient(true);
//     }, []);

//     const handleLoadPendingOrder = (order: PendingOrder) => {
//         localStorage.setItem('pending-order-to-load', JSON.stringify(order));
//         setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== order.id));
//         router.push('/admin/banhang/order');
//     };

//     const handleDeletePendingOrder = (orderId: string) => {
//         setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== orderId));
//     };

//     return (
//         <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
//             <div className="text-center mb-8">
//                 <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
//                     Đơn Hàng Chờ
//                 </h1>
//             </div>
//             {isClient && (
//                 <PendingOrders
//                     orders={pendingOrders}
//                     onLoad={handleLoadPendingOrder}
//                     onDelete={handleDeletePendingOrder}
//                 />
//             )}
//         </Card>
//     );
// };

// export default PendingOrdersPage; 