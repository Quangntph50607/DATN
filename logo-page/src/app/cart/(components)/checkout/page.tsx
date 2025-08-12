import MainLayout from "@/components/layout/layout";
import React from "react";
import CheckoutPage from "./components/CheckoutPage";
import { Toaster } from "sonner";

export default function page() {
  return (
    <MainLayout>
      <CheckoutPage />
      <Toaster />
    </MainLayout>
  );
}
