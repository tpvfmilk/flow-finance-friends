
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsSummaryProps {
  totalDeposits: number;
  totalExpenses: number;
  remainingBalance: number;
  depositsThisMonth: number;
  expensesThisMonth: number;
}

export function StatsSummary({
  totalDeposits,
  totalExpenses,
  remainingBalance,
  depositsThisMonth,
  expensesThisMonth
}: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Deposits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalDeposits)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(depositsThisMonth)} deposited this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(expensesThisMonth)} spent this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Remaining Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(remainingBalance)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((remainingBalance / totalDeposits) * 100).toFixed(1)}% of total deposits
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
