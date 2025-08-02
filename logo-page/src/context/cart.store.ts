// /context/cartStore.ts
import { create } from "zustand";

interface CartItem {
  id: number;
  tenSanPham: string;
  gia: number;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  addItem: (item) => {
    const existing = get().cart.find((i) => i.id === item.id);
    if (existing) {
      set({
        cart: get().cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ cart: [...get().cart, item] });
    }
  },
  removeItem: (id) => set({ cart: get().cart.filter((i) => i.id !== id) }),
  clearCart: () => set({ cart: [] }),
  getTotalPrice: () =>
    get().cart.reduce((sum, item) => sum + item.gia * item.quantity, 0),
}));
