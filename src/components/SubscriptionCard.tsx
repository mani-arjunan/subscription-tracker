import React, { useState } from 'react';
import type { Subscription, Category } from '../types/subscription';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

const categoryColors: Record<Category, { light: string; lightBg: string; dark: string; darkBg: string }> = {
  streaming: { light: '#e11d48', lightBg: '#ffe0e6', dark: '#fb7185', darkBg: 'rgba(244, 63, 94, 0.1)' },
  music: { light: '#0891b2', lightBg: '#e0f2fe', dark: '#06b6d4', darkBg: 'rgba(6, 182, 212, 0.1)' },
  productivity: { light: '#ea580c', lightBg: '#fff7ed', dark: '#fb923c', darkBg: 'rgba(251, 146, 60, 0.1)' },
  gaming: { light: '#7c3aed', lightBg: '#f3e0ff', dark: '#d8b4fe', darkBg: 'rgba(216, 180, 254, 0.1)' },
  education: { light: '#059669', lightBg: '#ecfdf5', dark: '#10b981', darkBg: 'rgba(16, 185, 129, 0.1)' },
  other: { light: '#6366f1', lightBg: '#eef2ff', dark: '#a5b4fc', darkBg: 'rgba(165, 180, 252, 0.1)' },
};

const POPULAR_SERVICES: Record<string, string> = {
  'netflix': 'netflix.com/account',
  'spotify': 'spotify.com/account',
  'youtube premium': 'youtube.com/account',
  'youtube tv': 'youtube.com/account',
  'youtube music': 'youtube.com/account',
  'apple music': 'music.apple.com/account',
  'prime video': 'amazon.in/gp/css/homepage.html?ref_=nav_youraccount_btn',
  'amazon prime': 'amazon.in/gp/css/homepage.html?ref_=nav_youraccount_btn',
  'disney+': 'hotstar.com/account',
  'hotstar': 'hotstar.com/account',
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

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'transparent' : '#ffffff';
  const textColor = isDark ? '#c9c2a6' : '#000000';
  const secondaryTextColor = isDark ? '#c9c2a6' : '#666666';
  const borderColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#e0e0e0';

  const [isExpanded, setIsExpanded] = useState(false);

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

  const yearlyAmount = Math.round(subscription.cost * 12 * billingCycleMultiplier);

  if (isExpanded) {
    // EXPANDED VIEW
    return (
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        color: textColor,
      }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{categoryIcons[subscription.category]}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{subscription.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, paddingLeft: '20pt' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '500',
                border: `1px solid ${
                  subscription.status === 'active' ? '#10b981' :
                  subscription.status === 'paused' ? '#eab308' : '#ef4444'
                }`,
                backgroundColor:
                  subscription.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                  subscription.status === 'paused' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color:
                  subscription.status === 'active' ? '#10b981' :
                  subscription.status === 'paused' ? '#eab308' : '#ef4444',
                whiteSpace: 'nowrap',
              }}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
              <span style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                fontWeight: '600',
                backgroundColor: isDark ? categoryColors[subscription.category].darkBg : categoryColors[subscription.category].lightBg,
                color: isDark ? categoryColors[subscription.category].dark : categoryColors[subscription.category].light,
                padding: '4px 12px',
                borderRadius: '9999px',
                border: `1px solid ${isDark ? `${categoryColors[subscription.category].dark}40` : `${categoryColors[subscription.category].light}40`}`,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}>
                {subscription.category}
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  borderRadius: '6px',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Collapse"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}`, maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Provider</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>{subscription.provider || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Cost</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>₹{subscription.cost.toFixed(0)} / {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Yearly Cost</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>₹{yearlyAmount}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Status</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0, textTransform: 'capitalize' }}>{subscription.status}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Next Renewal</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>{renewalDate.toLocaleDateString()} ({daysUntilRenewal > 0 ? daysUntilRenewal : 0} days)</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Reminder Days</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>{subscription.reminderDaysBefore} days before</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Created</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>{new Date(subscription.createdAt).toLocaleDateString()}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.875rem', color: secondaryTextColor, opacity: 0.7, margin: '0 0 4px 0', fontWeight: '500' }}>Notes</p>
              <p style={{ fontSize: '0.95rem', color: textColor, margin: 0 }}>{subscription.notes || '—'}</p>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
          {isUpcomingSoon && subscription.provider && (
            <button
              onClick={() => window.open(getRenewalUrl(subscription.provider), '_blank')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '500',
                padding: '10px 0',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308',
                color: isDark ? '#facc15' : 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.3)' : '#ca8a04';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308';
              }}
              title={`Renew at ${subscription.provider}`}
            >
              🔄 Renew Now
            </button>
          )}
          <button
            onClick={() => {
              setIsExpanded(false);
              onEdit(subscription);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '500',
              padding: '10px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
              color: isDark ? '#60a5fa' : '#2563eb',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe';
            }}
          >
            <Edit2 size={18} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this subscription?')) {
                setIsExpanded(false);
                onDelete(subscription.id);
              }
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '500',
              padding: '10px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
              color: isDark ? '#f87171' : '#dc2626',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2';
            }}
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    );
  }

  // COMPACT VIEW (DEFAULT)
  return (
    <div style={{
      borderRadius: '8px',
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
      backgroundColor: bgColor,
      color: textColor,
    }}>
      <div style={{ padding: '16px 20px' }}>
        {/* Row 1: Title and Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: '1.75rem', flexShrink: 0, lineHeight: 1 }}>{categoryIcons[subscription.category]}</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>{subscription.name}</h3>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', paddingLeft: '20pt' }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '500',
              border: `1px solid ${
                subscription.status === 'active' ? '#10b981' :
                subscription.status === 'paused' ? '#eab308' : '#ef4444'
              }`,
              backgroundColor:
                subscription.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                subscription.status === 'paused' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color:
                subscription.status === 'active' ? '#10b981' :
                subscription.status === 'paused' ? '#eab308' : '#ef4444',
            }}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
            <span style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: '600',
              backgroundColor: isDark ? categoryColors[subscription.category].darkBg : categoryColors[subscription.category].lightBg,
              color: isDark ? categoryColors[subscription.category].dark : categoryColors[subscription.category].light,
              padding: '3px 10px',
              borderRadius: '9999px',
              border: `1px solid ${isDark ? `${categoryColors[subscription.category].dark}40` : `${categoryColors[subscription.category].light}40`}`,
              textTransform: 'capitalize',
            }}>
              {subscription.category}
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: textColor,
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Expand"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Row 2: Plan and Yearly */}
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.25rem', color: secondaryTextColor, opacity: 0.6, fontWeight: '500', letterSpacing: '0.5px' }}>Billing Plan</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: textColor, margin: 0 }}>₹{subscription.cost.toFixed(0)}</p>
                <span style={{ fontSize: '0.8rem', color: secondaryTextColor, opacity: 0.7, fontWeight: '500', textTransform: 'capitalize' }}>/{subscription.billingCycle}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.25rem', color: secondaryTextColor, opacity: 0.6, fontWeight: '500', letterSpacing: '0.5px' }}>Yearly Cost</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: textColor, margin: '6px 0 0 0' }}>₹{yearlyAmount}</p>
            </div>
          </div>
        </div>

        {/* Row 3: Next Renewal */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ color: secondaryTextColor, opacity: 0.6, fontSize: '0.25rem', fontWeight: '600', letterSpacing: '0.5px' }}>Next Renewals</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
            <p style={{ fontWeight: '600', color: textColor, fontSize: '1.1rem', margin: 0 }}>
              {renewalDate.toLocaleDateString()}
              {daysUntilRenewal > 0 && (
                <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: isUpcomingSoon ? '#ef4444' : secondaryTextColor, fontWeight: isUpcomingSoon ? '700' : '500', opacity: isUpcomingSoon ? 1 : 0.7 }}>
                  {daysUntilRenewal}d
                </span>
              )}
            </p>
            {isUpcomingSoon && subscription.provider && (
              <button
                onClick={() => window.open(getRenewalUrl(subscription.provider), '_blank')}
                style={{
                  padding: '6px 14px',
                  backgroundColor: isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308',
                  color: isDark ? '#facc15' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.3)' : '#ca8a04';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#eab308';
                }}
                title={`Renew at ${subscription.provider}`}
              >
                Renew
              </button>
            )}
          </div>
        </div>

        {/* Row 4: Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(subscription)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontWeight: '600',
              padding: '10px 0',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
              color: isDark ? '#60a5fa' : '#2563eb',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontSize: '0.9rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe';
            }}
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this subscription?')) {
                onDelete(subscription.id);
              }
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontWeight: '600',
              padding: '10px 0',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
              color: isDark ? '#f87171' : '#dc2626',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontSize: '0.9rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2';
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
