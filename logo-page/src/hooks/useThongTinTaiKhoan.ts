
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThongTinNguoiNhan, DTOThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { thongTinTaiKhoanService } from "@/services/thongTinTaiKhoanService";

// Lấy thông tin theo user ID
export function useThongTinNguoiNhan(userId: number) {
    return useQuery<ThongTinNguoiNhan[]>({
        queryKey: ["thongTinNguoiNhan", userId],
        queryFn: () => thongTinTaiKhoanService.getThongTinByUserId(userId),
        enabled: !!userId,
    });
}

// Tạo thông tin mới
export function useCreateThongTin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: DTOThongTinNguoiNhan) =>
            thongTinTaiKhoanService.createThongTin(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["thongTinNguoiNhan", variables.idUser]
            });
        },
    });
}

// Cập nhật thông tin
export function useUpdateThongTin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: DTOThongTinNguoiNhan }) =>
            thongTinTaiKhoanService.updateThongTin(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["thongTinNguoiNhan", variables.data.idUser]
            });
        },
    });
}

// Xóa thông tin
export function useDeleteThongTin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => thongTinTaiKhoanService.deleteThongTin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thongTinNguoiNhan"] });
        },
    });
}

