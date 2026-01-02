import React, { useState } from 'react';
import type { Subscription, Category } from '../types/subscription';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

// Popular subscription services with their renewal URLs
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

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    provider: subscription?.provider || '',
    cost: subscription?.cost || 0,
    currency: subscription?.currency || 'INR',
    billingCycle: subscription?.billingCycle || 'monthly',
    renewalDate: subscription?.renewalDate || new Date().toISOString().split('T')[0],
    category: subscription?.category || 'streaming',
    status: subscription?.status || 'active',
    reminderDaysBefore: subscription?.reminderDaysBefore || 7,
    notes: subscription?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Provider Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Provider name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Provider name must be less than 50 characters';
    }

    // Cost validation
    if (formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    } else if (isNaN(formData.cost)) {
      newErrors.cost = 'Cost must be a valid number';
    } else if (formData.cost > 1000000) {
      newErrors.cost = 'Cost seems too high';
    }

    // Renewal Date validation
    if (!formData.renewalDate) {
      newErrors.renewalDate = 'Renewal date is required';
    } else {
      const selectedDate = new Date(formData.renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.renewalDate = 'Renewal date cannot be in the past';
      }
    }

    // Reminder Days validation
    if (formData.reminderDaysBefore < 1) {
      newErrors.reminderDaysBefore = 'Reminder days must be at least 1';
    } else if (formData.reminderDaysBefore > 30) {
      newErrors.reminderDaysBefore = 'Reminder days must be 30 or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto-populate provider URL for popular services when name field changes
    if (name === 'name' && !subscription) {
      const serviceName = value.toLowerCase().trim();
      const matchedService = Object.keys(POPULAR_SERVICES).find(
        service => serviceName.includes(service) || service.includes(serviceName)
      );

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        provider: matchedService ? POPULAR_SERVICES[matchedService] : prev.provider,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'cost' || name === 'reminderDaysBefore' ? parseFloat(value) || 0 : value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as Omit<Subscription, 'id' | 'createdAt'>);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f1115' : '#ffffff';
  const textColor = isDark ? '#c9c2a6' : '#000000';
  const borderColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb';
  const inputBgColor = isDark ? 'rgba(201, 194, 166, 0.05)' : '#f9fafb';
  const errorColor = '#ef4444';

  const getInputStyle = (fieldName: string) => ({
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${errors[fieldName] ? errorColor : borderColor}`,
    borderRadius: '6px',
    backgroundColor: inputBgColor,
    color: textColor,
    fontSize: '0.875rem',
    transition: 'border-color 0.2s',
  });

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
      <div style={{
        borderRadius: '8px',
        width: '100%',
        maxWidth: 'clamp(300px, 90vw, 800px)',
        maxHeight: '95vh',
        overflow: 'auto',
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: isDark ? 'transparent' : '#ffffff',
          borderBottom: `1px solid ${borderColor}`,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 'bold', color: textColor }}>
            {subscription ? 'Edit' : 'Add'} Subscription
          </h2>
          <button
            onClick={onCancel}
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
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Provider Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Provider Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Netflix, Spotify"
                style={getInputStyle('name') as any}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = errors['name'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors['name'] ? errorColor : borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.name && (
                <p style={{ color: errorColor, fontSize: '0.75rem', marginTop: '4px' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Provider Website/Link */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Provider Website
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="e.g., netflix.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: inputBgColor,
                  color: textColor,
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Cost */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                style={getInputStyle('cost') as any}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = errors['cost'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors['cost'] ? errorColor : borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.cost && (
                <p style={{ color: errorColor, fontSize: '0.75rem', marginTop: '4px' }}>
                  {errors.cost}
                </p>
              )}
            </div>


            {/* Billing Cycle */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Billing Cycle
              </label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: inputBgColor,
                  color: textColor,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Next Renewal Date *
              </label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                style={getInputStyle('renewalDate') as any}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = errors['renewalDate'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors['renewalDate'] ? errorColor : borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.renewalDate && (
                <p style={{ color: errorColor, fontSize: '0.75rem', marginTop: '4px' }}>
                  {errors.renewalDate}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: inputBgColor,
                  color: textColor,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: inputBgColor,
                  color: textColor,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: textColor,
                opacity: 0.8,
              }}>
                Remind me before (days)
              </label>
              <input
                type="number"
                name="reminderDaysBefore"
                value={formData.reminderDaysBefore}
                onChange={handleChange}
                min="1"
                max="30"
                style={getInputStyle('reminderDaysBefore') as any}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = errors['reminderDaysBefore'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 3px rgba(201, 194, 166, 0.1)' : '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors['reminderDaysBefore'] ? errorColor : borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.reminderDaysBefore && (
                <p style={{ color: errorColor, fontSize: '0.75rem', marginTop: '4px' }}>
                  {errors.reminderDaysBefore}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '8px',
              color: textColor,
              opacity: 0.8,
            }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this subscription..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                backgroundColor: inputBgColor,
                color: textColor,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: textColor,
                color: bgColor,
                fontWeight: '500',
                padding: '10px 0',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 0.9,
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
            >
              {subscription ? 'Update Subscription' : 'Add Subscription'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                backgroundColor: isDark ? 'transparent' : '#f3f4f6',
                color: textColor,
                fontWeight: '500',
                padding: '10px 0',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.05)' : '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'transparent' : '#f3f4f6';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
