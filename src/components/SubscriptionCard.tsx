import React from 'react';
import type { Subscription, Category } from '../types/subscription';
import { Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<Category, string> = {
  streaming: '🎬',
  music: '🎵',
  productivity: '💼',
  gaming: '🎮',
  education: '📚',
  other: '📦',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
}) => {
  const renewalDate = new Date(subscription.renewalDate);
  const today = new Date();
  const daysUntilRenewal = Math.ceil(
    (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUpcomingSoon = daysUntilRenewal <= subscription.reminderDaysBefore && daysUntilRenewal > 0;

  const billingCycleMultiplier = {
    monthly: 1,
    quarterly: 1 / 3,
    'bi-annual': 1 / 6,
    yearly: 1 / 12,
  }[subscription.billingCycle];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-blue-500">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-3xl">{categoryIcons[subscription.category]}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{subscription.name}</h3>
              {subscription.provider && (
                <p className="text-sm text-gray-500">{subscription.provider}</p>
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              statusColors[subscription.status]
            }`}
          >
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Cost</span>
            <span className="font-bold text-lg text-gray-800">
              {subscription.currency} {subscription.cost.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monthly (avg)</span>
            <span className="text-gray-800 font-medium">
              {subscription.currency} {(subscription.cost * billingCycleMultiplier).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Billing Cycle</span>
            <span className="text-gray-800 font-medium capitalize">
              {subscription.billingCycle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <div className="flex-1">
              <span className="text-gray-600">Next renewal</span>
              <p className="font-medium text-gray-800">
                {renewalDate.toLocaleDateString()}
                {daysUntilRenewal > 0 && (
                  <span
                    className={`ml-2 text-sm ${
                      isUpcomingSoon ? 'text-red-600 font-bold' : 'text-gray-500'
                    }`}
                  >
                    ({daysUntilRenewal} days)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {isUpcomingSoon && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              Renewal reminder set for {subscription.reminderDaysBefore} days before
            </p>
          </div>
        )}

        {subscription.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">{subscription.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => onEdit(subscription)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg transition"
          >
            <Edit2 size={18} />
            Edit
          </button>
          <button
            onClick={() => onDelete(subscription.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 rounded-lg transition"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
