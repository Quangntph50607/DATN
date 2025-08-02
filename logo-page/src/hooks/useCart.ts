import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cartService";

export function useCart(userId: number) {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => cartService.getCart(userId),
    enabled: !!userId,
  });
}

export function useAddToCart(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sanPhamId,
      soLuong,
    }: {
      sanPhamId: number;
      soLuong: number;
    }) => cartService.addToCart(sanPhamId, soLuong),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

export function useUpdateCartItem(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, soLuong }: { itemId: number; soLuong: number }) =>
      cartService.updateCartItem(itemId, soLuong),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

export function useRemoveCartItem(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }: { itemId: number }) =>
      cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

export function useApplyDiscount(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phieuGiamGiaId }: { phieuGiamGiaId: number }) =>
      cartService.applyDiscount(phieuGiamGiaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}
