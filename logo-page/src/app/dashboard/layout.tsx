import AdminSideBar from "@/components/layout/(components)/AdminSideBar";
import HeaderAdmin from "@/components/layout/(components)/HeaderAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSideBar />
        <div className="flex-1 flex flex-col min-h-screen">
          <HeaderAdmin />
          <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
