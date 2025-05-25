import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Wallet,
  Tags,
  CreditCard,
  PieChart,
  Calendar,
  Settings,
  Map,
} from "lucide-react";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="flex flex-col flex-grow px-3 py-4">
        <SidebarMenu className="space-y-3">
          <SidebarMenuButton asChild>
            <NavLink to="/" className={cn({
              'text-blue-500': pathname === "/"
            })}>
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-base font-medium">Dashboard</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/map" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname === "/map" })
            }>
              <Map className="h-5 w-5" />
              <span className="text-base font-medium">Map View</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuItem className="py-3">
            <div className="px-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Transactions
            </div>
          </SidebarMenuItem>
          
          <SidebarMenuButton asChild>
            <NavLink to="/deposits" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname === "/deposits" })
            }>
              <Wallet className="h-5 w-5" />
              <span className="text-base font-medium">Deposits</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/categories" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <Tags className="h-5 w-5" />
              <span className="text-base font-medium">Categories</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/expenses" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname.startsWith("/expenses") })
            }>
              <CreditCard className="h-5 w-5" />
              <span className="text-base font-medium">Expenses</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuItem className="py-3">
            <div className="px-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Planning
            </div>
          </SidebarMenuItem>
          
          <SidebarMenuButton asChild>
            <NavLink to="/goals" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <PieChart className="h-5 w-5" />
              <span className="text-base font-medium">Goals</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/calendar" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <Calendar className="h-5 w-5" />
              <span className="text-base font-medium">Calendar</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="px-3 py-4">
        <SidebarMenuButton asChild>
          <NavLink to="/settings" className={({ isActive }) => 
            cn({ 'text-blue-500': isActive })
          }>
            <Settings className="h-5 w-5" />
            <span className="text-base font-medium">Settings</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
