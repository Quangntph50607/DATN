// import React, { createContext, useContext } from "react";
// import { useState } from "react";
// import { ReactNode } from "react";
// import { toast } from "sonner";

// interface GioHangContextType {
//   cart: number[];
//   addToCart: (id: number) => void;
//   removeFromCart: (id: number) => void;
// }

// const GioHangContext = createContext<GioHangContextType | undefined>(undefined);
// export default function GioHangProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState<number[]>([]);
//   const addToCart = (id: number) => {
//     setCart((prevCart) => {
//       const newCart = [...prevCart, id];
//       toast({
//         title: "Thành công!",
//         description: `Sản phẩm với ID ${id} đã được thêm vào giỏ hàng.`,
//         duration: 3000,
//       });
//       return newCart;
//     });
//   };
//   const removeFromCart = (id: number) => {
//     setCart((prevCart) => prevCart.filter((itemId) => itemId !== id));
//     toast({
//       title: "Đã xóa!",
//       description: `Sản phẩm với ID ${id} đã được xóa khỏi giỏ hàng.`,
//       duration: 3000,
//     });
//   };
//   return (
//     <GioHangContext.Provider value={{ cart, addToCart, removeFromCart }}>
//       {children}
//     </GioHangContext.Provider>
//   );
// }
// export function useCart() {
//   const context = useContext(GioHangContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// }
