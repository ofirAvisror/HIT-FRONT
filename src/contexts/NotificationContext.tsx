/**
 * NotificationContext.tsx - Context for managing notifications
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CostsDB } from '../types/index';

export interface Notification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'high_expense';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  checkBudgets: (db: CostsDB | null) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * NotificationProvider component
 */
export function NotificationProvider({ children }: NotificationProviderProps): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(function() {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map(function(n: any) {
          return { ...n, timestamp: new Date(n.timestamp) };
        }));
      } catch (error) {
        // Ignore
      }
    }
  }, []);

  useEffect(function() {
    // Save notifications to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = function(id: string): void {
    setNotifications(function(prev) {
      return prev.map(function(n) {
        return n.id === id ? { ...n, read: true } : n;
      });
    });
  };

  const markAllAsRead = function(): void {
    setNotifications(function(prev) {
      return prev.map(function(n) {
        return { ...n, read: true };
      });
    });
  };

  const clearNotification = function(id: string): void {
    setNotifications(function(prev) {
      return prev.filter(function(n) {
        return n.id !== id;
      });
    });
  };

  const clearAll = function(): void {
    setNotifications([]);
  };

  const checkBudgets = async function(db: CostsDB | null): Promise<void> {
    if (!db) return;

    try {
      const budgets = await db.getAllBudgets();
      const newNotifications: Notification[] = [];

      for (const budget of budgets) {
        let spent = 0;

        try {
          if (budget.type === 'monthly' && budget.month) {
            const report = await db.getReport(budget.year, budget.month, budget.currency);
            spent = report.total.total;
          } else if (budget.type === 'yearly') {
            let total = 0;
            for (let m = 1; m <= 12; m++) {
              const report = await db.getReport(budget.year, m, budget.currency);
              total += report.total.total;
            }
            spent = total;
          }

          const percentage = (spent / budget.amount) * 100;

          if (spent > budget.amount) {
            newNotifications.push({
              id: `budget-exceeded-${budget.id}`,
              type: 'budget_exceeded',
              message: `Budget exceeded! You've spent ${spent.toFixed(2)} ${budget.currency} out of ${budget.amount.toFixed(2)} ${budget.currency}`,
              timestamp: new Date(),
              read: false,
            });
          } else if (percentage >= 80) {
            newNotifications.push({
              id: `budget-warning-${budget.id}`,
              type: 'budget_warning',
              message: `Budget warning: You've used ${percentage.toFixed(1)}% of your budget`,
              timestamp: new Date(),
              read: false,
            });
          }
        } catch (error) {
          // Ignore errors for individual budgets
        }
      }

      // Add new notifications (avoid duplicates)
      setNotifications(function(prev) {
        const existingIds = new Set(prev.map(n => n.id));
        const toAdd = newNotifications.filter(n => !existingIds.has(n.id));
        return [...prev, ...toAdd];
      });
    } catch (error) {
      // Ignore
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        checkBudgets,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

