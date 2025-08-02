"use client";
import MainLayout from "@/components/layout/layout";
import React from "react";
import { Toaster } from "sonner";
import CartPage from "./CartPage";

export default function page() {
  return (
    <MainLayout>
      <CartPage />
      <Toaster />
    </MainLayout>
  );
}
