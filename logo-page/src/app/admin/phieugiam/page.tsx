"use client";
import React, { useState } from "react";
import PhieuGiamGia from "./PhieuGiamGiaForm";
import PhieuGiamTable from "./PhieuGiamTable";
import { useGetPhieuGiam, useXoaPhieuGiamGia } from "@/hooks/usePhieuGiam";
import { toast } from "sonner";

export default function Page() {
  const [editing, setEditing] = useState<>();
  const { data: getListPhieuGiam = [], refetch } = useGetPhieuGiam();
  const deletePhieuGiam = useXoaPhieuGiamGia();
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa phiếu khuyến mãi này")) {
      try {
        await deletePhieuGiam.mutateAsync(id);
        toast.success("Xóa phiếu giảm thành công !");
        refetch();
      } catch (error) {
        console.log("Lỗi" + error);
        toast.success("Xóa phiếu giảm thất bại !");
      }
    }
  };
  return (
    <div>
      <PhieuGiamGia />
      <PhieuGiamTable
        phieuGiamGias={getListPhieuGiam}
        onDelete={handleDelete}
        onEdit={(data) => data.id}
      />
    </div>
  );
}
