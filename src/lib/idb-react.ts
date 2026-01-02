/**
 * idb-react.ts - IndexedDB wrapper library (React/TypeScript version)
 * This library wraps IndexedDB operations using Promises
 * Compatible with React and TypeScript modules
 */

import { 
  Cost, 
  Report, 
  Currency, 
  CostsDB, 
  CostWithoutDate, 
  CostItem, 
  Statistics, 
  Budget, 
  Category,
  DateStructure
} from '../types/index';

/**
 * Opens or creates an IndexedDB database for costs
 * @param databaseName - The name of the database
 * @param databaseVersion - The version number of the database
 * @returns Promise that resolves to database object with addCost and getReport methods
 */
export function openCostsDB(databaseName: string, databaseVersion: number): Promise<CostsDB> {
  return new Promise(function(resolve, reject) {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onerror = function() {
      reject(request.error);
    };

    request.onsuccess = function() {
      const db = request.result;
      const dbObject: CostsDB = {
        /**
         * Adds a new cost item to the database
         * @param cost - Cost object with sum, currency, category, description properties
         * @returns Promise that resolves to the added cost object (without date as per specification)
         */
        addCost: function(cost: Omit<Cost, 'date'>): Promise<CostWithoutDate> {
          return new Promise(function(resolveAdd, rejectAdd) {
            const transaction = db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');
            
            // Set the date to current date
            const now = new Date();
            const costWithDate: Cost = {
              sum: cost.sum,
              currency: cost.currency,
              category: cost.category,
              description: cost.description,
              date: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
              }
            };

            const addRequest = store.add(costWithDate);

            addRequest.onsuccess = function() {
              // Return cost object without date as per specification
              resolveAdd({
                sum: cost.sum,
                currency: cost.currency,
                category: cost.category,
                description: cost.description
              });
            };

            addRequest.onerror = function() {
              rejectAdd(addRequest.error);
            };
          });
        },
        /**
         * Gets a detailed report for a specific month and year in a specific currency
         * @param year - The year
         * @param month - The month (1-12)
         * @param currency - The target currency (USD, ILS, GBP, EURO)
         * @returns Promise that resolves to report object
         */
        getReport: function(year: number, month: number, currency: Currency): Promise<Report> {
          return new Promise(function(resolveReport, rejectReport) {
            // First, fetch exchange rates
            const exchangeRateUrl = localStorage.getItem('exchangeRateUrl') || './exchange-rates.json';
            
            fetch(exchangeRateUrl)
              .then(function(response) {
                return response.json();
              })
              .then(function(rates: Record<string, number>) {
                const transaction = db.transaction(['costs'], 'readonly');
                const store = transaction.objectStore('costs');
                
                // Query all costs and filter by year and month
                // IndexedDB doesn't support nested property paths in compound indexes,
                // so we query all and filter in JavaScript
                const request = store.openCursor();
                const costs: Cost[] = [];
                
                request.onsuccess = function(event: Event) {
                  const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                  if (cursor) {
                    const value = cursor.value as Cost;
                    // Filter by exact year and month match
                    if (value.date && value.date.year === year && value.date.month === month) {
                      costs.push(value);
                    }
                    cursor.continue();
                  } else {
                    // All items processed, convert currencies and create report
                    const convertedCosts = costs.map(function(cost) {
                      // Convert to USD first, then to target currency
                      const amountInUSD = cost.sum / rates[cost.currency];
                      const convertedSum = amountInUSD * rates[currency];
                      
                      return {
                        sum: convertedSum,
                        currency: currency,
                        category: cost.category,
                        description: cost.description,
                        Date: {
                          day: cost.date.day
                        }
                      };
                    });
                    
                    // Calculate total
                    const total = convertedCosts.reduce(function(sum, item) {
                      return sum + item.sum;
                    }, 0);
                    
                    const report: Report = {
                      year: year,
                      month: month,
                      costs: convertedCosts,
                      total: {
                        currency: currency,
                        total: total
                      }
                    };
                    
                    resolveReport(report);
                  }
                };
                
                request.onerror = function() {
                  rejectReport(request.error);
                };
              })
              .catch(function(error) {
                rejectReport(error);
              });
          });
        },
        
        /**
         * Gets all cost items
         */
        getAllCosts: function(): Promise<CostItem[]> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const request = store.getAll();
            
            request.onsuccess = function() {
              resolve(request.result as CostItem[]);
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Gets costs by category
         */
        getCostsByCategory: function(category: string): Promise<CostItem[]> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const request = store.openCursor();
            const costs: CostItem[] = [];
            
            request.onsuccess = function(event: Event) {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor) {
                const value = cursor.value as CostItem;
                if (value.category === category) {
                  costs.push(value);
                }
                cursor.continue();
              } else {
                resolve(costs);
              }
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Gets costs by date range
         */
        getCostsByDateRange: function(startDate: DateStructure, endDate: DateStructure): Promise<CostItem[]> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const request = store.openCursor();
            const costs: CostItem[] = [];
            
            request.onsuccess = function(event: Event) {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor) {
                const value = cursor.value as CostItem;
                const date = value.date;
                
                // Check if date is within range
                const start = new Date(startDate.year, startDate.month - 1, startDate.day);
                const end = new Date(endDate.year, endDate.month - 1, endDate.day);
                const current = new Date(date.year, date.month - 1, date.day);
                
                if (current >= start && current <= end) {
                  costs.push(value);
                }
                cursor.continue();
              } else {
                resolve(costs);
              }
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Gets statistics for a month
         */
        getStatistics: function(year: number, month: number, currency: Currency): Promise<Statistics> {
          return new Promise(function(resolve, reject) {
            const exchangeRateUrl = localStorage.getItem('exchangeRateUrl') || './exchange-rates.json';
            
            fetch(exchangeRateUrl)
              .then(function(response) {
                return response.json();
              })
              .then(function(rates: Record<string, number>) {
                // Get current month costs
                dbObject.getReport(year, month, currency)
                  .then(function(currentReport) {
                    // Get last month costs
                    const lastMonth = month === 1 ? 12 : month - 1;
                    const lastYear = month === 1 ? year - 1 : year;
                    
                    dbObject.getReport(lastYear, lastMonth, currency)
                      .then(function(lastReport) {
                        const totalThisMonth = currentReport.total.total;
                        const totalLastMonth = lastReport.total.total;
                        const daysInMonth = new Date(year, month, 0).getDate();
                        const averageDaily = totalThisMonth / daysInMonth;
                        
                        // Calculate by category
                        const totalByCategory: Record<string, number> = {};
                        currentReport.costs.forEach(function(cost) {
                          if (totalByCategory[cost.category]) {
                            totalByCategory[cost.category] += cost.sum;
                          } else {
                            totalByCategory[cost.category] = cost.sum;
                          }
                        });
                        
                        // Calculate change percentage
                        const changePercentage = totalLastMonth > 0 
                          ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
                          : 0;
                        
                        const stats: Statistics = {
                          totalThisMonth,
                          totalLastMonth,
                          averageDaily,
                          totalByCategory,
                          changePercentage,
                          currency
                        };
                        
                        resolve(stats);
                      })
                      .catch(reject);
                  })
                  .catch(reject);
              })
              .catch(reject);
          });
        },
        
        /**
         * Updates a cost item
         */
        updateCost: function(id: number, cost: Partial<Cost>): Promise<CostItem> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');
            const getRequest = store.get(id);
            
            getRequest.onsuccess = function() {
              const existing = getRequest.result as CostItem;
              if (!existing) {
                reject(new Error('Cost item not found'));
                return;
              }
              
              const updated: CostItem = {
                ...existing,
                ...cost,
                id: existing.id
              };
              
              const updateRequest = store.put(updated);
              
              updateRequest.onsuccess = function() {
                resolve(updated);
              };
              
              updateRequest.onerror = function() {
                reject(updateRequest.error);
              };
            };
            
            getRequest.onerror = function() {
              reject(getRequest.error);
            };
          });
        },
        
        /**
         * Deletes a cost item
         */
        deleteCost: function(id: number): Promise<void> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');
            const request = store.delete(id);
            
            request.onsuccess = function() {
              resolve();
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Gets all categories
         */
        getCategories: function(): Promise<Category[]> {
          return new Promise(function(resolve, reject) {
            try {
              // Check if object store exists
              if (!db.objectStoreNames.contains('categories')) {
                // Object store doesn't exist yet, return empty array
                resolve([]);
                return;
              }
              
              const transaction = db.transaction(['categories'], 'readonly');
              const store = transaction.objectStore('categories');
              const request = store.getAll();
              
              request.onsuccess = function() {
                const result = request.result;
                resolve(Array.isArray(result) ? result : []);
              };
              
              request.onerror = function() {
                // If error occurs, return empty array instead of rejecting
                console.warn('Error loading categories:', request.error);
                resolve([]);
              };
            } catch (error) {
              // If any error occurs, return empty array
              console.warn('Error in getCategories:', error);
              resolve([]);
            }
          });
        },
        
        /**
         * Adds a category
         */
        addCategory: function(category: Omit<Category, 'id'>): Promise<Category> {
          return new Promise(function(resolve, reject) {
            try {
              if (!db.objectStoreNames.contains('categories')) {
                reject(new Error('Categories object store does not exist. Please refresh the page to initialize the database.'));
                return;
              }
              
              const transaction = db.transaction(['categories'], 'readwrite');
              const store = transaction.objectStore('categories');
              const request = store.add(category);
              
              request.onsuccess = function() {
                const newCategory: Category = {
                  ...category,
                  id: request.result as number
                };
                resolve(newCategory);
              };
              
              request.onerror = function() {
                reject(request.error);
              };
            } catch (error) {
              reject(error);
            }
          });
        },
        
        /**
         * Updates a category
         */
        updateCategory: function(id: number, category: Partial<Category>): Promise<Category> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const getRequest = store.get(id);
            
            getRequest.onsuccess = function() {
              const existing = getRequest.result as Category;
              if (!existing) {
                reject(new Error('Category not found'));
                return;
              }
              
              const updated: Category = {
                ...existing,
                ...category,
                id: existing.id
              };
              
              const updateRequest = store.put(updated);
              
              updateRequest.onsuccess = function() {
                resolve(updated);
              };
              
              updateRequest.onerror = function() {
                reject(updateRequest.error);
              };
            };
            
            getRequest.onerror = function() {
              reject(getRequest.error);
            };
          });
        },
        
        /**
         * Deletes a category
         */
        deleteCategory: function(id: number): Promise<void> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.delete(id);
            
            request.onsuccess = function() {
              resolve();
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Gets budget
         */
        getBudget: function(year: number, month?: number, category?: string): Promise<Budget | null> {
          return new Promise(function(resolve, reject) {
            const transaction = db.transaction(['budgets'], 'readonly');
            const store = transaction.objectStore('budgets');
            const request = store.openCursor();
            
            request.onsuccess = function(event: Event) {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor) {
                const budget = cursor.value as Budget;
                if (budget.year === year) {
                  if (category && budget.category === category && budget.type === 'category') {
                    resolve(budget);
                    return;
                  } else if (month && budget.month === month && budget.type === 'monthly') {
                    resolve(budget);
                    return;
                  } else if (!month && !category && budget.type === 'yearly') {
                    resolve(budget);
                    return;
                  }
                }
                cursor.continue();
              } else {
                resolve(null);
              }
            };
            
            request.onerror = function() {
              reject(request.error);
            };
          });
        },
        
        /**
         * Sets budget
         */
        setBudget: function(budget: Omit<Budget, 'id'>): Promise<Budget> {
          return new Promise(function(resolve, reject) {
            try {
              if (!db.objectStoreNames.contains('budgets')) {
                reject(new Error('Budgets object store does not exist. Please refresh the page to initialize the database.'));
                return;
              }
              
              const transaction = db.transaction(['budgets'], 'readwrite');
              const store = transaction.objectStore('budgets');
              const request = store.add(budget);
              
              request.onsuccess = function() {
                const newBudget: Budget = {
                  ...budget,
                  id: request.result as number
                };
                resolve(newBudget);
              };
              
              request.onerror = function() {
                reject(request.error);
              };
            } catch (error) {
              reject(error);
            }
          });
        },
        
        /**
         * Gets all budgets
         */
        getAllBudgets: function(): Promise<Budget[]> {
          return new Promise(function(resolve, reject) {
            try {
              // Check if object store exists
              if (!db.objectStoreNames.contains('budgets')) {
                // Object store doesn't exist yet, return empty array
                resolve([]);
                return;
              }
              
              const transaction = db.transaction(['budgets'], 'readonly');
              const store = transaction.objectStore('budgets');
              const request = store.getAll();
              
              request.onsuccess = function() {
                const result = request.result;
                resolve(Array.isArray(result) ? result : []);
              };
              
              request.onerror = function() {
                // If error occurs, return empty array instead of rejecting
                console.warn('Error loading budgets:', request.error);
                resolve([]);
              };
            } catch (error) {
              // If any error occurs, return empty array
              console.warn('Error in getAllBudgets:', error);
              resolve([]);
            }
          });
        }
      };

      resolve(dbObject);
    };

    request.onupgradeneeded = function(event: IDBVersionChangeEvent) {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;
      
      if (!transaction) return;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('costs')) {
        db.createObjectStore('costs', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

