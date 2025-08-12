import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ThongTinNguoiNhan,
  DTOThongTinNguoiNhan,
} from "@/components/types/thongTinTaiKhoan-types";
import { toast } from "sonner";
import { thongTinNguoiNhanService } from "@/services/thongTinNguoiNhanService";

export function useThongTinNguoiNhan(userId: number) {
  return useQuery<ThongTinNguoiNhan[]>({
    queryKey: ["thongTinNguoiNhan", userId],
    queryFn: () => thongTinNguoiNhanService.getByUserId(userId),
    enabled: !!userId,
  });
}

export function useAddThongTinNguoiNhan() {
  const queryClient = useQueryClient();

  return useMutation<ThongTinNguoiNhan, Error, DTOThongTinNguoiNhan>({
    mutationFn: (data) => thongTinNguoiNhanService.create(data),
    onSuccess: () => {
      toast.success("Thêm địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["thongTinNguoiNhan"] });
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thêm địa chỉ");
    },
  });
}

export function useUpdateThongTinNguoiNhan() {
  const queryClient = useQueryClient();

  return useMutation<
    ThongTinNguoiNhan,
    Error,
    { id: number; data: DTOThongTinNguoiNhan }
  >({
    mutationFn: ({ id, data }) => thongTinNguoiNhanService.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["thongTinNguoiNhan"] });
    },
    onError: (err) => {
      toast.error(err.message || "Không thể cập nhật địa chỉ");
    },
  });
}

export function useDeleteThongTinNguoiNhan() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => thongTinNguoiNhanService.delete(id),
    onSuccess: () => {
      toast.success("Xoá địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["thongTinNguoiNhan"] });
    },
    onError: (err) => {
      toast.error(err.message || "Không thể xoá địa chỉ");
    },
  });
}
