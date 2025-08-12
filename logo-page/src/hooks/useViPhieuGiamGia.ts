import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { viPhieuGiamGiaService } from "@/services/viHoaDonUserService";
import { useQuery } from "@tanstack/react-query";

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
