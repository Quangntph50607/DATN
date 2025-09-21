export interface CartItemType {
  id: number;
  image: string;
  name: string;
  price: number;
  finalPrice?: number;
  quantity: number;
  maxQuantity?: number;
  isOutOfStock?: boolean;
  currentStock?: number;
}
