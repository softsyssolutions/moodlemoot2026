import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Award, Settings, LogOut, ExternalLink, QrCode, ShieldCheck, BellRing, Ticket, UserCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { signOut, user, isAdmin } = useAuth();

  const items = isAdmin
    ? [
        { title: "Dashboard", url: "/panel", icon: LayoutDashboard, end: true },
        { title: "Asistentes", url: "/panel/asistentes", icon: UserCheck },
        { title: "Check-in", url: "/panel/check-in", icon: QrCode },
        { title: "Staff", url: "/panel/staff", icon: ShieldCheck },
        { title: "Speakers", url: "/panel/speakers", icon: Users },
        { title: "Sesiones", url: "/panel/sesiones", icon: CalendarDays },
        { title: "Sponsors", url: "/panel/sponsors", icon: Award },
        { title: "Notificaciones", url: "/panel/notificaciones", icon: BellRing },
        { title: "Cupones", url: "/panel/cupones", icon: Ticket },
        { title: "Evento", url: "/panel/evento", icon: Settings },
      ]
    : [
        { title: "Check-in", url: "/panel/check-in", icon: QrCode },
      ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-4 border-b">
          <div className="font-bold text-sm">MoodleMoot CRM</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = it.end ? pathname === it.url : pathname.startsWith(it.url);
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={it.url} end={it.end} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        <span>{it.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Ver sitio
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
