import { XuatXu } from "@/components/types/product.type";
import { xuatXuService } from "@/services/xuatXuService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useXuatXu() {
    return useQuery<XuatXu[], Error>({
        queryKey: ["xuatXu"],
        queryFn: xuatXuService.getAll,
    });
}

export function useAddXuatXu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: xuatXuService.create,
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["xuatXu"] });
        },
    });
}

export function useEditXuatXu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { ten: string; moTa?: string } }) =>
            xuatXuService.update(id, data),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["xuatXu"] });
        },
    });
}

export function useXoaXuatXu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => xuatXuService.delete(id),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["xuatXu"] });
        },
    });
} 