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
      if (!userId) throw new Error("Missing userId");
      return viPhieuGiamGiaService.getHoaDonTheoUser(userId, trangThai);
    },
    enabled: !!userId, // chỉ gọi khi userId tồn tại
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
