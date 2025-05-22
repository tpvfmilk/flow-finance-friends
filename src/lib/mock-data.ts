
import { SankeyData, Category, Expense } from "./types";
import { generateId, getHexColor } from "./utils";

// Mock data for development purposes
export function getMockSankeyData(): SankeyData {
  return {
    nodes: [
      // Deposit sources
      { name: "Person 1", id: "person1", type: "deposit", value: 25848 },
      { name: "Person 2", id: "person2", type: "deposit", value: 7508.97 },
      
      // Categories
      { name: "Groceries", id: "cat1", type: "category", value: 5895.47, category: "groceries" },
      { name: "Dining", id: "cat2", type: "category", value: 504185.42, category: "dining" },
      { name: "Transport", id: "cat3", type: "category", value: 260235.27, category: "transportation" },
      { name: "Shopping", id: "cat4", type: "category", value: 343937.26, category: "shopping" },
      { name: "Bills", id: "cat5", type: "category", value: 535263.63, category: "bills" },
      { name: "Coffee", id: "cat6", type: "category", value: 25182.74, category: "entertainment" },
      
      // Expense destinations
      { name: "Groceries", id: "exp1", type: "expense", value: 5895.47 },
      { name: "Restaurants & Bars", id: "exp2", type: "expense", value: 504185.42 },
      { name: "Clothing", id: "exp3", type: "expense", value: 83701.99 },
      { name: "Shopping", id: "exp4", type: "expense", value: 260235.27 },
      { name: "Food & Dining", id: "exp5", type: "expense", value: 535263.63 },
      { name: "Coffee Shops", id: "exp6", type: "expense", value: 25182.74 },
      { name: "Travel", id: "exp7", type: "expense", value: 133489.64 },
      { name: "Miscellaneous", id: "exp8", type: "expense", value: 165227.11 },
    ],
    links: [
      // Person to category
      { source: "person1", target: "cat1", value: 3000 },
      { source: "person1", target: "cat2", value: 8000 },
      { source: "person1", target: "cat3", value: 5000 },
      { source: "person1", target: "cat4", value: 6000 },
      { source: "person1", target: "cat5", value: 3848 },
      { source: "person2", target: "cat1", value: 2895.47 },
      { source: "person2", target: "cat2", value: 2508.97 },
      { source: "person2", target: "cat5", value: 2000 },
      { source: "person2", target: "cat6", value: 105 },
      
      // Category to expense
      { source: "cat1", target: "exp1", value: 5895.47, category: "groceries" },
      { source: "cat2", target: "exp2", value: 10508.97, category: "dining" },
      { source: "cat3", target: "exp4", value: 5000, category: "transportation" },
      { source: "cat4", target: "exp3", value: 6000, category: "shopping" },
      { source: "cat5", target: "exp5", value: 5848, category: "bills" },
      { source: "cat6", target: "exp6", value: 105, category: "entertainment" },
    ]
  };
}

export function getMockStats() {
  return {
    totalDeposits: 33356.97,
    totalExpenses: 28357.44,
    remainingBalance: 4999.53,
    depositsThisMonth: 5000,
    expensesThisMonth: 3210.75
  };
}

export function getMockCategories(): Category[] {
  return [
    {
      id: "cat1",
      name: "Groceries",
      percentage: 30,
      color: getHexColor("groceries"),
      currentBalance: 450
    },
    {
      id: "cat2",
      name: "Dining",
      percentage: 20,
      color: getHexColor("dining"),
      currentBalance: 800
    },
    {
      id: "cat3",
      name: "Transportation",
      percentage: 15,
      color: getHexColor("transportation"),
      currentBalance: 320
    },
    {
      id: "cat4",
      name: "Shopping",
      percentage: 10,
      color: getHexColor("shopping"),
      currentBalance: 175
    },
    {
      id: "cat5",
      name: "Bills",
      percentage: 15,
      color: getHexColor("bills"),
      currentBalance: 540
    },
    {
      id: "cat6",
      name: "Entertainment",
      percentage: 10,
      color: getHexColor("entertainment"),
      currentBalance: 220
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
      amount: 120.50,
      categoryId: "cat1",
      description: "Weekly groceries",
      date: today.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: 85.75,
      categoryId: "cat2",
      description: "Dinner with friends",
      date: oneWeekAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: 45.00,
      categoryId: "cat3",
      description: "Gas refill",
      date: oneWeekAgo.toISOString().split('T')[0],
      type: "one-off",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: 250.00,
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
      amount: 120.00,
      categoryId: "cat5",
      description: "Electric bill",
      date: oneMonthAgo.toISOString().split('T')[0],
      type: "recurring",
      source: "manual",
      verified: true
    },
    {
      id: generateId(),
      amount: 15.95,
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
    allocations: {
      "cat1": 2700,
      "cat2": 1800,
      "cat3": 1350,
      "cat4": 900,
      "cat5": 1350,
      "cat6": 900
    }
  };
}
