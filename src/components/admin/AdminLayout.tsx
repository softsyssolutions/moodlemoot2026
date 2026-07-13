import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import RequireAdmin from "./RequireAdmin";

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center border-b bg-background px-3 sticky top-0 z-20">
              <SidebarTrigger />
              <div className="ml-3 text-sm font-medium truncate">Panel · MoodleMoot</div>
            </header>
            <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RequireAdmin>
  );
}
