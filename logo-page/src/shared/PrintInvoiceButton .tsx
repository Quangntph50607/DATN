// components/invoice/PrintInvoiceButton.tsx
"use client";

import { printInvoice } from "@/app/admin/hoadon/invoiceUtils";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export const PrintInvoiceButton = () => {
  return (
    <Button variant="outline" onClick={printInvoice}>
      <Printer className="w-4 h-4 mr-2" />
      In
    </Button>
  );
};
