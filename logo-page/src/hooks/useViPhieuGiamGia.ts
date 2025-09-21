import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { viPhieuGiamGiaService } from "@/services/viHoaDonUserService";
import { viPhieuGiamService } from "@/services/viPhieuGiamService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetViPhieuGiamGiaTheoUser(
  userId: number | undefined,
  trangThai: string = ""
) {
  return useQuery<PhieuGiamGiaResponse[]>({
    queryKey: ["viPhieuGiamGiaTheoUser", userId, trangThai],
    queryFn: () => {
      if (!userId || userId === 0) return []; // Trả về mảng rỗng cho guest checkout
      return viPhieuGiamGiaService.getHoaDonTheoUser(userId, trangThai);
    },
    enabled: !!userId && userId !== 0, // chỉ gọi khi userId tồn tại và không phải guest
  });
}

export function useDoiDiemLayPhieu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { userId: number; phieuGiamGiaId: number }) => 
      viPhieuGiamService.doiDiemLayPhieu(data),
    onSuccess: (data, variables) => {
      // Invalidate và refetch danh sách phiếu giảm giá của user
      queryClient.invalidateQueries({
        queryKey: ["viPhieuGiamGiaTheoUser", variables.userId]
      });
    },
  });
}
