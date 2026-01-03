import type { Subscription } from '../types/subscription';

/**
 * Checks if a subscription's renewal date has passed (is in the past)
 */
export const isExpired = (subscription: Subscription): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalDate = new Date(subscription.renewalDate);
  renewalDate.setHours(0, 0, 0, 0);

  return renewalDate < today;
};

/**
 * Calculates days until renewal (can be negative if expired)
 */
export const getDaysUntilRenewal = (subscription: Subscription): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalDate = new Date(subscription.renewalDate);
  renewalDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Determines the display status for a subscription
 * 'expired' takes precedence over 'active' status
 */
export const getSubscriptionDisplayStatus = (subscription: Subscription): string => {
  if (isExpired(subscription) && subscription.status === 'active') {
    return 'expired';
  }
  return subscription.status;
};

/**
 * Determines if a subscription is upcoming (within reminder days and not expired)
 */
export const isUpcomingSoon = (subscription: Subscription): boolean => {
  const daysUntilRenewal = getDaysUntilRenewal(subscription);
  return daysUntilRenewal <= subscription.reminderDaysBefore && daysUntilRenewal > 0;
};
