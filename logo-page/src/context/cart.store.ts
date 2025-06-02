// /context/cartStore.ts
import { create } from 'zustand';

interface CartItem {
  id: number;
  tenSanPham: string;
  gia: number;
  soLuong: number;
  hinhAnh: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, soLuong: i.soLuong + item.soLuong } : i
        ),
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  clearCart: () => set({ items: [] }),
  total: () =>
    get().items.reduce((sum, item) => sum + item.gia * item.soLuong, 0),
}));
