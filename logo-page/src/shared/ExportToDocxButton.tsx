// components/invoice/ExportToDocxButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { HoaDonDTO, HoaDonChiTietDTO } from "@/components/types/hoaDon-types";
import { DTOUser } from "@/components/types/account.type";
import { exportInvoiceToDocx } from "@/app/admin/hoadon/invoiceUtils";

interface ExportToDocxButtonProps {
  detail: HoaDonDTO | null;
  chiTiet: HoaDonChiTietDTO[];
  users: DTOUser[];
}

export const ExportToDocxButton = ({
  detail,
  chiTiet,
  users,
}: ExportToDocxButtonProps) => {
  const handleExport = () => {
    if (!detail) return;
    exportInvoiceToDocx(detail, chiTiet, users);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileText className="w-4 h-4 mr-2" />
      DOCX
    </Button>
  );
};
