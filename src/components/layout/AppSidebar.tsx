
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  BarChart3,
  PiggyBank,
  FolderTree,
  Receipt,
  Target,
  CalendarDays,
  Settings,
  CreditCard,
  Upload,
} from "lucide-react";

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Helper functions
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted font-medium text-primary" : "hover:bg-muted/50";
  
  const sidebarItems = [
    { title: "Dashboard", path: "/", icon: BarChart3 },
    { title: "Deposits", path: "/deposits", icon: PiggyBank },
    { title: "Categories", path: "/categories", icon: FolderTree },
    { title: "Expenses", path: "/expenses", icon: Receipt },
    { title: "Goals", path: "/goals", icon: Target },
    { title: "Calendar", path: "/calendar", icon: CalendarDays },
    { title: "Settings", path: "/settings", icon: Settings },
  ];
  
  const expensesGroup = [
    { title: "Add Expense", path: "/expenses/add", icon: CreditCard },
    { title: "Scan Receipt", path: "/expenses/scan", icon: Receipt },
    { title: "Import CSV", path: "/expenses/import", icon: Upload },
  ];
  
  // Check if any items in the groups are active
  const isMainGroupActive = sidebarItems.some((item) => isActive(item.path));
  const isExpensesGroupActive = expensesGroup.some((item) => isActive(item.path));
  
  return (
    <Sidebar
      className={`border-r transition-all ${collapsed ? "w-14" : "w-60"}`}
      collapsible
    >
      <SidebarTrigger className="m-2 self-end md:hidden" />
      <SidebarContent>
        <SidebarGroup open={isMainGroupActive} defaultOpen>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup open={isExpensesGroupActive}>
          <SidebarGroupLabel>Expense Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {expensesGroup.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
