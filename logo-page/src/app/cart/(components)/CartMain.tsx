import React from "react";
import CartList from "./CartList";

interface CartMainProps {
    items: any[];
    onRemove: (id: number) => void;
    onQuantityChange: (id: number, delta: number) => void;
    selectedIds: number[];
    onSelect: (id: number) => void;
    onSelectAll: () => void;
    allSelected: boolean;
    imageUrls: Record<number, string | null>;
}

const CartMain: React.FC<CartMainProps> = ({
    items,
    onRemove,
    onQuantityChange,
    selectedIds,
    onSelect,
    onSelectAll,
    allSelected,
    imageUrls,
}) => (
    <div className="bg-white rounded shadow">
        <CartList
            items={items}
            onRemove={onRemove}
            onQuantityChange={onQuantityChange}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onSelectAll={onSelectAll}
            allSelected={allSelected}
            imageUrls={imageUrls}
        />
    </div>
);

export default CartMain; 