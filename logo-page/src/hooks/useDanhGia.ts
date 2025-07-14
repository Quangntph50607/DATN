import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { danhGiaService } from "@/services/danhGiaService";
import { DanhGia } from "@/components/types/danhGia-type";

// Lấy danh sách đánh giá theo sản phẩm
export function useDanhGia(sanPhamId: number) {
    return useQuery<DanhGia[]>({
        queryKey: ["danhGia", sanPhamId],
        queryFn: () => danhGiaService.getBySanPham(sanPhamId),
    });
}

// Thêm đánh giá mới
export function useAddDanhGia(sanPhamId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => danhGiaService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["danhGia", sanPhamId] });
        },
    });
}

// Upload ảnh cho đánh giá
export function useUploadDanhGiaImages(sanPhamId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ danhGiaId, files }: { danhGiaId: number; files: File[] }) =>
            danhGiaService.uploadImages(danhGiaId, files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["danhGia", sanPhamId] });
        },
    });
}

// Upload video cho đánh giá
export function useUploadDanhGiaVideo(sanPhamId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ danhGiaId, file }: { danhGiaId: number; file: File }) =>
            danhGiaService.uploadVideo(danhGiaId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["danhGia", sanPhamId] });
        },
    });
}