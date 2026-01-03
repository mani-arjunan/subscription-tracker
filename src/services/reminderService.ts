import type { Subscription } from '../types/subscription';

export const ReminderService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      // Register periodic background sync if supported
      ReminderService.registerPeriodicSync();
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register periodic background sync if supported
          ReminderService.registerPeriodicSync();
        }
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }

    return false;
  },

  registerPeriodicSync: async () => {
    if (!('serviceWorker' in navigator) || !('BackgroundSyncManager' in window)) {
      console.log('Periodic background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('periodicSync' in registration) {
        await (registration.periodicSync as any).register('check-subscriptions', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
        console.log('Periodic sync registered');
      }
    } catch (error) {
      console.error('Failed to register periodic sync:', error);
    }
  },

  syncSubscriptionsToWorker: (subscriptions: Subscription[]) => {
    // Send subscription data to service worker for background checks
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_SUBSCRIPTIONS',
        subscriptions,
      });
    }
  },

  sendNotification: (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options,
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  },

  checkAndNotifyReminders: (subscriptions: Subscription[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    subscriptions.forEach((sub) => {
      if (sub.status !== 'active') return;

      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      const daysUntilRenewal = Math.floor(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only notify for upcoming renewals (positive days) or if expired today
      if (daysUntilRenewal === 0) {
        // Expired today
        ReminderService.sendNotification(
          `${sub.name} subscription expired today`,
          {
            body: `Your ${sub.name} subscription expired on ${renewalDate.toLocaleDateString()}. Please renew it.`,
            tag: `reminder-${sub.id}`,
          }
        );
      } else if (daysUntilRenewal > 0 && daysUntilRenewal <= sub.reminderDaysBefore) {
        // Upcoming renewal within reminder window
        ReminderService.sendNotification(
          `Renew ${sub.name}`,
          {
            body: `Your ${sub.name} subscription is expiring on (${renewalDate.toLocaleDateString()}). Please renew it`,
            tag: `reminder-${sub.id}`,
          }
        );
      }
      // Do NOT notify for negative days (already expired) to avoid spam
    });
  },

  getUpcomingReminders: (subscriptions: Subscription[], daysFromNow: number = 30) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    return subscriptions
      .filter((sub) => {
        if (sub.status !== 'active') return false;
        const renewalDate = new Date(sub.renewalDate);
        return renewalDate >= today && renewalDate <= futureDate;
      })
      .map((sub) => {
        const renewalDate = new Date(sub.renewalDate);
        const daysUntil = Math.ceil(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          subscription: sub,
          daysUntil,
          needsReminder: daysUntil === sub.reminderDaysBefore,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  },
};
