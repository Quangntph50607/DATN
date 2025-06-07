import SanPhamChiTiet from "@/components/layout/(components)/(product)/SanPhamChiTiet";
import MainLayout from "@/components/layout/layout";
import React from "react";
import { Toaster } from "sonner";

export default function page() {
  return (
    <MainLayout>
      <SanPhamChiTiet />
      <Toaster />
    </MainLayout>
  );
}
