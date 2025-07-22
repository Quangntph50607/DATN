import Image from "next/image";

interface CartItemProps {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  selectedIds: number[];
  onSelect: (id: number) => void;
  imageUrls: Record<number, string | null>;
}

const CartItem = ({
  id,
  name,
  image,
  price,
  quantity,
  onRemove,
  onQuantityChange,
  selectedIds,
  onSelect,
  imageUrls,
}: CartItemProps) => {
  const isSelected = selectedIds.includes(id);
  const imageUrl = imageUrls[id] || image || "/fallback.jpg";
  const totalPrice = price * quantity;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(id)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          aria-label={`Chọn sản phẩm ${name}`}
        />
      </td>
      <td className="px-4 py-3">
        <Image
          src={imageUrl}
          alt={name}
          width={80}
          height={80}
          className="rounded-lg object-contain"
        />
      </td>
      <td className="px-4 py-3 font-medium">{name}</td>
      <td className="px-4 py-3 text-red-600 font-medium">{price.toLocaleString()}₫</td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuantityChange(id, -1)}
            className="w-8 h-8 border rounded-full flex items-center justify-center text-red-600 font-bold hover:bg-red-50"
          >
            -
          </button>
          <span className="px-3 py-1 border rounded min-w-[40px] text-center">{quantity}</span>
          <button
            onClick={() => onQuantityChange(id, 1)}
            className="w-8 h-8 border rounded-full flex items-center justify-center text-red-600 font-bold hover:bg-red-50"
          >
            +
          </button>
        </div>
      </td>
      <td className="px-4 py-3 font-bold text-lg">{totalPrice.toLocaleString()}₫</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onRemove(id)}
          className="text-red-500 hover:text-red-700 underline text-sm"
        >
          Xoá
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
