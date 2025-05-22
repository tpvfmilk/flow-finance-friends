
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

// Sankey Data
export interface SankeyNode {
  name: string;
  id: string;
  type: "deposit" | "category" | "expense";
  value: number;
  category?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  category?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Time Period Filter
export type TimePeriod = "3m" | "6m" | "1y" | "ytd" | "all";

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
