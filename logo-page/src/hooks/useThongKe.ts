import { thongKeService } from "@/services/thongkeService";
import { useMutation, useQuery } from "@tanstack/react-query";

// 1. Doanh thu theo ngày
export function useThongKeTheoNgay(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-ngay", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuTheoNgay(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 2. Doanh thu theo phương thức thanh toán
export function useDoanhThuTheoPTTT(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-phuong-thuc-tt", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuPTThanhToan(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 3. Doanh thu theo danh mục
export function useDoanhThuTheoDanhMuc(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-danh-muc", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuDanhMuc(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 4. Doanh thu theo xuất xứ
export function useDoanhThuTheoXuatXu(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-xuat-xu", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuXuatXu(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 5. Khuyến mãi hiệu quả
export function useKhuyenMaiHieuQua(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["khuyen-mai-hieu-qua", startDate, endDate],
    queryFn: () => thongKeService.getKhuyenMaiHieuQua(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 6. Top sản phẩm bán chạy
export function useTopSanPhamBanChay(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["top-san-pham", startDate, endDate],
    queryFn: () => thongKeService.getTopSanPhamBanChay(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 7. Top khách hàng
export function useTopKhachHang(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["top-khach-hang", startDate, endDate],
    queryFn: () => thongKeService.getTopKhachHang(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 8. Tỉ lệ hoàn
export function useTiLeHoan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["ti-le-hoan", startDate, endDate],
    queryFn: () => thongKeService.getTiLeHoan(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 9. Lý do hoàn hàng
export function useLyDoHoan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["ly-do-hoan", startDate, endDate],
    queryFn: () => thongKeService.getLyDoHoan(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// 10. Sản phẩm sắp hết hàng (POST nên dùng useMutation hoặc query với params)
export function useSanPhamSapHetHang() {
  return useMutation({
    mutationFn: (params: { soLuongCanhBao: number }) =>
      thongKeService.getSanPhamSapHetHang(params),
  });
}
