
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/lib/types";

interface RecentActivityProps {
  expenses: Expense[];
  deposits: any[];
  categoryMap: Record<string, string>;
}

export function RecentActivity({ expenses, deposits, categoryMap }: RecentActivityProps) {
  // Combine expenses and deposits into a single activity array
  const activities = [
    ...expenses.map(expense => ({
      type: 'expense',
      date: expense.date,
      description: expense.description,
      category: categoryMap[expense.category_id] || 'Unknown',
      amount: -expense.amount // Negative for expenses
    })),
    ...deposits.map(deposit => ({
      type: 'deposit',
      date: deposit.date,
      description: deposit.description || 'Monthly Deposit',
      category: 'Deposit',
      amount: deposit.person1Amount + deposit.person2Amount // Positive for deposits
    }))
  ];

  // Sort by date, most recent first
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Only show the 10 most recent activities
  const recentActivities = activities.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((activity, index) => (
              <TableRow key={`activity-${index}`}>
                <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell className="hidden md:table-cell">{activity.category}</TableCell>
                <TableCell 
                  className={`text-right ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(activity.amount)}
                </TableCell>
              </TableRow>
            ))}
            {recentActivities.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No recent activity
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
