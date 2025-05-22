
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Receipt, CreditCard, Upload } from "lucide-react";

export const FloatingActionButton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            className="floating-action-button h-12 w-12"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mb-2">
          <DropdownMenuItem onClick={() => navigate("/expenses/add")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Add Expense</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/expenses/scan")}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Scan Receipt</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/expenses/import")}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Import CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
