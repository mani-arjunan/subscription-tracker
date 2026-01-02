import React, { useState, useEffect } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type { Subscription, Category } from '../types/subscription';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionForm } from './SubscriptionForm';
import { StatsCard } from './StatsCard';
import { ReminderService } from '../services/reminderService';
import { Plus, Download, Upload, Bell, Settings } from 'lucide-react';

const CATEGORIES: Category[] = ['streaming', 'music', 'productivity', 'gaming', 'education', 'other'];

const categoryIcons: Record<Category, string> = {
  streaming: '🎬',
  music: '🎵',
  productivity: '💼',
  gaming: '🎮',
  education: '📚',
  other: '📦',
};

export const Dashboard: React.FC = () => {
  const store = useSubscriptionStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    store.loadFromStorage();
    checkNotificationPermission();
    startReminderCheck();
  }, []);

  useEffect(() => {
    // Check reminders every minute
    const interval = setInterval(() => {
      ReminderService.checkAndNotifyReminders(store.subscriptions);
    }, 60000);

    return () => clearInterval(interval);
  }, [store.subscriptions]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission === 'granted');
    }
  };

  const startReminderCheck = () => {
    ReminderService.checkAndNotifyReminders(store.subscriptions);
  };

  const handleEnableNotifications = async () => {
    const granted = await ReminderService.requestPermission();
    setNotificationPermission(granted);
  };

  const handleAddSubscription = (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      store.updateSubscription(editingSubscription.id, data);
    } else {
      store.addSubscription(data);
    }
    setShowForm(false);
    setEditingSubscription(undefined);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      store.deleteSubscription(id);
    }
  };

  const handleExport = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const filteredSubscriptions =
    selectedCategory === 'all'
      ? store.subscriptions
      : store.getSubscriptionsByCategory(selectedCategory);

  const activeCount = store.getActiveSubscriptions().length;
  const totalMonthlyCost = store.getTotalMonthlyCost();
  const upcomingRenewals = store.getUpcomingRenewals(30);
  const costByCategory = store.getCostByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-8 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Subscription Tracker</h1>
            <p className="text-purple-300">Manage and track all your subscriptions in one place</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEnableNotifications}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                notificationPermission
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              <Bell size={20} />
              {notificationPermission ? 'Notifications On' : 'Enable Notifications'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg text-white transition"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 mb-8 text-white border border-white border-opacity-20">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              >
                <Download size={18} />
                Export Data
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium"
              >
                <Upload size={18} />
                Import Data
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Active"
            value={activeCount}
            color="blue"
            icon="📊"
          />
          <StatsCard
            title="Monthly Cost"
            value={`${store.currency} ${totalMonthlyCost.toFixed(2)}`}
            color="purple"
            icon="💰"
          />
          <StatsCard
            title="Upcoming Renewals"
            value={upcomingRenewals.length}
            subtitle="Next 30 days"
            color="pink"
            icon="📅"
          />
          <StatsCard
            title="Categories"
            value={Object.values(costByCategory).filter((cost) => cost > 0).length}
            color="green"
            icon="🏷️"
          />
        </div>

        {/* Category Filter */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 mb-8 border border-white border-opacity-20">
          <h3 className="text-white font-bold mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-white text-purple-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? 'bg-white text-purple-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setEditingSubscription(undefined);
            setShowForm(true);
          }}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110 font-bold text-lg"
        >
          <Plus size={24} />
          Add Subscription
        </button>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="col-span-full text-center py-12">
              <p className="text-white text-opacity-70 text-lg">
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
    </div>
  );
};
