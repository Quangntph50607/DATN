import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EnrichedOrder } from "./types";
import OrderCard from "./OrderCard";

interface OrderListProps {
  orders: EnrichedOrder[];
  productImages: Record<number, string>;
  handleViewDetail: (order: EnrichedOrder) => void;
  handleCancelOrder: (orderId: number) => void;
  handleConfirmDelivery: (orderId: number) => void;
  handleReorder: (order: EnrichedOrder) => void;
  cancelingId: number | null;
  reorderingId: number | null;
}

export default function OrderList({
  orders,
  productImages,
  handleViewDetail,
  handleCancelOrder,
  handleConfirmDelivery,
  handleReorder,
  cancelingId,
  reorderingId,
}: OrderListProps) {
  const sortedOrders = React.useMemo(() => {
    if (!orders) return [];
    return [...orders].sort(
      (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
    );
  }, [orders]);
  return (
    <AnimatePresence>
      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <div>
            <OrderCard
              order={order}
              productImages={productImages}
              handleViewDetail={handleViewDetail}
              handleCancelOrder={handleCancelOrder}
              handleConfirmDelivery={handleConfirmDelivery}
              handleReorder={handleReorder}
              cancelingId={cancelingId}
              reorderingId={reorderingId}
            />
          </div>
        ))}
      </div>
    </AnimatePresence>
  );
}
