import { create } from 'zustand';
import type { Subscription, Category, SortField, SortDirection } from '../types/subscription';

const STORAGE_KEY = 'subscriptions';

interface SubscriptionStore {
  subscriptions: Subscription[];
  currency: string;
  reminderDaysDefault: number;
  sortBy: SortField;
  sortDirection: SortDirection;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  getSubscription: (id: string) => Subscription | undefined;

  // Filtering & Sorting
  getActiveSubscriptions: () => Subscription[];
  getSubscriptionsByCategory: (category: Category) => Subscription[];
  getUpcomingRenewals: (daysFromNow: number) => Subscription[];
  getSorted: (subscriptions: Subscription[]) => Subscription[];

  // Calculations
  getTotalMonthlyCost: () => number;
  getCostByCategory: () => Record<Category, number>;

  // Settings
  setCurrency: (currency: string) => void;
  setReminderDaysDefault: (days: number) => void;
  setSortBy: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;

  // Data
  loadFromStorage: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  currency: 'USD',
  reminderDaysDefault: 7,
  sortBy: 'renewalDate',
  sortDirection: 'asc',

  addSubscription: (sub) => {
    const newSub: Subscription = {
      ...sub,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const subscriptions = [...get().subscriptions, newSub];
    set({ subscriptions });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  },

  updateSubscription: (id, updates) => {
    const subscriptions = get().subscriptions.map((sub) =>
      sub.id === id ? { ...sub, ...updates } : sub
    );
    set({ subscriptions });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  },

  deleteSubscription: (id) => {
    const subscriptions = get().subscriptions.filter((sub) => sub.id !== id);
    set({ subscriptions });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  },

  getSubscription: (id) => {
    return get().subscriptions.find((sub) => sub.id === id);
  },

  getActiveSubscriptions: () => {
    return get().subscriptions.filter((sub) => sub.status === 'active');
  },

  getSubscriptionsByCategory: (category) => {
    return get().subscriptions.filter((sub) => sub.category === category);
  },

  getUpcomingRenewals: (daysFromNow) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    return get()
      .subscriptions.filter((sub) => {
        if (sub.status !== 'active') return false;
        const renewalDate = new Date(sub.renewalDate);
        return renewalDate >= today && renewalDate <= futureDate;
      })
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  },

  getTotalMonthlyCost: () => {
    return get()
      .getActiveSubscriptions()
      .reduce((total, sub) => {
        const multiplier = {
          monthly: 1,
          quarterly: 1 / 3,
          'bi-annual': 1 / 6,
          yearly: 1 / 12,
        }[sub.billingCycle];
        return total + sub.cost * multiplier;
      }, 0);
  },

  getCostByCategory: () => {
    const costs: Record<Category, number> = {
      streaming: 0,
      music: 0,
      productivity: 0,
      gaming: 0,
      education: 0,
      other: 0,
    };

    get()
      .getActiveSubscriptions()
      .forEach((sub) => {
        const multiplier = {
          monthly: 1,
          quarterly: 1 / 3,
          'bi-annual': 1 / 6,
          yearly: 1 / 12,
        }[sub.billingCycle];
        costs[sub.category] += sub.cost * multiplier;
      });

    return costs;
  },

  getSorted: (subscriptions) => {
    const { sortBy, sortDirection } = get();
    const sorted = [...subscriptions];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'yearlyTotal': {
          const yearlyA = a.cost * (a.billingCycle === 'monthly' ? 12 : a.billingCycle === 'quarterly' ? 4 : a.billingCycle === 'bi-annual' ? 2 : 1);
          const yearlyB = b.cost * (b.billingCycle === 'monthly' ? 12 : b.billingCycle === 'quarterly' ? 4 : b.billingCycle === 'bi-annual' ? 2 : 1);
          comparison = yearlyA - yearlyB;
          break;
        }
        case 'renewalDate': {
          comparison = new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
          break;
        }
        case 'name': {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case 'status': {
          const statusOrder = { active: 0, paused: 1, cancelled: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  },

  setSortBy: (field) => {
    set({ sortBy: field });
  },

  setSortDirection: (direction) => {
    set({ sortDirection: direction });
  },

  setCurrency: (currency) => {
    set({ currency });
  },

  setReminderDaysDefault: (days) => {
    set({ reminderDaysDefault: days });
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set({ subscriptions: JSON.parse(stored) });
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      }
    }
  },

  exportData: () => {
    return JSON.stringify(
      {
        subscriptions: get().subscriptions,
        currency: get().currency,
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importData: (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
        set({
          subscriptions: parsed.subscriptions,
          currency: parsed.currency || 'USD',
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.subscriptions));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },
}));
