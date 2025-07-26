import { ThuongHieu } from "@/components/types/product.type";
import { thuongHieuService } from "@/services/thuongHieuService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useThuongHieu() {
    return useQuery<ThuongHieu[], Error>({
        queryKey: ["thuongHieu"],
        queryFn: thuongHieuService.getAll,
    });
}

export function useAddThuongHieu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: thuongHieuService.create,
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["thuongHieu"] });
        },
    });
}

export function useEditThuongHieu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { ten: string; moTa?: string } }) =>
            thuongHieuService.update(id, data),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["thuongHieu"] });
        },
    });
}

export function useXoaThuongHieu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => thuongHieuService.delete(id),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["thuongHieu"] });
        },
    });
} 