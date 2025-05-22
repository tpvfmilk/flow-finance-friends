
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Category, Expense, SortConfig } from "@/lib/types";
import { formatCurrency, calculateRemainingBalance } from "@/lib/utils";
import { Pin, PinOff, ArrowUp, ArrowDown, SortAscending, SortDescending } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryBreakdownProps {
  categories: Category[];
  expenses: Expense[];
  deposits: { totalAllocated: Record<string, number> };
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  pinnedCategoryIds: string[];
  onTogglePin: (categoryId: string) => void;
}

export function CategoryBreakdown({
  categories,
  expenses,
  deposits,
  sortConfig,
  onSort,
  pinnedCategoryIds,
  onTogglePin,
}: CategoryBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  // Helper to render sort indicator
  const getSortDirectionIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <SortAscending size={16} className="ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={16} className="ml-1" />
      : <ArrowDown size={16} className="ml-1" />;
  };
  
  // Helper function to create sortable column headers
  const SortableHeader = ({ column, label }: { column: string, label: string }) => (
    <div 
      className="flex items-center cursor-pointer hover:text-foreground" 
      onClick={() => onSort(column)}
    >
      {label}
      {getSortDirectionIcon(column)}
    </div>
  );
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>
                  <SortableHeader column="name" label="Category" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortableHeader column="percentage" label="Percentage" />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="allocated" label="Allocated" />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="spent" label="Spent" />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="remaining" label="Remaining" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const allocated = deposits.totalAllocated[category.id] || 0;
                const remaining = calculateRemainingBalance(allocated, expenses, category.id);
                const spent = allocated - remaining;
                const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;
                const isPinned = pinnedCategoryIds.includes(category.id);
                
                const categoryExpenses = expenses.filter(
                  (expense) => expense.categoryId === category.id
                );
                
                return (
                  <>
                    <TableRow 
                      key={category.id}
                      className={`cursor-pointer hover:bg-muted/50 ${isPinned ? 'bg-muted/30' : ''}`}
                    >
                      <TableCell className="w-[30px] pr-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(category.id);
                              }}
                              className="p-1 rounded-full hover:bg-muted"
                            >
                              {isPinned ? (
                                <PinOff size={16} className="text-muted-foreground" />
                              ) : (
                                <Pin size={16} className="text-muted-foreground" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {isPinned ? 'Unpin category' : 'Pin category to top'}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell onClick={() => toggleCategory(category.id)}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell" onClick={() => toggleCategory(category.id)}>
                        {category.percentage}%
                      </TableCell>
                      <TableCell className="text-right" onClick={() => toggleCategory(category.id)}>
                        {formatCurrency(allocated)}
                      </TableCell>
                      <TableCell className="text-right" onClick={() => toggleCategory(category.id)}>
                        {formatCurrency(spent)}
                      </TableCell>
                      <TableCell className="text-right" onClick={() => toggleCategory(category.id)}>
                        {formatCurrency(remaining)}
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${category.id}-progress`}>
                      <TableCell colSpan={6} className="px-4 py-1">
                        <Progress value={spentPercentage} className="h-2" />
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded view for expenses */}
                    {expandedCategory === category.id && categoryExpenses.length > 0 && (
                      <TableRow key={`${category.id}-expanded`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <div className="p-2">
                            <h4 className="font-medium mb-2">Recent Expenses</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categoryExpenses
                                  .slice(0, 3)
                                  .map((expense) => (
                                    <TableRow key={expense.id}>
                                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                      <TableCell>{expense.description}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
