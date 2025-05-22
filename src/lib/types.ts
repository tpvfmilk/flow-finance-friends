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

// Expenses
export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  type: "recurring" | "one-off";
  source?: "manual" | "receipt" | "csv";
  receiptImage?: string;
  csvFile?: string;
  confidence?: number;
  duplicateOf?: string | null;
  verified: boolean;
}

// Goals
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  categoryId: string;
  targetDate: string;
  priority: "low" | "medium" | "high";
  currentAmount?: number;
}

// Deposits
export interface Deposit {
  id: string;
  date: string;
  type: "recurring" | "one-off";
  person1Amount: number;
  person2Amount: number;
  description: string;
  allocations: Record<string, number>;
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
  googleApiKeys?: {
    gemini?: string;
    documentAI?: string;
    vision?: string;
  };
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
