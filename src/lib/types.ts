
// Types for the Joint Bank Account Tracker

// People
export interface Person {
  id: string;
  name: string;
  monthlyDeposit: number;
}

// Categories
export interface Category {
  id: string;
  name: string;
  percentage: number;
  color: string;
  currentBalance: number;
  isPinned?: boolean; // Added for pinning categories
}

// Category Allocations - NEW
export interface CategoryAllocation {
  id: string;
  categoryId: string;
  depositId: string;
  allocatedAmount: number;
  percentageUsed: number;
  createdAt: string;
  updatedAt: string;
}

// Expenses - Updated to match database schema
export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  date: string;
  merchant?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// Goals - Updated to match database schema
export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  category_id: string;
  target_date: string;
  priority: "low" | "medium" | "high";
  current_amount?: number;
  created_at: string;
  updated_at: string;
}

// Deposits - Updated to match database schema
export interface Deposit {
  id: string;
  date: string;
  type: "recurring" | "one-off";
  amount: number;
  contributor_name: string;
  description?: string;
  frequency?: string;
  created_at: string;
  updated_at: string;
}

// Sankey Data - Updated to work with recharts
export interface SankeyNode {
  name: string;
  value: number;
  // Using numerical index for compatibility with recharts
  index?: number; 
  type: "deposit" | "joint" | "category" | "expense" | "goal";
  category?: string;
  // We'll keep the id for our own reference
  id?: string; 
}

export interface SankeyLink {
  // These will be converted to numeric indices before rendering
  source: number | string; 
  target: number | string;
  value: number;
  category?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Time Period Filter
export type TimePeriod = "3m" | "6m" | "1y" | "ytd" | "all";

// Sort Configuration
export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

// Settings
export interface Settings {
  duplicateThreshold: number;
  autoCategorizationEnabled: boolean;
  cameraPermission: boolean;
  preferredOcrApi: "documentAI" | "vision";
  defaultCategories: Record<string, string>;
  learningRules: Array<{
    merchant: string;
    category: string;
    confidence: number;
  }>;
  notifications: {
    lowBalanceWarnings: boolean;
    upcomingPayments: boolean;
    goalDeadlines: boolean;
  };
}

// Receipt Data
export interface ReceiptData {
  amount: string;
  merchant: string;
  date: string;
  items: string[];
  suggestedCategory: string;
}
