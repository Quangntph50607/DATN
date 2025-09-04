import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  ten: string;
  email: string;
  sdt?: string;
  ngaySinh?: string | Date;
  diaChi?: string;
  roleId: number;
  message: string;
  token?: string; // Thêm dòng này
  diemTichLuy?: number;

}
interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
}
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      clearUser: () => set({ user: null }),
    }),
    { name: "lego-store" }
  )
);

