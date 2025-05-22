
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
import { Category, Expense } from "@/lib/types";
import { formatCurrency, calculateRemainingBalance } from "@/lib/utils";

interface CategoryBreakdownProps {
  categories: Category[];
  expenses: Expense[];
  deposits: { totalAllocated: Record<string, number> };
}

export function CategoryBreakdown({
  categories,
  expenses,
  deposits,
}: CategoryBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Percentage</TableHead>
              <TableHead className="text-right">Allocated</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const allocated = deposits.totalAllocated[category.id] || 0;
              const remaining = calculateRemainingBalance(allocated, expenses, category.id);
              const spent = allocated - remaining;
              const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;
              
              const categoryExpenses = expenses.filter(
                (expense) => expense.categoryId === category.id
              );
              
              return (
                <>
                  <TableRow 
                    key={category.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{category.percentage}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(allocated)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(spent)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(remaining)}</TableCell>
                  </TableRow>
                  <TableRow key={`${category.id}-progress`}>
                    <TableCell colSpan={5} className="px-4 py-1">
                      <Progress value={spentPercentage} className="h-2" />
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded view for expenses */}
                  {expandedCategory === category.id && categoryExpenses.length > 0 && (
                    <TableRow key={`${category.id}-expanded`}>
                      <TableCell colSpan={5} className="bg-muted/30 p-0">
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
  );
}
