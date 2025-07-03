import React from "react";
import Header from "./(components)/(pages)/Header";
import Footer from "./(components)/(pages)/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
