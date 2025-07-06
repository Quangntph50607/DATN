import { BoSuuTap } from "@/components/types/product.type";
import { boSuuTapService } from "@/services/boSutapService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBoSuutap() {
  return useQuery<BoSuuTap[], Error>({
    queryKey: ["boSuuTaps"],
    queryFn: boSuuTapService.getBoSutap,
  });
}

export function useBoSuuTapID(id: number) {
  return useQuery<BoSuuTap>({
    queryKey: ["boSuuTaps", id],
    queryFn: () => boSuuTapService.getBoSuuTapID(id),
    enabled: !!id,
  });
}

//Add
export function useAddBoSuuTap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boSuuTapService.addBoSuuTap,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["boSuuTaps"] });
    },
  });
}
// Sửa
export function useEditBoSuuTap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BoSuuTap }) =>
      boSuuTapService.editBoSuuTap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boSuuTaps"] });
    },
  });
}

//  Xóa
export function useXoaBoSuuTap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => boSuuTapService.xoaBoSuuTap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boSuuTaps"] });
    },
  });
}
