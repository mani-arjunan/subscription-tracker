// Service Worker for background notification handling

const CACHE_NAME = 'subscription-tracker-v1';

// Initialize DB on install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Handle periodic background sync for checking expired subscriptions
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-subscriptions') {
    event.waitUntil(checkSubscriptionsAndNotify());
  }
});

// Check subscriptions and send notifications
async function checkSubscriptionsAndNotify() {
  try {
    // Get subscriptions from cache
    const subscriptions = await getSubscriptionsFromDB();

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[SW] No subscriptions found');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationsSent = [];

    // Get previously sent reminders from cache
    const sentReminders = await getSentReminders();

    subscriptions.forEach((sub) => {
      if (sub.status !== 'active') return;

      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      const daysUntilRenewal = Math.floor(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send notification if it's the reminder day and we haven't already sent it
      if (daysUntilRenewal === (sub.reminderDaysBefore || 3)) {
        const reminderKey = `reminded-${sub.id}-${sub.renewalDate}`;

        // Check if we already sent this reminder
        if (!sentReminders.includes(reminderKey)) {
          self.registration.showNotification(
            `${sub.name} subscription renews soon`,
            {
              body: `Your subscription will renew in ${daysUntilRenewal} day(s) on ${renewalDate.toLocaleDateString()}`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: `reminder-${sub.id}`,
              data: {
                subscriptionId: sub.id,
                renewalDate: sub.renewalDate,
              },
            }
          );
          notificationsSent.push(reminderKey);
        }
      }
    });

    // Save that we sent these notifications
    if (notificationsSent.length > 0) {
      const updatedReminders = [...sentReminders, ...notificationsSent];
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        new Request('notification-cache'),
        new Response(JSON.stringify({ sent: updatedReminders, timestamp: Date.now() }))
      );
    }

    console.log(`[SW] Checked subscriptions, sent ${notificationsSent.length} notifications`);
  } catch (error) {
    console.error('[SW] Error checking subscriptions:', error);
  }
}

// Get subscriptions from cache
async function getSubscriptionsFromDB() {
  return new Promise((resolve, reject) => {
    caches.open(CACHE_NAME).then((cache) => {
      cache.match('subscriptions-data').then((response) => {
        if (response) {
          response.json().then((data) => {
            resolve(data.subscriptions || []);
          }).catch(() => resolve([]));
        } else {
          resolve([]);
        }
      }).catch(() => resolve([]));
    }).catch(() => reject(new Error('Failed to access cache')));
  });
}

// Get previously sent reminders from cache
async function getSentReminders() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('notification-cache');
    if (response) {
      const data = await response.json();
      return data.sent || [];
    }
    return [];
  } catch (error) {
    console.error('[SW] Error getting sent reminders:', error);
    return [];
  }
}

// Message handler for updating subscriptions from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_SUBSCRIPTIONS') {
    console.log('[SW] Syncing subscriptions data');
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(
        new Request('subscriptions-data'),
        new Response(JSON.stringify({ subscriptions: event.data.subscriptions }))
      );
    });
  }
});
