/**
 * chartHelpers.ts - Helper functions for generating chart data
 */

import { CostsDB, Currency, Report } from '../types/index';

/**
 * Data structure for pie chart (category totals)
 */
export interface PieChartDataItem {
  name: string;
  value: number;
}

/**
 * Data structure for bar chart (monthly totals)
 */
export interface BarChartDataItem {
  month: string;
  total: number;
}

/**
 * Gets pie chart data grouped by category for a specific month and year
 * @param year - The year
 * @param month - The month (1-12)
 * @param currency - The target currency
 * @param db - The database instance
 * @returns Promise that resolves to array of pie chart data items
 */
export async function getPieChartData(
  year: number,
  month: number,
  currency: Currency,
  db: CostsDB
): Promise<PieChartDataItem[]> {
  const report: Report = await db.getReport(year, month, currency);
  
  // Group costs by category and sum them
  const categoryTotals: Record<string, number> = {};
  
  report.costs.forEach(function(cost: Report['costs'][0]) {
    if (categoryTotals[cost.category]) {
      categoryTotals[cost.category] += cost.sum;
    } else {
      categoryTotals[cost.category] = cost.sum;
    }
  });
  
  // Convert to array format for pie chart
  const pieData: PieChartDataItem[] = Object.keys(categoryTotals).map(function(category) {
    return {
      name: category,
      value: categoryTotals[category]
    };
  });
  
  return pieData;
}

/**
 * Gets bar chart data showing total costs for each month in a year
 * @param year - The year
 * @param currency - The target currency
 * @param db - The database instance
 * @returns Promise that resolves to array of bar chart data items
 */
export async function getBarChartData(
  year: number,
  currency: Currency,
  db: CostsDB
): Promise<BarChartDataItem[]> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get reports for all 12 months
  const reportPromises: Promise<Report>[] = [];
  for (let month = 1; month <= 12; month++) {
    reportPromises.push(db.getReport(year, month, currency));
  }
  
  const reports = await Promise.all(reportPromises);
  
  // Convert to bar chart data format
  const barData: BarChartDataItem[] = reports.map(function(report: Report, index: number) {
    return {
      month: monthNames[index],
      total: report.total.total
    };
  });
  
  return barData;
}

