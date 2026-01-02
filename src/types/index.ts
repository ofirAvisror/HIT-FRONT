/**
 * Type definitions for Cost Manager application
 */

/**
 * Supported currency types
 */
export type Currency = 'USD' | 'ILS' | 'GBP' | 'EURO';

/**
 * Date structure stored in database
 */
export interface DateStructure {
  year: number;
  month: number;
  day: number;
}

/**
 * Cost item structure for adding to database
 */
export interface Cost {
  sum: number;
  currency: Currency;
  category: string;
  description: string;
  date: DateStructure;
}

/**
 * Cost item with ID from database
 */
export interface CostItem extends Cost {
  id?: number;
}

/**
 * Cost item in report output (with simplified date)
 */
export interface ReportCostItem {
  sum: number;
  currency: Currency;
  category: string;
  description: string;
  Date: {
    day: number;
  };
}

/**
 * Report structure returned by getReport
 */
export interface Report {
  year: number;
  month: number;
  costs: ReportCostItem[];
  total: {
    currency: Currency;
    total: number;
  };
}

/**
 * Exchange rates structure
 */
export interface ExchangeRates {
  USD: number;
  GBP: number;
  EURO: number;
  ILS: number;
}

/**
 * Cost item returned by addCost (without date as per specification)
 */
export interface CostWithoutDate {
  sum: number;
  currency: Currency;
  category: string;
  description: string;
}

/**
 * Statistics structure
 */
export interface Statistics {
  totalThisMonth: number;
  totalLastMonth: number;
  averageDaily: number;
  totalByCategory: Record<string, number>;
  changePercentage: number;
  currency: Currency;
}

/**
 * Budget structure
 */
export interface Budget {
  id?: number;
  year: number;
  month?: number;
  amount: number;
  currency: Currency;
  category?: string;
  type: 'monthly' | 'yearly' | 'category';
}

/**
 * Category structure
 */
export interface Category {
  id?: number;
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Database interface returned by openCostsDB
 */
export interface CostsDB {
  addCost: (cost: Omit<Cost, 'date'>) => Promise<CostWithoutDate>;
  getReport: (year: number, month: number, currency: Currency) => Promise<Report>;
  getAllCosts: () => Promise<CostItem[]>;
  getCostsByCategory: (category: string) => Promise<CostItem[]>;
  getCostsByDateRange: (startDate: DateStructure, endDate: DateStructure) => Promise<CostItem[]>;
  getStatistics: (year: number, month: number, currency: Currency) => Promise<Statistics>;
  updateCost: (id: number, cost: Partial<Cost>) => Promise<CostItem>;
  deleteCost: (id: number) => Promise<void>;
  getCategories: () => Promise<Category[]>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  getBudget: (year: number, month?: number, category?: string) => Promise<Budget | null>;
  setBudget: (budget: Omit<Budget, 'id'>) => Promise<Budget>;
  getAllBudgets: () => Promise<Budget[]>;
}

