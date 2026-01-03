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

// Popular subscription services with their homepages
const POPULAR_SERVICES: Record<string, string> = {
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'youtube premium': 'youtube.com',
  'youtube tv': 'youtube.com',
  'youtube music': 'youtube.com',
  'apple music': 'music.apple.com',
  'prime video': 'amazon.com',
  'amazon prime': 'amazon.com',
  'disney+': 'disneyplus.com',
  'hulu': 'hulu.com',
  'max': 'hbomax.com',
  'paramount+': 'paramountplus.com',
  'apple tv+': 'tv.apple.com',
  'adobe': 'adobe.com',
  'microsoft 365': 'microsoft.com',
  'office 365': 'microsoft.com',
  'github': 'github.com',
  'notion': 'notion.so',
  'figma': 'figma.com',
  'canva': 'canva.com',
  'grammarly': 'grammarly.com',
  'duolingo': 'duolingo.com',
  'skillshare': 'skillshare.com',
  'coursera': 'coursera.org',
  'udemy': 'udemy.com',
  'masterclass': 'masterclass.com',
  'playstation plus': 'playstation.com',
  'xbox game pass': 'xbox.com',
  'steam': 'steampowered.com',
  'discord': 'discord.com',
  'dropbox': 'dropbox.com',
  'google one': 'google.com',
  'icloud+': 'icloud.com',
  'slack': 'slack.com',
  'trello': 'trello.com',
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
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
    } else if (step === 2) {
      // Renewal Date validation
      if (!formData.renewalDate) {
        newErrors.renewalDate = 'Renewal date is required';
      }
      // Reminder Days validation
      if (formData.reminderDaysBefore < 1) {
        newErrors.reminderDaysBefore = 'Reminder days must be at least 1';
      } else if (formData.reminderDaysBefore > 30) {
        newErrors.reminderDaysBefore = 'Reminder days must be 30 or less';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
        setErrors({});
        // Scroll content to top when moving to next step
        const contentDiv = document.querySelector('[data-step-content]');
        if (contentDiv) {
          contentDiv.scrollTop = 0;
        }
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto-populate provider URL for popular services when name field changes
    if (name === 'name' && !subscription) {
      const serviceName = value.toLowerCase().trim();

      // Only auto-populate if there's actual text in the name field
      let providerValue = '';
      if (serviceName.length > 0) {
        const matchedService = Object.keys(POPULAR_SERVICES).find(
          service => serviceName.includes(service) || service.includes(serviceName)
        );
        providerValue = matchedService ? POPULAR_SERVICES[matchedService] : '';
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        provider: providerValue,
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
    if (isMobileView && currentStep < 2) {
      return;
    }
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

  // Mobile Wizard Step Rendering
  const renderMobileStep = () => {
    const baseFieldStyle = (fieldName: string) => ({
      width: '100%',
      padding: '12px 14px',
      border: `1px solid ${errors[fieldName] ? errorColor : borderColor}`,
      borderRadius: '6px',
      backgroundColor: inputBgColor,
      color: textColor,
      fontSize: '0.95rem',
      transition: 'border-color 0.2s',
    });

    const selectStyle = (fieldName: string) => ({
      ...baseFieldStyle(fieldName),
      paddingRight: '36px',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(textColor)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      cursor: 'pointer',
    });

    const labelStyle = {
      display: 'block',
      fontSize: '0.95rem',
      fontWeight: '500' as const,
      marginBottom: '10px',
      color: textColor,
      opacity: 0.85,
    };

    if (currentStep === 1) {
      return (
        <div>
          {/* Provider Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Provider Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Netflix, Spotify"
              style={baseFieldStyle('name') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors['name'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors['name'] ? errorColor : borderColor;
              }}
            />
            {errors.name && <p style={{ color: errorColor, fontSize: '0.8rem', marginTop: '6px', margin: '6px 0 0 0' }}>{errors.name}</p>}
          </div>

          {/* Provider Website */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Provider Website</label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              placeholder="e.g., netflix.com"
              style={baseFieldStyle('provider') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            />
          </div>

          {/* Cost */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Cost * (₹)</label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ''}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              style={baseFieldStyle('cost') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors['cost'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors['cost'] ? errorColor : borderColor;
              }}
            />
            {errors.cost && <p style={{ color: errorColor, fontSize: '0.8rem', marginTop: '6px', margin: '6px 0 0 0' }}>{errors.cost}</p>}
          </div>

          {/* Status */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={selectStyle('status') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Cycle */}
          <div>
            <label style={labelStyle}>Billing Cycle</label>
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              style={selectStyle('billingCycle') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div>
          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={selectStyle('category') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Renewal Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Next Renewal Date *</label>
            <input
              type="date"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleChange}
              style={baseFieldStyle('renewalDate') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors['renewalDate'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors['renewalDate'] ? errorColor : borderColor;
              }}
            />
            {errors.renewalDate && <p style={{ color: errorColor, fontSize: '0.8rem', marginTop: '6px', margin: '6px 0 0 0' }}>{errors.renewalDate}</p>}
          </div>

          {/* Reminder Days */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Remind me before (days)</label>
            <input
              type="number"
              name="reminderDaysBefore"
              value={formData.reminderDaysBefore}
              onChange={handleChange}
              min="1"
              max="30"
              style={baseFieldStyle('reminderDaysBefore') as any}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors['reminderDaysBefore'] ? errorColor : (isDark ? 'rgba(201, 194, 166, 0.4)' : '#2563eb');
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors['reminderDaysBefore'] ? errorColor : borderColor;
              }}
            />
            {errors.reminderDaysBefore && <p style={{ color: errorColor, fontSize: '0.8rem', marginTop: '6px', margin: '6px 0 0 0' }}>{errors.reminderDaysBefore}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this subscription..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                backgroundColor: inputBgColor,
                color: textColor,
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            />
          </div>
        </div>
      );
    }
    // Fallback for any invalid step (shouldn't happen, but safety check)
    return <div>Invalid step</div>;
  };

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
        maxWidth: isMobileView ? 'clamp(300px, 95vw, 500px)' : 'clamp(300px, 90vw, 800px)',
        maxHeight: '95vh',
        overflow: 'auto',
        overflowX: 'hidden',
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
          padding: isMobileView ? '14px 16px' : '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: isMobileView ? '1.25rem' : 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 'bold', color: textColor, margin: 0 }}>
              {subscription ? 'Edit' : 'Add'} Subscription
            </h2>
            {isMobileView && (
              <p style={{ fontSize: '0.8rem', color: textColor, opacity: 0.6, margin: '4px 0 0 0' }}>
                Step {currentStep} of 2
              </p>
            )}
          </div>
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

        {/* MOBILE WIZARD VIEW */}
        {isMobileView ? (
          <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            <div data-step-content style={{ flex: 1, marginBottom: '16px', minHeight: 0, overflow: 'auto' }}>
              {renderMobileStep()}
            </div>

            {/* Mobile Navigation Buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(201, 194, 166, 0.1)' : '#f0f0f0',
                    color: textColor,
                    fontWeight: '500',
                    padding: '12px 0',
                    borderRadius: '6px',
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#f0f0f0';
                  }}
                >
                  ← Back
                </button>
              )}
              {currentStep < 3 ? currentStep === 2 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    flex: 3,
                    backgroundColor: textColor,
                    color: bgColor,
                    fontWeight: '500',
                    padding: '12px 0',
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
                  {subscription ? 'Update' : 'Add'} Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    flex: 1,
                    backgroundColor: textColor,
                    color: bgColor,
                    fontWeight: '500',
                    padding: '12px 0',
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
                  Next →
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          /* DESKTOP GRID VIEW */
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
              {subscription ? 'Update' : 'Add'}
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
        )}
      </div>
    </div>
  );
};
