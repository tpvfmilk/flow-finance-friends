import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePeriod, SortConfig, Category } from "@/lib/types";
import { filterExpensesByDate } from "@/lib/utils";
import { SankeyChart } from "@/components/dashboard/SankeyChart";

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [pinnedCategoryIds, setPinnedCategoryIds] = useState<string[]>([]);

  // Fetch real data from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        percentage: Number(cat.allocation_percentage),
        color: cat.color,
        currentBalance: 0, // Will be calculated based on historical allocations
        isPinned: false
      })) as Category[];
    }
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        categoryId: exp.category_id || '',
        description: exp.description,
        date: exp.date,
        type: "one-off" as const,
        verified: true
      }));
    }
  });

  // Keep the raw deposit data for easier access to database fields
  const { data: rawDeposits = [] } = useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch historical allocations - NEW
  const { data: categoryAllocations = [] } = useQuery({
    queryKey: ['category-allocations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_allocations')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('=== Goals Data Debug ===');
      console.log('Raw goals data:', data);
      return data;
    }
  });

  const { data: partnerSettings } = useQuery({
    queryKey: ['partner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching partner settings:', error);
        return null;
      }
      return data;
    }
  });

  // Filter expenses by time period
  const filteredExpenses = filterExpensesByDate(expenses, timePeriod);
  
  // Calculate real-time statistics using raw deposit data
  const totalDeposits = rawDeposits.reduce((sum, dep) => 
    sum + Number(dep.amount), 0
  );
  
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = totalDeposits - totalExpenses;
  
  // Calculate monthly stats (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const depositsThisMonth = rawDeposits
    .filter(dep => {
      const depDate = new Date(dep.date);
      return depDate.getMonth() === currentMonth && depDate.getFullYear() === currentYear;
    })
    .reduce((sum, dep) => sum + Number(dep.amount), 0);
    
  const expensesThisMonth = expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const stats = {
    totalDeposits,
    totalExpenses,
    remainingBalance,
    depositsThisMonth,
    expensesThisMonth
  };

  // Create a map of category IDs to names for display purposes
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);

  // Calculate allocations using historical allocation data - UPDATED
  const calculateAllocations = () => {
    const allocations: Record<string, number> = {};
    
    // Sum up all historical allocations for each category
    categoryAllocations.forEach(allocation => {
      if (!allocations[allocation.category_id]) {
        allocations[allocation.category_id] = 0;
      }
      allocations[allocation.category_id] += Number(allocation.allocated_amount);
    });
    
    return allocations;
  };

  const allocations = calculateAllocations();

  console.log('=== Dashboard Historical Allocation Debug ===');
  console.log('Total deposits:', totalDeposits);
  console.log('Historical allocations:', allocations);
  console.log('Category allocations data:', categoryAllocations);

  // Calculate individual contributor amounts
  const partner1Deposits = rawDeposits
    .filter(d => d.contributor_name === (partnerSettings?.partner1_name || "Tyler"))
    .reduce((sum, d) => sum + Number(d.amount), 0);
  
  const partner2Deposits = rawDeposits
    .filter(d => d.contributor_name === (partnerSettings?.partner2_name || "Jenn"))
    .reduce((sum, d) => sum + Number(d.amount), 0);

  // Generate Sankey data from real data with historical allocations - UPDATED
  const sankeyData = {
    nodes: [
      // Source nodes (contributors) 
      { name: partnerSettings?.partner1_name || "Tyler", value: partner1Deposits, type: "deposit" as const, id: "tyler" },
      { name: partnerSettings?.partner2_name || "Jenn", value: partner2Deposits, type: "deposit" as const, id: "jenn" },
      // Joint account node
      { name: "Joint Account", value: totalDeposits, type: "joint" as const, id: "joint" },
      // Category nodes - with historical allocated amounts
      ...categories.map(cat => ({
        name: cat.name,
        value: allocations[cat.id] || 0, // Use historical allocation
        type: "category" as const,
        id: cat.id,
        category: cat.name
      })),
      // Goal nodes - use target_amount for display value
      ...goals.map(goal => ({
        name: goal.name,
        value: Number(goal.target_amount) || 0,
        type: "goal" as const,
        id: goal.id
      }))
    ],
    links: [
      // Tyler to Joint Account - only if value > 0
      ...(partner1Deposits > 0 ? [{
        source: "tyler",
        target: "joint",
        value: partner1Deposits,
        category: "deposit"
      }] : []),
      // Jenn to Joint Account - only if value > 0
      ...(partner2Deposits > 0 ? [{
        source: "jenn",
        target: "joint",
        value: partner2Deposits,
        category: "deposit"
      }] : []),
      // Joint Account to Categories - use the historical allocations
      ...categories.map((cat) => ({
        source: "joint", // Joint Account
        target: cat.id, // Category node
        value: allocations[cat.id] || 0, // Use historical allocation
        category: cat.name
      })).filter(link => link.value > 0),
      // Categories to Goals
      ...goals.flatMap((goal) => {
        if (goal.category_id) {
          const category = categories.find(cat => cat.id === goal.category_id);
          if (category) {
            const categoryAllocation = allocations[goal.category_id] || 0;
            const flowValue = Math.max(
              categoryAllocation * 0.1,
              Number(goal.target_amount) * 0.05
            );
            
            console.log('=== Goal Link Debug ===');
            console.log('Goal:', goal.name, 'Category:', category.name, 'Flow Value:', flowValue);
            
            return [{
              source: goal.category_id,
              target: goal.id,
              value: flowValue,
              category: goal.name
            }];
          }
        }
        return [];
      })
    ]
  };

  console.log('=== Sankey Data Debug ===');
  console.log('Sankey nodes:', sankeyData.nodes);
  console.log('Sankey links:', sankeyData.links);

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
    // Create a copy with isPinned flag and calculated allocated amounts
    const categoriesWithPinFlag = categories.map(category => ({
      ...category,
      isPinned: pinnedCategoryIds.includes(category.id),
      currentBalance: allocations[category.id] || 0 // Use the historical allocated amount
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
          // Calculate allocated amount based on historical allocations
          const allocatedA = allocations[a.id] || 0;
          const allocatedB = allocations[b.id] || 0;
          
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

  // Create deposits object with historical allocations for CategoryBreakdown
  const depositsWithAllocations = {
    totalAllocated: allocations
  };

  // Create deposits array for RecentActivity - transform raw deposits to match expected interface
  const depositsForActivity = rawDeposits.map(dep => ({
    id: dep.id,
    date: dep.date,
    type: dep.type as "recurring" | "one-off",
    person1Amount: dep.contributor_name === (partnerSettings?.partner1_name || "Tyler") ? Number(dep.amount) : 0,
    person2Amount: dep.contributor_name === (partnerSettings?.partner2_name || "Jenn") ? Number(dep.amount) : 0,
    description: dep.description || `${dep.type} deposit`,
    allocations: allocations // Pass the historical allocations here
  }));
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Track your joint financial flow and spending categories.
            </p>
          </div>
        </div>
        
        {/* Time Period Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <Tabs 
            defaultValue="all" 
            className="w-full" 
            onValueChange={(v) => setTimePeriod(v as TimePeriod)}
          >
            <div className="border-b border-gray-100 px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-5 bg-gray-100">
                <TabsTrigger value="3m" className="text-sm">3 Months</TabsTrigger>
                <TabsTrigger value="6m" className="text-sm">6 Months</TabsTrigger>
                <TabsTrigger value="1y" className="text-sm">1 Year</TabsTrigger>
                <TabsTrigger value="ytd" className="text-sm">YTD</TabsTrigger>
                <TabsTrigger value="all" className="text-sm">All Time</TabsTrigger>
              </TabsList>
            </div>

            {/* Stats Summary for all tabs */}
            <div className="p-6">
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
            </div>
          </Tabs>
        </div>
        
        {/* Money Flow Chart */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Money Flow
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Visualize how money flows from deposits to spending categories
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-gray-50 rounded-lg p-4" style={{ height: "520px" }}>
              <SankeyChart 
                data={sankeyData} 
                height={500} 
                allocations={allocations}
                expenses={filteredExpenses}
                goals={goals}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Category Breakdown
          </h2>
          <CategoryBreakdown 
            categories={sortedCategories} 
            expenses={filteredExpenses}
            deposits={depositsWithAllocations}
            sortConfig={sortConfig}
            onSort={handleSort}
            pinnedCategoryIds={pinnedCategoryIds}
            onTogglePin={handleTogglePin}
          />
        </div>
        
        {/* Recent Activity */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <RecentActivity 
            expenses={filteredExpenses} 
            deposits={depositsForActivity} 
            categoryMap={categoryMap} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
