
import { useState, useEffect } from "react";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePeriod, SortConfig, Category } from "@/lib/types";
import { filterExpensesByDate } from "@/lib/utils";
import { SankeyChart } from "@/components/dashboard/SankeyChart";

// Mock data for development
import { getMockSankeyData, getMockStats, getMockCategories, getMockExpenses, getMockDeposits } from "@/lib/mock-data";

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [sankeyData, setSankeyData] = useState(getMockSankeyData());
  const [stats, setStats] = useState(getMockStats());
  const [categories, setCategories] = useState(getMockCategories());
  const [expenses, setExpenses] = useState(getMockExpenses());
  const [deposits, setDeposits] = useState(getMockDeposits());
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [pinnedCategoryIds, setPinnedCategoryIds] = useState<string[]>([]);
  
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
  
  // Handle sorting functionality
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Handle category pinning
  const handleTogglePin = (categoryId: string) => {
    setPinnedCategoryIds(prevPinned => {
      if (prevPinned.includes(categoryId)) {
        return prevPinned.filter(id => id !== categoryId);
      } else {
        return [...prevPinned, categoryId];
      }
    });
  };
  
  // Sort and organize categories (pinned categories first, then sorted)
  const getSortedCategories = () => {
    // Create a copy with isPinned flag
    const categoriesWithPinFlag = categories.map(category => ({
      ...category,
      isPinned: pinnedCategoryIds.includes(category.id)
    }));
    
    // Split into pinned and unpinned
    const pinnedCategories = categoriesWithPinFlag.filter(cat => cat.isPinned);
    const unpinnedCategories = categoriesWithPinFlag.filter(cat => !cat.isPinned);
    
    // Sort unpinned categories if sort config exists
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      unpinnedCategories.sort((a, b) => {
        // Special handling for calculated values
        if (key === 'spent' || key === 'remaining' || key === 'allocated') {
          const allocatedA = deposits.allocations[a.id] || 0;
          const allocatedB = deposits.allocations[b.id] || 0;
          
          // Calculate expenses for each category
          const expensesA = expenses
            .filter(exp => exp.categoryId === a.id)
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          const expensesB = expenses
            .filter(exp => exp.categoryId === b.id)
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          const remainingA = allocatedA - expensesA;
          const remainingB = allocatedB - expensesB;
          
          if (key === 'allocated') {
            return direction === 'ascending' ? allocatedA - allocatedB : allocatedB - allocatedA;
          } else if (key === 'spent') {
            return direction === 'ascending' ? expensesA - expensesB : expensesB - expensesA;
          } else { // remaining
            return direction === 'ascending' ? remainingA - remainingB : remainingB - remainingA;
          }
        }
        
        // For direct properties like name, percentage
        if (a[key as keyof typeof a] < b[key as keyof typeof b]) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (a[key as keyof typeof a] > b[key as keyof typeof b]) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Combine pinned and unpinned categories
    return [...pinnedCategories, ...unpinnedCategories];
  };
  
  // Get sorted categories for display
  const sortedCategories = getSortedCategories();
  
  // Update Sankey data when sorting or pinning changes
  useEffect(() => {
    // Get the sorted category IDs to maintain the same order in Sankey
    const categoryOrder = sortedCategories.map(cat => cat.id);
    
    // Update the Sankey data to reflect the new order
    const updatedSankeyData = getMockSankeyData();
    
    // Sort category nodes based on our sorted categories
    updatedSankeyData.nodes = updatedSankeyData.nodes.sort((a, b) => {
      // Only sort category nodes
      if (a.type === 'category' && b.type === 'category') {
        const indexA = categoryOrder.indexOf(a.id || '');
        const indexB = categoryOrder.indexOf(b.id || '');
        
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
      }
      return 0;
    });
    
    setSankeyData(updatedSankeyData);
  }, [sortConfig, pinnedCategoryIds]);
  
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
      
      <Card>
        <CardHeader>
          <CardTitle>Money Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          <SankeyChart data={sankeyData} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown 
          categories={sortedCategories} 
          expenses={expenses}
          deposits={{ totalAllocated: deposits.allocations }}
          sortConfig={sortConfig}
          onSort={handleSort}
          pinnedCategoryIds={pinnedCategoryIds}
          onTogglePin={handleTogglePin}
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
