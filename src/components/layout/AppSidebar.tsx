
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
    <Sidebar isMobile={isMobile} defaultCollapsed={false} collapsible="offcanvas">
      <SidebarContent className="flex flex-col flex-grow">
        <SidebarMenu>
          <SidebarMenuButton asChild>
            <NavLink to="/" className={cn({
              'text-blue-500': pathname === "/"
            })}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/map" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname === "/map" })
            }>
              <Map className="h-5 w-5" />
              <span>Map View</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuItem>
            Transactions
          </SidebarMenuItem>
          
          <SidebarMenuButton asChild>
            <NavLink to="/deposits" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname === "/deposits" })
            }>
              <Wallet className="h-5 w-5" />
              <span>Deposits</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/categories" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <Tags className="h-5 w-5" />
              <span>Categories</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/expenses" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive || pathname.startsWith("/expenses") })
            }>
              <CreditCard className="h-5 w-5" />
              <span>Expenses</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuItem>
            Planning
          </SidebarMenuItem>
          
          <SidebarMenuButton asChild>
            <NavLink to="/goals" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <PieChart className="h-5 w-5" />
              <span>Goals</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton asChild>
            <NavLink to="/calendar" className={({ isActive }) => 
              cn({ 'text-blue-500': isActive })
            }>
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <NavLink to="/settings" className={({ isActive }) => 
            cn({ 'text-blue-500': isActive })
          }>
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
