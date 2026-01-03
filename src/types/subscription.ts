export type Category = 'streaming' | 'music' | 'productivity' | 'gaming' | 'education' | 'other';
export type Status = 'active' | 'paused' | 'cancelled' | 'expired';
export type SortField = 'yearlyTotal' | 'renewalDate' | 'name' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'bi-annual';
  renewalDate: string; // ISO date string
  category: Category;
  status: Status;
  reminderDaysBefore: number;
  createdAt: string;
  notes?: string;
}
