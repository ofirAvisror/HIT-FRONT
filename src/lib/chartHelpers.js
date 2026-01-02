/**
 * chartHelpers.js - Helper functions for generating chart data
 */

/**
 * Gets pie chart data grouped by category for a specific month and year
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {string} currency - The target currency
 * @param {Object} db - The database instance
 * @returns {Promise<Array<{name: string, value: number}>>} Promise that resolves to array of pie chart data items
 */
export async function getPieChartData(year, month, currency, db) {
  const report = await db.getReport(year, month, currency);
  
  // Group costs by category and sum them
  const categoryTotals = {};
  
  report.costs.forEach(function(cost) {
    if (categoryTotals[cost.category]) {
      categoryTotals[cost.category] += cost.sum;
    } else {
      categoryTotals[cost.category] = cost.sum;
    }
  });
  
  // Convert to array format for pie chart
  const pieData = Object.keys(categoryTotals).map(function(category) {
    return {
      name: category,
      value: categoryTotals[category]
    };
  });
  
  return pieData;
}

/**
 * Gets bar chart data showing total costs for each month in a year
 * @param {number} year - The year
 * @param {string} currency - The target currency
 * @param {Object} db - The database instance
 * @returns {Promise<Array<{month: string, total: number}>>} Promise that resolves to array of bar chart data items
 */
export async function getBarChartData(year, currency, db) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get reports for all 12 months
  const reportPromises = [];
  for (let month = 1; month <= 12; month++) {
    reportPromises.push(db.getReport(year, month, currency));
  }
  
  const reports = await Promise.all(reportPromises);
  
  // Convert to bar chart data format
  const barData = reports.map(function(report, index) {
    return {
      month: monthNames[index],
      total: report.total.total
    };
  });
  
  return barData;
}

