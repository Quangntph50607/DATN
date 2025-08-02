import { CartItemType } from "@/components/types/cart";

const CART_KEY = "cartItems";

export const getCartFromLocal = (): CartItemType[] => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveCartToLocal = (cart: CartItemType[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error(" Failed to save cart:", err);
  }
};

export const getCartItemQuantity = (id: number): number => {
  return getCartFromLocal().find((item) => item.id === id)?.quantity ?? 0;
};

export const updateCartItem = (
  item: CartItemType,
  maxQuantity: number,
  options?: { override?: boolean } // Thêm tùy chọn
): { success: boolean; message?: string } => {
  const cart = getCartFromLocal();
  const index = cart.findIndex((c) => c.id === item.id);
  const currentQty = index >= 0 ? cart[index].quantity : 0;

  const newQty = options?.override ? item.quantity : currentQty + item.quantity;

  if (maxQuantity <= 0) {
    return { success: false, message: "Sản phẩm đã hết hàng." };
  }

  if (item.quantity <= 0 && !options?.override) {
    return { success: false, message: "Số lượng phải lớn hơn 0." };
  }

  if (index === -1 && cart.length >= 20) {
    return { success: false, message: "Giỏ hàng chỉ tối đa 20 loại sản phẩm!" };
  }

  if (newQty > maxQuantity) {
    return {
      success: false,
      message: `Bạn chỉ có thể mua tối đa ${maxQuantity} sản phẩm này. Hiện tại bạn đã có ${currentQty}.`,
    };
  }

  if (index === -1) {
    cart.push({ ...item, quantity: item.quantity });
  } else {
    cart[index].quantity = newQty;
  }

  saveCartToLocal(cart);
  window.dispatchEvent(new Event("cartUpdated"));
  return { success: true };
};

export const clearCart = () => {
  saveCartToLocal([]);
  window.dispatchEvent(new Event("cartUpdated"));
};

export const removeCartItem = (id: number) => {
  const cart = getCartFromLocal().filter((item) => item.id !== id);
  saveCartToLocal(cart);
  window.dispatchEvent(new Event("cartUpdated"));
};
