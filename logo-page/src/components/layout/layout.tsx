import React from "react";
import Header from "./(components)/Header";
import Footer from "./(components)/Footer";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
