import {
  BayNgayGanDay,
  HoatDongGanDay,
  TongNguoiDung,
} from "@/components/types/thongke.type";
import { thongKeService } from "@/services/thongkeService";
import { useMutation, useQuery } from "@tanstack/react-query";

// --- Doanh thu ---
export function useThongKeTheoNgay(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-ngay", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuTheoNgay(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useDoanhThuTheoPTTT(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-pttt", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuPTThanhToan(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useDoanhThuTheoDanhMuc(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-danh-muc", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuDanhMuc(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useDoanhThuTheoXuatXu(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["doanh-thu-xuat-xu", startDate, endDate],
    queryFn: () => thongKeService.getDoanhThuXuatXu(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

// --- Khuyến mãi & Sản phẩm ---
export function useKhuyenMaiHieuQua(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["khuyen-mai-hieu-qua", startDate, endDate],
    queryFn: () => thongKeService.getKhuyenMaiHieuQua(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useTopSanPhamBanChay(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["top-san-pham", startDate, endDate],
    queryFn: () => thongKeService.getTopSanPhamBanChay(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useSanPhamSapHetHang() {
  return useMutation({
    mutationFn: thongKeService.getSanPhamSapHetHang,
  });
}

// --- Khách hàng & hoàn đơn ---
export function useTopKhachHang(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["top-khach-hang", startDate, endDate],
    queryFn: () => thongKeService.getTopKhachHang(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useTiLeHoan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["ti-le-hoan", startDate, endDate],
    queryFn: () => thongKeService.getTiLeHoan(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useLyDoHoan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["ly-do-hoan", startDate, endDate],
    queryFn: () => thongKeService.getLyDoHoan(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

// --- Tổng người dùng ---
export function useTongNguoiDung() {
  return useQuery<TongNguoiDung>({
    queryKey: ["tong-nguoi-dung"],
    queryFn: thongKeService.getTongNguoiDung,
  });
}

export function useHoatDongGanDay() {
  return useQuery<HoatDongGanDay[]>({
    queryKey: ["hoat-dong-gan-day"],
    queryFn: thongKeService.getHoatDongGanDay,
  });
}

export function useBayNgayGanDay() {
  return useQuery<BayNgayGanDay[]>({
    queryKey: ["bay-ngay-gan-day"],
    queryFn: thongKeService.getBayNgayGanDay,
  });
}
