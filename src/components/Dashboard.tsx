import React, { useState, useEffect } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type { Subscription, Category } from '../types/subscription';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionForm } from './SubscriptionForm';
import { SortDropdown } from './SortDropdown';
import { InstallPrompt } from './InstallPrompt';
import { ReminderService } from '../services/reminderService';
import { BackupService } from '../services/backupService';
import { calendarService } from '../services/calendarService';
import { useTheme } from '../context/ThemeContext';
import { Plus, Upload, Bell, Settings, Moon, Sun } from 'lucide-react';
import { testSubscriptions } from '../data/testData';
import { isExpired } from '../utils/subscriptionUtils';

const CATEGORIES: Category[] = ['streaming', 'music', 'productivity', 'gaming', 'education', 'other'];

const categoryIcons: Record<Category, string> = {
  streaming: '🎬',
  music: '🎵',
  productivity: '💼',
  gaming: '🎮',
  education: '📚',
  other: '📦',
};

const POPULAR_SERVICES: Record<string, string> = {
  'netflix': 'netflix.com/account',
  'spotify': 'spotify.com/account',
  'youtube premium': 'youtube.com/account',
  'youtube tv': 'youtube.com/account',
  'youtube music': 'youtube.com/account',
  'apple music': 'music.apple.com/account',
  'prime video': 'amazon.com/gp/dvc/primevideo',
  'amazon prime': 'amazon.com/gp/your-account',
  'disney+': 'disneyplus.com/profile',
  'hulu': 'hulu.com/account',
  'max': 'hbomax.com/account',
  'paramount+': 'paramountplus.com/account',
  'apple tv+': 'tv.apple.com/account',
  'adobe': 'adobe.com/account',
  'microsoft 365': 'account.microsoft.com',
  'office 365': 'account.microsoft.com',
  'github': 'github.com/settings/billing',
  'notion': 'notion.so/account',
  'figma': 'figma.com/account',
  'canva': 'canva.com/account',
  'grammarly': 'grammarly.com/account',
  'duolingo': 'duolingo.com/account',
  'skillshare': 'skillshare.com/account',
  'coursera': 'coursera.org/account',
  'udemy': 'udemy.com/account',
  'masterclass': 'masterclass.com/account',
  'playstation plus': 'store.playstation.com/account',
  'xbox game pass': 'xbox.com/account',
  'steam': 'steampowered.com/account',
  'discord': 'discord.com/user/settings',
  'dropbox': 'dropbox.com/account',
  'google one': 'one.google.com',
  'icloud+': 'icloud.com/account',
  'slack': 'slack.com/account',
  'trello': 'trello.com/account',
};

const getRenewalUrl = (provider: string): string => {
  if (!provider) return '';

  // Check for exact match
  if (POPULAR_SERVICES[provider.toLowerCase()]) {
    return `https://${POPULAR_SERVICES[provider.toLowerCase()]}`;
  }

  // Check for partial match
  const serviceName = provider.toLowerCase();
  const matchedService = Object.keys(POPULAR_SERVICES).find(
    service => serviceName.includes(service) || service.includes(serviceName)
  );

  if (matchedService) {
    return `https://${POPULAR_SERVICES[matchedService]}`;
  }

  // Fallback to just the provider URL
  return `https://${provider}`;
};

export const Dashboard: React.FC = () => {
  const store = useSubscriptionStore();
  const { theme, toggleTheme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpcomingRenewals, setShowUpcomingRenewals] = useState(false);
  const [showBackupSettings, setShowBackupSettings] = useState(false);
  const [selectedCostCycle, setSelectedCostCycle] = useState<'monthly' | 'quarterly' | 'bi-annual' | 'yearly'>('yearly');

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f1115' : '#ffffff';
  const textColor = isDark ? '#c9c2a6' : '#000000';

  useEffect(() => {
    const initializeApp = async () => {
      store.loadFromStorage();
      checkNotificationPermission();

      // Perform auto-backup if needed
      if (BackupService.shouldAutoBackup()) {
        BackupService.recordBackup();
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Check reminders whenever subscriptions change
    if (store.subscriptions.length > 0) {
      ReminderService.checkAndNotifyReminders(store.subscriptions);
    }
  }, [store.subscriptions]);

  useEffect(() => {
    // Sync subscriptions to service worker for background checks
    ReminderService.syncSubscriptionsToWorker(store.subscriptions);
  }, [store.subscriptions]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const isDisabled = localStorage.getItem('notificationsDisabled') === 'true';
      const isGranted = Notification.permission === 'granted';
      setNotificationPermission(isGranted && !isDisabled);
    }
  };

  const handleEnableNotifications = async () => {
    if (notificationPermission) {
      // Turn off notifications - just update local state
      setNotificationPermission(false);
      localStorage.setItem('notificationsDisabled', 'true');
    } else {
      // Turn on notifications - request permission
      const granted = await ReminderService.requestPermission();
      setNotificationPermission(granted);
      if (granted) {
        localStorage.removeItem('notificationsDisabled');
      }
    }
  };

  const handleAddSubscription = (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      store.updateSubscription(editingSubscription.id, data);
      if (notificationPermission && 'Notification' in window) {
        new Notification('Subscription Updated', {
          body: `${data.name} has been updated`,
          icon: '/favicon.svg',
          tag: 'subscription-update',
        });
      }
    } else {
      store.addSubscription(data);
      if (notificationPermission && 'Notification' in window) {
        new Notification('Subscription Added', {
          body: `${data.name} has been added to your subscriptions`,
          icon: '/favicon.svg',
          tag: 'subscription-add',
        });
      }
    }
    setShowForm(false);
    setEditingSubscription(undefined);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleDeleteSubscription = (id: string) => {
    const subscription = store.subscriptions.find(s => s.id === id);
    store.deleteSubscription(id);
    if (notificationPermission && 'Notification' in window && subscription) {
      new Notification('Subscription Deleted', {
        body: `${subscription.name} has been removed from your subscriptions`,
        icon: '/favicon.svg',
        tag: 'subscription-delete',
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const success = store.importData(event.target.result);
          if (success) {
            alert('Data imported successfully!');
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadTestData = () => {
    if (confirm('This will add test data to your subscriptions. Continue?')) {
      testSubscriptions.forEach((sub) => {
        store.addSubscription(sub);
      });
    }
  };

  const handleClearAllData = () => {
    if (confirm('This will delete ALL subscriptions. This action cannot be undone. Continue?')) {
      store.subscriptions.forEach((sub) => {
        store.deleteSubscription(sub.id);
      });
    }
  };

  const handleExportBackup = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    BackupService.recordBackup();
  };

  const handleExportCalendar = () => {
    calendarService.exportAndDownloadCalendar(store.subscriptions);
  };

  const handleTestNotification = async () => {
    if (notificationPermission && 'Notification' in window) {
      new Notification('Test Notification', {
        body: 'This is a test notification from Subscription Tracker',
        icon: '/favicon.svg',
        tag: 'test-notification',
      });
    } else {
      alert('Please enable notifications first');
    }
  };

  const filteredSubscriptions = store.getSorted(
    selectedCategory === 'all'
      ? store.subscriptions
      : store.getSubscriptionsByCategory(selectedCategory)
  );

  // Calculate stats based on filtered subscriptions
  const activeCount = filteredSubscriptions.filter((sub) => sub.status === 'active' && !isExpired(sub)).length;

  const totalMonthlyCost = filteredSubscriptions
    .filter((sub) => sub.status === 'active' && !isExpired(sub))
    .reduce((sum, sub) => {
      const multiplier = {
        monthly: 1,
        quarterly: 1 / 3,
        'bi-annual': 1 / 6,
        yearly: 1 / 12,
      }[sub.billingCycle] || 1;
      return sum + sub.cost * multiplier;
    }, 0);

  // Calculate cost for selected cycle
  const getCostForCycle = (cycle: 'monthly' | 'quarterly' | 'bi-annual' | 'yearly') => {
    const cycleMultiplier = {
      monthly: 1,
      quarterly: 3,
      'bi-annual': 6,
      yearly: 12,
    }[cycle];
    return Math.round(totalMonthlyCost * cycleMultiplier);
  };

  const selectedCycleCost = getCostForCycle(selectedCostCycle);

  const upcomingRenewals = filteredSubscriptions
    .filter((sub) => {
      if (sub.status !== 'active' || isExpired(sub)) return false;
      const renewalDate = new Date(sub.renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return renewalDate >= today && renewalDate <= futureDate;
    })
    .sort((a, b) => {
      const aRenewalDate = new Date(a.renewalDate).getTime();
      const bRenewalDate = new Date(b.renewalDate).getTime();
      return aRenewalDate - bRenewalDate;
    });

  const expiredRenewals = filteredSubscriptions
    .filter((sub) => {
      if (sub.status !== 'active') return false;
      return isExpired(sub);
    })
    .sort((a, b) => {
      const aRenewalDate = new Date(a.renewalDate).getTime();
      const bRenewalDate = new Date(b.renewalDate).getTime();
      return bRenewalDate - aRenewalDate; // Most recently expired first
    });

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh' }}>
      <InstallPrompt />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px', paddingTop: 'clamp(40px, 8vw, 60px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', marginBottom: '8px' }}>Subscription Tracker</h1>
            <p style={{ opacity: 0.7, fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
              Manage and track all your subscriptions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              onClick={handleEnableNotifications}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: notificationPermission ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)') : (isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)'),
                color: notificationPermission ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#facc15' : '#ca8a04'),
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                if (notificationPermission) {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)';
                } else {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (notificationPermission) {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)';
                } else {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)';
                }
              }}
              title={notificationPermission ? 'Notifications enabled' : 'Enable notifications'}
            >
              <Bell size={16} />
              <span>{notificationPermission ? 'On' : 'Off'}</span>
            </button>
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: isDark ? '#fb923c' : '#3b82f6',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: showSettings ? (isDark ? '#60a5fa' : '#3b82f6') : textColor,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Settings Menu - Floating List at Top Right */}
        {showSettings && (
          <div
            onClick={() => setShowSettings(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: 'max(60px, env(safe-area-inset-top))',
                right: '16px',
                backgroundColor: bgColor,
                border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.2)' : '#e0e0e0'}`,
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                minWidth: '200px',
                zIndex: 50,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  onClick={() => {
                    handleImport();
                    setShowSettings(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: textColor,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                    borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Upload size={16} />
                  Import
                </button>
                <button
                  onClick={() => {
                    setShowBackupSettings(true);
                    setShowSettings(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: textColor,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                    borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  💾 Backup Settings
                </button>
                <button
                  onClick={() => {
                    handleExportCalendar();
                    setShowSettings(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: textColor,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                    borderBottom: import.meta.env.VITE_DEV_ENVIRONMENT ? `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  📅 Export to Calendar
                </button>
                {import.meta.env.VITE_DEV_ENVIRONMENT && (
                  <>
                    <button
                      onClick={() => {
                        handleTestNotification();
                        setShowSettings(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        color: textColor,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'left',
                        transition: 'background-color 0.2s',
                        borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🔔 Test Notification
                    </button>
                    <button
                      onClick={() => {
                        handleLoadTestData();
                        setShowSettings(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        color: textColor,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'left',
                        transition: 'background-color 0.2s',
                        borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🧪 Load Test Data
                    </button>
                    <button
                      onClick={() => {
                        handleClearAllData();
                        setShowSettings(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'left',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🗑️ Clear All Data
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Row - Full Width with Cost on Top */}
        <div style={{
          display: 'flex',
          gap: '32px',
          marginBottom: '40px',
          alignItems: 'stretch',
          padding: '0',
          width: '100%',
        }}>
          {/* Cost Section - Stacked Vertically, Flex Grow */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
          }}>
            {/* Toggle Buttons - Only Monthly and Yearly */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setSelectedCostCycle(cycle)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: selectedCostCycle === cycle
                      ? `1px solid ${isDark ? '#60a5fa' : '#3b82f6'}`
                      : `1px solid ${isDark ? 'rgba(201, 194, 166, 0.2)' : '#d1d5db'}`,
                    backgroundColor: selectedCostCycle === cycle
                      ? isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff'
                      : isDark ? 'transparent' : '#ffffff',
                    color: isDark ? '#c9c2a6' : '#666666',
                    fontSize: '0.75rem',
                    fontWeight: selectedCostCycle === cycle ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCostCycle !== cycle) {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCostCycle !== cycle) {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#d1d5db';
                    }
                  }}
                >
                  {cycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </button>
              ))}
            </div>

            {/* Total Cost Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: isDark ? '#c9c2a6' : '#666666',
              }}>
                Total Cost
              </span>
              <div style={{ fontSize: '2rem', lineHeight: '1.2' }}>
                <span style={{
                  fontWeight: '400',
                  color: isDark ? '#c9c2a6' : '#000000',
                }}>
                  ₹
                </span>
                <span style={{
                  fontWeight: '700',
                  color: isDark ? '#c9c2a6' : '#000000',
                }}>
                  {selectedCycleCost}
                </span>
              </div>
            </div>
          </div>

          {/* Renewals Section - Stacked Vertically to Match Cost */}
          <div
            onClick={() => setShowUpcomingRenewals(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
              cursor: 'pointer',
              padding: '20px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              backgroundColor: expiredRenewals.length > 0
                ? isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2'
                : isDark ? 'transparent' : 'transparent',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = expiredRenewals.length > 0
                ? isDark ? 'rgba(239, 68, 68, 0.15)' : '#fecaca'
                : isDark ? 'rgba(201, 194, 166, 0.05)' : '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = expiredRenewals.length > 0
                ? isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2'
                : isDark ? 'transparent' : 'transparent';
            }}
          >
            {/* Icon + Label on first line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: expiredRenewals.length > 0 ? '#ef4444' : (isDark ? '#c9c2a6' : '#666666'),
              }}>
                {expiredRenewals.length > 0 ? '⚠️' : '📅'}
              </span>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: isDark ? '#c9c2a6' : '#666666',
              }}>
                Renewals
              </span>
            </div>

            {/* Count + Status on second line */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: expiredRenewals.length > 0 ? '#ef4444' : (isDark ? '#c9c2a6' : '#000000'),
                lineHeight: '1.2',
              }}>
                {expiredRenewals.length + upcomingRenewals.length}
              </span>
              {expiredRenewals.length > 0 ? (
                <span style={{
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  fontWeight: '600',
                }}>
                  {expiredRenewals.length} expired
                </span>
              ) : (
                <span style={{
                  fontSize: '0.8rem',
                  color: isDark ? '#c9c2a6' : '#999999',
                  opacity: 0.7,
                }}>
                  Next 30 days
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active Count Badge */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
            color: isDark ? '#60a5fa' : '#2563eb',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`,
          }}>
            {activeCount} active
          </span>
        </div>

        {/* Filter & Sort Controls - Combined Row */}
        <div style={{ marginBottom: '40px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Category Filter - Desktop view (dropdown) */}
          <div style={{ flex: 1, minWidth: '150px' }} className="filter-buttons">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.3)' : '#d0d0d0'}`,
                backgroundColor: isDark ? 'rgba(201, 194, 166, 0.05)' : '#f9f9f9',
                color: textColor,
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(textColor)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: '32px',
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter - Mobile view (dropdown) */}
          <div style={{ flex: 1, minWidth: '150px' }} className="filter-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.3)' : '#d0d0d0'}`,
                backgroundColor: isDark ? 'rgba(201, 194, 166, 0.05)' : '#f9f9f9',
                color: textColor,
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(textColor)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: '32px',
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <SortDropdown
              sortBy={store.sortBy}
              sortDirection={store.sortDirection}
              onSortChange={(field) => store.setSortBy(field)}
              onDirectionChange={(direction) => store.setSortDirection(direction)}
              isDark={isDark}
              textColor={textColor}
            />
          </div>
        </div>

        {/* Add Button - Desktop/Tablet view */}
        <button
          onClick={() => {
            setEditingSubscription(undefined);
            setShowForm(true);
          }}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: isDark ? 'rgba(201, 194, 166, 0.15)' : '#f0f0f0',
            color: isDark ? '#c9c2a6' : '#000000',
            border: isDark ? '1px solid rgba(201, 194, 166, 0.3)' : '1px solid #d0d0d0',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.25)' : '#e0e0e0';
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.15)' : '#f0f0f0';
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)';
          }}
          className="desktop-button"
        >
          <Plus size={24} />
          Add Subscription
        </button>

        {/* Add Button - Mobile view (floating circle with + only) */}
        <button
          onClick={() => {
            setEditingSubscription(undefined);
            setShowForm(true);
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            padding: '0',
            backgroundColor: isDark ? 'rgba(201, 194, 166, 0.15)' : '#f0f0f0',
            color: isDark ? '#c9c2a6' : '#000000',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.5rem',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.25)' : '#e0e0e0';
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.15)' : '#f0f0f0';
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)';
          }}
          className="mobile-button"
        >
          <Plus size={32} />
        </button>

        {/* Subscriptions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 550px), 1fr))', gap: '20px', paddingBottom: '80px' }}>
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', opacity: 0.7 }}>
              <p style={{ fontSize: '1.125rem' }}>
                {selectedCategory === 'all'
                  ? 'No subscriptions yet. Add one to get started!'
                  : `No subscriptions in ${selectedCategory} category.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <SubscriptionForm
          subscription={editingSubscription}
          onSubmit={handleAddSubscription}
          onCancel={() => {
            setShowForm(false);
            setEditingSubscription(undefined);
          }}
        />
      )}

      {/* Upcoming Renewals Modal */}
      {showUpcomingRenewals && (
        <div
          onClick={() => setShowUpcomingRenewals(false)}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '8px',
              width: '100%',
              maxWidth: 'clamp(300px, 90vw, 600px)',
              maxHeight: '80vh',
              overflow: 'auto',
              backgroundColor: bgColor,
              color: textColor,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: isDark ? 'transparent' : '#ffffff',
                borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb'}`,
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', fontWeight: 'bold', color: textColor, margin: 0 }}>
                Upcoming Renewals
              </h2>
              <button
                onClick={() => setShowUpcomingRenewals(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              {expiredRenewals.length > 0 || upcomingRenewals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Expired Renewals Section */}
                  {expiredRenewals.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ef4444', marginBottom: '12px', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔴 Action Required - Expired
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {expiredRenewals.map((sub) => {
                          const renewalDate = new Date(sub.renewalDate);
                          const today = new Date();
                          const daysOverdue = Math.floor((today.getTime() - renewalDate.getTime()) / (1000 * 60 * 60 * 24));

                          return (
                            <div
                              key={sub.id}
                              style={{
                                padding: '12px',
                                borderRadius: '6px',
                                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: textColor, margin: '0 0 4px 0' }}>
                                    {sub.name}
                                  </p>
                                  <p style={{ fontSize: '0.875rem', color: isDark ? '#c9c2a6' : '#666666', opacity: 0.7, margin: 0 }}>
                                    ₹ {sub.cost.toFixed(0)} • {sub.billingCycle}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                  }}
                                >
                                  {daysOverdue} days overdue
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <p style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600', margin: 0 }}>
                                  Expired on {renewalDate.toLocaleDateString()}
                                </p>
                                {sub.provider && (
                                  <button
                                    onClick={() => window.open(getRenewalUrl(sub.provider), '_blank')}
                                    style={{
                                      padding: '4px 10px',
                                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                      color: isDark ? '#f87171' : '#dc2626',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '0.75rem',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2';
                                    }}
                                    title={`Renew at ${sub.provider}`}
                                  >
                                    Renew Now
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {expiredRenewals.length > 0 && upcomingRenewals.length > 0 && (
                    <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb' }} />
                  )}

                  {/* Upcoming Renewals Section */}
                  {upcomingRenewals.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: isDark ? '#c9c2a6' : '#666666', marginBottom: '12px', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📅 Upcoming Renewals
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {upcomingRenewals.map((sub) => {
                          const renewalDate = new Date(sub.renewalDate);
                          const today = new Date();
                          const daysLeft = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                          return (
                            <div
                              key={sub.id}
                              style={{
                                padding: '12px',
                                borderRadius: '6px',
                                border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
                                backgroundColor: isDark ? 'rgba(201, 194, 166, 0.05)' : '#f9f9f9',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: textColor, margin: '0 0 4px 0' }}>
                                    {sub.name}
                                  </p>
                                  <p style={{ fontSize: '0.875rem', color: isDark ? '#c9c2a6' : '#666666', opacity: 0.7, margin: 0 }}>
                                    ₹ {sub.cost.toFixed(0)} • {sub.billingCycle}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    backgroundColor: daysLeft <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    color: daysLeft <= 7 ? '#ef4444' : '#3b82f6',
                                    border: `1px solid ${daysLeft <= 7 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                                  }}
                                >
                                  {daysLeft} days
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <p style={{ fontSize: '0.875rem', color: isDark ? '#c9c2a6' : '#666666', margin: 0 }}>
                                  Renews on {renewalDate.toLocaleDateString()}
                                </p>
                                {sub.provider && (
                                  <button
                                    onClick={() => window.open(getRenewalUrl(sub.provider), '_blank')}
                                    style={{
                                      padding: '4px 10px',
                                      backgroundColor: isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308',
                                      color: isDark ? '#facc15' : 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '0.75rem',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.3)' : '#ca8a04';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308';
                                    }}
                                    title={`Renew at ${sub.provider}`}
                                  >
                                    Renew Now
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: isDark ? '#c9c2a6' : '#666666', opacity: 0.7, padding: '20px 0', fontSize: '0.95rem' }}>
                  No renewals to manage
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings Modal */}
      {showBackupSettings && (
        <div
          onClick={() => setShowBackupSettings(false)}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '8px',
              width: '100%',
              maxWidth: 'clamp(300px, 90vw, 500px)',
              backgroundColor: bgColor,
              color: textColor,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 'bold', margin: 0 }}>
                💾 Backup Settings
              </h2>
              <button
                onClick={() => setShowBackupSettings(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.95rem', color: isDark ? '#c9c2a6' : '#666666', marginBottom: '16px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Set how often your subscriptions should be automatically backed up.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: textColor, marginBottom: '12px', margin: '0 0 12px 0' }}>
                Auto Backup Frequency
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => BackupService.setFrequency(freq)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: BackupService.getFrequency() === freq
                        ? `2px solid ${isDark ? '#60a5fa' : '#3b82f6'}`
                        : `1px solid ${isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb'}`,
                      backgroundColor: BackupService.getFrequency() === freq
                        ? isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff'
                        : isDark ? 'transparent' : '#f9f9f9',
                      color: textColor,
                      cursor: 'pointer',
                      fontWeight: BackupService.getFrequency() === freq ? '600' : '500',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize',
                    }}
                    onMouseEnter={(e) => {
                      if (BackupService.getFrequency() !== freq) {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#d1d5db';
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.05)' : '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (BackupService.getFrequency() !== freq) {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb';
                        e.currentTarget.style.backgroundColor = isDark ? 'transparent' : '#f9f9f9';
                      }
                    }}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}` }}>
              <p style={{ fontSize: '0.875rem', color: isDark ? '#c9c2a6' : '#666666', opacity: 0.7, margin: 0 }}>
                Last backup: {BackupService.getLastBackupDate()}
              </p>
            </div>

            <button
              onClick={() => {
                handleExportBackup();
                setShowBackupSettings(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#22c55e',
                color: isDark ? '#4ade80' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.3)' : '#16a34a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.2)' : '#22c55e';
              }}
            >
              💾 Export Backup Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
