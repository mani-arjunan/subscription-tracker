import React, { useState } from 'react';
import type { Subscription, Category } from '../types/subscription';
import { X } from 'lucide-react';

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (data: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['streaming', 'music', 'productivity', 'gaming', 'education', 'other'];
const STATUSES = ['active', 'paused', 'cancelled'];
const BILLING_CYCLES = ['monthly', 'quarterly', 'bi-annual', 'yearly'];

const categoryIcons: Record<Category, string> = {
  streaming: '🎬',
  music: '🎵',
  productivity: '💼',
  gaming: '🎮',
  education: '📚',
  other: '📦',
};

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    provider: subscription?.provider || '',
    cost: subscription?.cost || 0,
    currency: subscription?.currency || 'USD',
    billingCycle: subscription?.billingCycle || 'monthly',
    renewalDate: subscription?.renewalDate || new Date().toISOString().split('T')[0],
    category: subscription?.category || 'streaming',
    status: subscription?.status || 'active',
    reminderDaysBefore: subscription?.reminderDaysBefore || 7,
    notes: subscription?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' || name === 'reminderDaysBefore' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Subscription, 'id' | 'createdAt'>);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {subscription ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Netflix, Spotify"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Provider Website/Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Website
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="e.g., netflix.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
                <option>CAD</option>
                <option>AUD</option>
              </select>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
              </label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {BILLING_CYCLES.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Renewal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Renewal Date *
              </label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reminder Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remind me before (days)
              </label>
              <input
                type="number"
                name="reminderDaysBefore"
                value={formData.reminderDaysBefore}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this subscription..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              {subscription ? 'Update Subscription' : 'Add Subscription'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
