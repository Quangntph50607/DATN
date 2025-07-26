import { HoaDonDTO, CreateHoaDonDTO, HoaDonChiTietDTO } from "@/components/types/hoaDon-types";
import { HoaDonService } from "@/services/hoaDonService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Danh sách phân trang
export function useHoaDonPaging(page: number, size: number = 10) {
  return useQuery({
    queryKey: ["hoaDon", "paged", page, size],
    queryFn: () => HoaDonService.getPagedHoaDons(page, size),
  });
}

// Lấy theo ID
export function useHoaDonById(id: number) {
  return useQuery<HoaDonDTO>({
    queryKey: ["hoaDon", "detail", id],
    queryFn: () => HoaDonService.getHoaDonById(id),
    enabled: !!id,
  });
}

// Cập nhật trạng thái
export function useUpdateTrangThai() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trangThai }: { id: number; trangThai: string }) =>
      HoaDonService.updateTrangThai(id, trangThai),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoaDon"] });
    },
  });
}

export function useCreateHoaDon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: CreateHoaDonDTO) => HoaDonService.createHoaDon(orderData),
    onSuccess: () => {
      // Invalidate and refetch all hoa don queries
      queryClient.invalidateQueries({ queryKey: ["hoaDons"] });
      queryClient.invalidateQueries({ queryKey: ["hoaDons", "statusCounts"] });
    },
    onError: (error) => {
      console.error('Lỗi tạo hóa đơn:', error);
    },
  });
}

export function useHoaDonStatusCounts() {
  return useQuery<Record<string, number>, Error>({
    queryKey: ["hoaDon", "status-counts"],
    queryFn: HoaDonService.getStatusCounts,
  });
}

// Chi tiết sản phẩm
export function useChiTietSanPhamHoaDon(id: number) {
  return useQuery<HoaDonChiTietDTO[]>({
    queryKey: ["hoaDon", "chi-tiet-san-pham", id],
    queryFn: () => HoaDonService.getChiTietSanPhamByHoaDonId(id),
    enabled: !!id,
  });
}

// Lấy lịch sử mua hàng theo user ID
export function useHoaDonByUserId(userId: number) {
  return useQuery<HoaDonDTO[]>({
    queryKey: ["hoaDon", "user", userId],
    queryFn: () => HoaDonService.getHoaDonByUserId(userId),
    enabled: !!userId,
  });
}

