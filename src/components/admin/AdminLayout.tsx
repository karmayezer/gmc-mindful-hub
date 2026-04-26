import { type ReactNode } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  LogOut,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";

const NAV = [
  { to: "/gmc-admin-control", label: "Overview", icon: BarChart3, end: true },
  { to: "/gmc-admin-control/users", label: "Users", icon: Users },
  { to: "/gmc-admin-control/pros", label: "Professionals", icon: Briefcase },
  { to: "/gmc-admin-control/finance", label: "Finance", icon: Wallet },
  { to: "/gmc-admin-control/reputation", label: "Reputation", icon: Star },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { admin, adminLogout } = useApp();
  const navigate = useNavigate();

  if (!admin) return <Navigate to="/gmc-admin-control/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full bg-muted/30">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
              </span>
              <div className="leading-tight">
                <div className="font-display text-sm font-semibold">GMC Control</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Analyst Portal
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `flex items-center gap-2 ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : ""
                            }`
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <div className="px-2 py-2 text-xs text-muted-foreground">
              <div className="font-medium text-sidebar-foreground">{admin.username}</div>
              <div className="capitalize">{admin.role}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                adminLogout();
                navigate("/gmc-admin-control/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="font-display text-base">GMC Service Hub · Control Tower</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Public site
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
