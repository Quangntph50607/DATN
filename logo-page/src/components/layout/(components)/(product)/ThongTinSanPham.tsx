"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { useXuatXu } from "@/hooks/useXuatXu";
import { useThuongHieu } from "@/hooks/useThuongHieu";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";

type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

export default function ThongTinSanPham() {
  const params = useParams();
  const sanPhamID = Number(Array.isArray(params.id) ? params.id[0] : params.id);

  const { data: sanPhamList = [] } = useListKhuyenMaiTheoSanPham();
  const { data: xuatXuList = [] } = useXuatXu();
  const { data: thuongHieuList = [] } = useThuongHieu();
  const { data: danhMucList = [] } = useDanhMuc();

  const { sanPham, xuatXu, thuongHieu, danhMuc } = useMemo(() => {
    const sp = sanPhamList.find((sp) => sp.id === sanPhamID) as
      | SanPhamChiTietWithAnhUrls
      | undefined;
    return {
      sanPham: sp,
      xuatXu: xuatXuList.find((xx) => xx.id === sp?.xuatXuId),
      thuongHieu: thuongHieuList.find((th) => th.id === sp?.thuongHieuId),
      danhMuc: danhMucList.find((dm) => dm.id === sp?.danhMucId),
    };
  }, [sanPhamID, sanPhamList, xuatXuList, thuongHieuList, danhMucList]);

  if (!sanPham) return null;

  return (
    <div className="text-gray-700 space-y-2 text-base bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p>
        <strong>Mã sản phẩm:</strong> {sanPham.maSanPham}
      </p>
      <p>
        <strong>Danh mục:</strong> {danhMuc?.tenDanhMuc || "N/A"}
      </p>
      <p>
        <strong>Độ tuổi:</strong> {sanPham.doTuoi}+
      </p>
      <p>
        <strong>Số mảnh ghép:</strong> {sanPham.soLuongManhGhep}
      </p>
      <p>
        <strong>Số lượng tồn:</strong> {sanPham.soLuongTon}
      </p>
      <p>
        <strong>Xuất xứ:</strong> {xuatXu?.ten || "N/A"}
      </p>
      <p>
        <strong>Thương hiệu:</strong> {thuongHieu?.ten || "N/A"}
      </p>
    </div>
  );
}
