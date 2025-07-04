import { HoaDonDTO } from "@/components/types/hoaDon-types";
import { HoaDonService } from "@/services/hoaDonService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";




export function useHoaDonPaging(page: number, size: number = 10) {
    return useQuery({
        queryKey: ["hoaDons", page, size],
        queryFn: () => HoaDonService.getPagedHoaDons(page, size),

    });
}
export function useHoaDonById(id: number) {
    return useQuery<HoaDonDTO>({
        queryKey: ["hoaDons", id],
        queryFn: () => HoaDonService.getHoaDonById(id),
        enabled: !!id,
    });
}

export function useUpdateTrangThai() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, trangThai }: { id: number; trangThai: string }) =>
            HoaDonService.updateTrangThai(id, trangThai),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hoaDons"] });
        },
    });
}
export function useHoaDonStatusCounts() {
    return useQuery<Record<string, number>, Error>({
        queryKey: ["hoaDons", "statusCounts"],
        queryFn: HoaDonService.getStatusCounts,
    });
}