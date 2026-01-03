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
    // Get subscriptions from IndexedDB
    const subscriptions = await getSubscriptionsFromDB();

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[SW] No subscriptions found');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationsSent = [];

    subscriptions.forEach((sub) => {
      if (sub.status !== 'active') return;

      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      const daysUntilRenewal = Math.floor(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send notification if it's the reminder day
      if (daysUntilRenewal === (sub.reminderDaysBefore || 3)) {
        const reminderKey = `reminded-${sub.id}-${sub.renewalDate}`;

        // Check if we already sent this reminder (using localStorage via SW cache)
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
    });

    // Save that we sent these notifications
    if (notificationsSent.length > 0) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        new Request('notification-cache'),
        new Response(JSON.stringify({ sent: notificationsSent, timestamp: Date.now() }))
      );
    }

    console.log(`[SW] Checked subscriptions, sent ${notificationsSent.length} notifications`);
  } catch (error) {
    console.error('[SW] Error checking subscriptions:', error);
  }
}

// Get subscriptions from IndexedDB
async function getSubscriptionsFromDB() {
  return new Promise((resolve, reject) => {
    // Since we can't reliably access user's IndexedDB from SW,
    // we'll use a fallback: check localStorage that was synced to a cache
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
