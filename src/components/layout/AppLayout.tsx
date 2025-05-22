
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { FloatingActionButton } from "./FloatingActionButton";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <AppHeader />
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <FloatingActionButton />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
