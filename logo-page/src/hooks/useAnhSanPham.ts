import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAnhSanPham() {
  return useQuery<AnhSanPhamChiTiet[], Error>({
    queryKey: ["anhSanPhams"],
    queryFn: anhSanPhamSevice.getAnhSanPham,
  });
}

export function useAnhSanPhamID(id: number) {
  return useQuery<AnhSanPhamChiTiet>({
    queryKey: ["anhSanPhams", id],
    queryFn: () => anhSanPhamSevice.getAnhSanPhamID(id),
    enabled: !!id,
  });
}

export function useAddAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      files: File[];
      anhChinh: boolean;
      sanPhamId: number;
      moTa?: string;
    }) => anhSanPhamSevice.addAnhSanPham(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
      queryClient.invalidateQueries({
        queryKey: ["anhSanPhams", "sanpham", variables.sanPhamId],
      });
      // Invalidate product queries to refresh the product data
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
      queryClient.invalidateQueries({ queryKey: ["khuyenmai"] });
    },
    onError: (error: Error) => {
      console.error("Lỗi thêm ảnh: ", error.message);
    },
  });
}

// edit
export function useSuaAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        file?: File;
        anhChinh: boolean;
        sanPhamId: number;
        moTa?: string;
      };
    }) => anhSanPhamSevice.editAnhSanPham(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
    },
  });
}

//  Xóa
export function useXoaAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anhSanPhamSevice.deleteAnhSanPham(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
      // Invalidate product queries to refresh the product data
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
      queryClient.invalidateQueries({ queryKey: ["khuyenmai"] });
    },
  });
}

export function useAnhSanPhamTheoSanPhamId(id: number) {
  return useQuery<AnhSanPhamChiTiet[]>({
    queryKey: ["anhSanPhams", "sanpham", id],
    queryFn: () => anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(id),
    enabled: !!id,
  });
}
