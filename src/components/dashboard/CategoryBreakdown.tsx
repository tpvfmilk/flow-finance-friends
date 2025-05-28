
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category, Expense, SortConfig } from "@/lib/types";
import { formatCurrency, calculateRemainingBalance } from "@/lib/utils";
import { Pin, PinOff, ArrowUp, ArrowDown, Edit, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategoryPercentages } from "@/hooks/useCategoryPercentages";
import { useQueryClient } from "@tanstack/react-query";

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
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const { updateCategoryPercentage, validateTotalPercentage, isUpdating } = useCategoryPercentages();
  const queryClient = useQueryClient();
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleEditStart = (categoryId: string, currentPercentage: number) => {
    setEditingCategory(categoryId);
    setEditingValue(currentPercentage.toString());
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditingValue("");
  };

  const handleEditSave = async (categoryId: string) => {
    const newPercentage = parseFloat(editingValue);
    
    if (isNaN(newPercentage) || newPercentage < 0) {
      return;
    }

    const isValid = await validateTotalPercentage(categoryId, newPercentage);
    if (!isValid) {
      // Could show a toast or error message here
      return;
    }

    const success = await updateCategoryPercentage(categoryId, newPercentage);
    if (success) {
      setEditingCategory(null);
      setEditingValue("");
      // Refetch data to show updated percentages
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  };
  
  // Helper to render sort indicator
  const getSortDirectionIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowDown size={16} className="ml-1 opacity-50" />;
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

  // Calculate summary totals
  const calculateSummaryTotals = () => {
    const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);
    const totalAllocated = Object.values(deposits.totalAllocated).reduce((sum, amount) => sum + amount, 0);
    const totalSpent = categories.reduce((sum, category) => {
      const allocated = deposits.totalAllocated[category.id] || 0;
      const remaining = calculateRemainingBalance(allocated, expenses, category.id);
      return sum + (allocated - remaining);
    }, 0);
    const totalRemaining = totalAllocated - totalSpent;

    return { totalPercentage, totalAllocated, totalSpent, totalRemaining };
  };

  const summaryTotals = calculateSummaryTotals();
  
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
                const isEditing = editingCategory === category.id;
                
                const categoryExpenses = expenses.filter(
                  (expense) => expense.category_id === category.id
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
                      <TableCell className="hidden sm:table-cell">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-20"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <span className="text-sm">%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSave(category.id)}
                              disabled={isUpdating === category.id}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleEditCancel}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{category.percentage}%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(category.id, category.percentage);
                              }}
                              className="p-1 h-auto"
                            >
                              <Edit size={12} />
                            </Button>
                          </div>
                        )}
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
              
              {/* Summary Row */}
              <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {summaryTotals.totalPercentage.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(summaryTotals.totalAllocated)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(summaryTotals.totalSpent)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(summaryTotals.totalRemaining)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
