
import { useState, useEffect } from "react";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePeriod } from "@/lib/types";
import { filterExpensesByDate } from "@/lib/utils";

// Mock data for development
import { getMockSankeyData, getMockStats, getMockCategories, getMockExpenses, getMockDeposits } from "@/lib/mock-data";

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [sankeyData, setSankeyData] = useState(getMockSankeyData());
  const [stats, setStats] = useState(getMockStats());
  const [categories, setCategories] = useState(getMockCategories());
  const [expenses, setExpenses] = useState(getMockExpenses());
  const [deposits, setDeposits] = useState(getMockDeposits());
  
  // Create a map of category IDs to names for display purposes
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);
  
  // Effect to update data when time period changes
  useEffect(() => {
    // Filter expenses by time period
    const filteredExpenses = filterExpensesByDate(expenses, timePeriod);
    
    // Update stats based on filtered expenses
    // For a real app, this would make API calls to get updated data
    console.log(`Updating data for time period: ${timePeriod}`);
    
    // In a real app, this would be replaced with an API call or local data processing
    setStats({
      ...stats,
      totalExpenses: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    });
    
  }, [timePeriod]);
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your joint financial flow and spending categories.
        </p>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
        <TabsList>
          <TabsTrigger value="3m">3 Months</TabsTrigger>
          <TabsTrigger value="6m">6 Months</TabsTrigger>
          <TabsTrigger value="1y">1 Year</TabsTrigger>
          <TabsTrigger value="ytd">Year to Date</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="3m" className="mt-0">
          <StatsSummary {...stats} />
        </TabsContent>
        <TabsContent value="6m" className="mt-0">
          <StatsSummary {...stats} />
        </TabsContent>
        <TabsContent value="1y" className="mt-0">
          <StatsSummary {...stats} />
        </TabsContent>
        <TabsContent value="ytd" className="mt-0">
          <StatsSummary {...stats} />
        </TabsContent>
        <TabsContent value="all" className="mt-0">
          <StatsSummary {...stats} />
        </TabsContent>
      </Tabs>
      
      {/* Temporarily comment out the SankeyChart component that's causing the error */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Money Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          <SankeyChart data={sankeyData} />
        </CardContent>
      </Card> */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown 
          categories={categories} 
          expenses={expenses}
          deposits={{ totalAllocated: deposits.allocations }}
        />
        <RecentActivity 
          expenses={expenses} 
          deposits={deposits.deposits} 
          categoryMap={categoryMap} 
        />
      </div>
    </div>
  );
}

export default Dashboard;
