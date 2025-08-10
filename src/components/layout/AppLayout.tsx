import { NavLink, Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  Database,
  Bot,
  PlayCircle,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "仪表盘", Icon: LayoutDashboard },
  { to: "/crawler", label: "数据爬虫管理", Icon: Globe },
  { to: "/datasets", label: "测试数据集管理", Icon: Database },
  { to: "/agents", label: "测试端点接入", Icon: Bot },
  { to: "/testruns", label: "测试进程管理", Icon: PlayCircle },
  { to: "/results", label: "测试结果管理", Icon: BarChart3 },
  { to: "/settings", label: "设置", Icon: Settings },
];

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="px-2 py-1 text-sm font-semibold">Agent Validation Hub</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>导航</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={to} className={({ isActive }) => cn(isActive && "data-[active=true]") }>
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-3 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Input placeholder="搜索…" className="max-w-xs" />
            <Button variant="hero" size="sm">新建</Button>
          </div>
        </header>
        <main className="container py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
