export type Category = 'streaming' | 'music' | 'productivity' | 'gaming' | 'education' | 'other';
export type Status = 'active' | 'paused' | 'cancelled';

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

export interface ReminderConfig {
  enabled: boolean;
  useBrowserNotifications: boolean;
}
