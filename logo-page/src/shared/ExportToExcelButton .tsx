// components/invoice/ExportToExcelButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { HoaDonDTO, HoaDonChiTietDTO } from "@/components/types/hoaDon-types";
import { DTOUser } from "@/components/types/account.type";
import { exportInvoiceToExcel } from "@/app/admin/hoadon/invoiceUtils";

interface ExportToExcelButtonProps {
  detail: HoaDonDTO | null;
  chiTiet: HoaDonChiTietDTO[];
  users: DTOUser[];
}

export const ExportToExcelButton = ({
  detail,
  chiTiet,
  users,
}: ExportToExcelButtonProps) => {
  const handleExport = () => {
    if (!detail) return;
    exportInvoiceToExcel(detail, chiTiet, users);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      Excel
    </Button>
  );
};
