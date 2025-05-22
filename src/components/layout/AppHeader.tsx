
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Timer, Settings, ChevronDown } from "lucide-react";

export const AppHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="h-14 border-b bg-white flex items-center px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <h1 className="text-xl font-bold tracking-tight">Joint Bank Tracker</h1>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Timer className="h-4 w-4" />
              {!isMobile && <span>All Time</span>}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>3 Months</DropdownMenuItem>
            <DropdownMenuItem>6 Months</DropdownMenuItem>
            <DropdownMenuItem>1 Year</DropdownMenuItem>
            <DropdownMenuItem>Year to Date</DropdownMenuItem>
            <DropdownMenuItem>All Time</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
