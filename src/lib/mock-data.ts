import { SankeyData, Category, Expense } from "./types";
import { generateId, getHexColor } from "./utils";

// Unified allocation amounts that will be used across all components
const UNIFIED_ALLOCATIONS = {
  "cat1": 2700,   // Groceries
  "cat2": 1800,   // Dining  
  "cat3": 1350,   // Transportation
  "cat4": 900,    // Shopping
  "cat5": 1350,   // Bills
  "cat6": 900     // Entertainment
};

// Unified expense amounts that match the Category Breakdown
const UNIFIED_EXPENSES = {
  "cat1": 120.50,  // Groceries
  "cat2": 85.75,   // Dining
  "cat3": 45.00,   // Transportation
  "cat4": 250.00,  // Shopping
  "cat5": 120.00,  // Bills
  "cat6": 15.95    // Entertainment
};

// Unified goal targets for savings goals
const UNIFIED_GOAL_TARGETS = {
  "goal1": 3500, // Weekly Shop target
  "goal2": 6000, // Special Dinners target
  "goal3": 2000, // Car Repair target
  "goal4": 4000, // New Laptop target
  "goal5": 3800, // Utility Bills target
  "goal6": 105   // Movie Night target
};

// Unified goal progress - calculated from remaining amounts after expenses
const UNIFIED_GOAL_PROGRESS = {
  "goal1": UNIFIED_ALLOCATIONS.cat1 - UNIFIED_EXPENSES.cat1, // $2,579.50
  "goal2": UNIFIED_ALLOCATIONS.cat2 - UNIFIED_EXPENSES.cat2, // $1,714.25
  "goal3": UNIFIED_ALLOCATIONS.cat3 - UNIFIED_EXPENSES.cat3, // $1,305.00
  "goal4": UNIFIED_ALLOCATIONS.cat4 - UNIFIED_EXPENSES.cat4, // $650.00
  "goal5": UNIFIED_ALLOCATIONS.cat5 - UNIFIED_EXPENSES.cat5, // $1,230.00
  "goal6": UNIFIED_ALLOCATIONS.cat6 - UNIFIED_EXPENSES.cat6  // $884.05
};

// Mock data for development purposes
export function getMockSankeyData(): SankeyData {
  return {
    nodes: [
      // Deposit sources
      { name: "Person 1", id: "person1", type: "deposit", value: 5250 },
      { name: "Person 2", id: "person2", type: "deposit", value: 3750 },
      
      // Categories (using unified allocation amounts)
      { name: "Groceries", id: "cat1", type: "category", value: UNIFIED_ALLOCATIONS.cat1, category: "groceries" },
      { name: "Dining", id: "cat2", type: "category", value: UNIFIED_ALLOCATIONS.cat2, category: "dining" },
      { name: "Transport", id: "cat3", type: "category", value: UNIFIED_ALLOCATIONS.cat3, category: "transportation" },
      { name: "Shopping", id: "cat4", type: "category", value: UNIFIED_ALLOCATIONS.cat4, category: "shopping" },
      { name: "Bills", id: "cat5", type: "category", value: UNIFIED_ALLOCATIONS.cat5, category: "bills" },
      { name: "Entertainment", id: "cat6", type: "category", value: UNIFIED_ALLOCATIONS.cat6, category: "entertainment" },
      
      // Goals (using actual flow amounts - remaining after expenses)
      { name: "Weekly Shop", id: "goal1", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal1, category: "groceries" },
      { name: "Special Dinners", id: "goal2", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal2, category: "dining" },
      { name: "Car Repair", id: "goal3", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal3, category: "transportation" },
      { name: "New Laptop", id: "goal4", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal4, category: "shopping" },
      { name: "Utility Bills", id: "goal5", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal5, category: "bills" },
      { name: "Movie Night", id: "goal6", type: "goal", value: UNIFIED_GOAL_PROGRESS.goal6, category: "entertainment" },
    ],
    links: [
      // Person to categories (balanced to match total allocations)
      { source: "person1", target: "cat1", value: 1620 }, // 60% of Groceries
      { source: "person1", target: "cat2", value: 1080 }, // 60% of Dining
      { source: "person1", target: "cat3", value: 810 },  // 60% of Transportation
      { source: "person1", target: "cat4", value: 540 },  // 60% of Shopping
      { source: "person1", target: "cat5", value: 810 },  // 60% of Bills
      { source: "person1", target: "cat6", value: 390 },  // 60% of Entertainment
      
      { source: "person2", target: "cat1", value: 1080 }, // 40% of Groceries
      { source: "person2", target: "cat2", value: 720 },  // 40% of Dining
      { source: "person2", target: "cat3", value: 540 },  // 40% of Transportation
      { source: "person2", target: "cat4", value: 360 },  // 40% of Shopping
      { source: "person2", target: "cat5", value: 540 },  // 40% of Bills
      { source: "person2", target: "cat6", value: 510 },  // 40% of Entertainment + remainder
      
      // Categories to goals (remaining after expenses)
      { source: "cat1", target: "goal1", value: UNIFIED_GOAL_PROGRESS.goal1, category: "groceries" },
      { source: "cat2", target: "goal2", value: UNIFIED_GOAL_PROGRESS.goal2, category: "dining" },
      { source: "cat3", target: "goal3", value: UNIFIED_GOAL_PROGRESS.goal3, category: "transportation" },
      { source: "cat4", target: "goal4", value: UNIFIED_GOAL_PROGRESS.goal4, category: "shopping" },
      { source: "cat5", target: "goal5", value: UNIFIED_GOAL_PROGRESS.goal5, category: "bills" },
      { source: "cat6", target: "goal6", value: UNIFIED_GOAL_PROGRESS.goal6, category: "entertainment" },
    ]
  };
}

export function getMockStats() {
  const totalAllocated = Object.values(UNIFIED_ALLOCATIONS).reduce((sum, val) => sum + val, 0);
  const totalSpent = Object.values(UNIFIED_EXPENSES).reduce((sum, val) => sum + val, 0);
  
  return {
    totalDeposits: 9000, // Person 1 + Person 2
    totalExpenses: totalSpent,
    remainingBalance: totalAllocated - totalSpent,
    depositsThisMonth: 3500,
    expensesThisMonth: totalSpent
  };
}

export function getMockCategories(): Category[] {
  return [
    {
      id: "cat1",
      name: "Groceries",
      percentage: 30,
      color: getHexColor("groceries"),
      currentBalance: UNIFIED_ALLOCATIONS.cat1 - UNIFIED_EXPENSES.cat1
    },
    {
      id: "cat2",
      name: "Dining",
      percentage: 20,
      color: getHexColor("dining"),
      currentBalance: UNIFIED_ALLOCATIONS.cat2 - UNIFIED_EXPENSES.cat2
    },
    {
      id: "cat3",
      name: "Transportation",
      percentage: 15,
      color: getHexColor("transportation"),
      currentBalance: UNIFIED_ALLOCATIONS.cat3 - UNIFIED_EXPENSES.cat3
    },
    {
      id: "cat4",
      name: "Shopping",
      percentage: 10,
      color: getHexColor("shopping"),
      currentBalance: UNIFIED_ALLOCATIONS.cat4 - UNIFIED_EXPENSES.cat4
    },
    {
      id: "cat5",
      name: "Bills",
      percentage: 15,
      color: getHexColor("bills"),
      currentBalance: UNIFIED_ALLOCATIONS.cat5 - UNIFIED_EXPENSES.cat5
    },
    {
      id: "cat6",
      name: "Entertainment",
      percentage: 10,
      color: getHexColor("entertainment"),
      currentBalance: UNIFIED_ALLOCATIONS.cat6 - UNIFIED_EXPENSES.cat6
    }
  ];
}

export function getMockExpenses(): Expense[] {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 14);
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  return [
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat1,
      categoryId: "cat1",
      description: "Weekly groceries",
      date: today.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat2,
      categoryId: "cat2",
      description: "Dinner with friends",
      date: oneWeekAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat3,
      categoryId: "cat3",
      description: "Gas refill",
      date: oneWeekAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat4,
      categoryId: "cat4",
      description: "New shoes",
      date: twoWeeksAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "receipt",
      receiptImage: "base64_image",
      verified: true
    },
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat5,
      categoryId: "cat5",
      description: "Electric bill",
      date: oneMonthAgo.toISOString().split('T')[0],
      type: "recurring",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: UNIFIED_EXPENSES.cat6,
      categoryId: "cat6",
      description: "Movie tickets",
      date: twoWeeksAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    }
  ];
}

export function getMockDeposits() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(today.getMonth() - 2);
  
  return {
    deposits: [
      {
        id: generateId(),
        date: today.toISOString().split('T')[0],
        type: "recurring",
        person1Amount: 2000,
        person2Amount: 1500,
        description: "Monthly deposit"
      },
      {
        id: generateId(),
        date: oneMonthAgo.toISOString().split('T')[0],
        type: "recurring",
        person1Amount: 2000,
        person2Amount: 1500,
        description: "Monthly deposit"
      },
      {
        id: generateId(),
        date: twoMonthsAgo.toISOString().split('T')[0],
        type: "recurring",
        person1Amount: 2000,
        person2Amount: 1500,
        description: "Monthly deposit"
      }
    ],
    allocations: UNIFIED_ALLOCATIONS
  };
}

// Export the unified data for use in components
export { 
  UNIFIED_ALLOCATIONS, 
  UNIFIED_EXPENSES, 
  UNIFIED_GOAL_TARGETS, 
  UNIFIED_GOAL_PROGRESS 
};
