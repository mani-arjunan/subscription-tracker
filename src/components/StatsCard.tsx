import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const titleColor = isDark ? '#c9c2a6' : '#666666';
  const valueColor = isDark ? '#c9c2a6' : '#000000';
  const subtitleColor = isDark ? '#c9c2a6' : '#999999';

  return (
    <div style={{
      padding: 'clamp(12px, 4vw, 20px)',
      borderRadius: '8px',
      border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e0e0e0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '8px',
      backgroundColor: isDark ? 'transparent' : '#f9f9f9',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
          fontWeight: '500',
          marginBottom: '6px',
          color: titleColor,
          opacity: 0.8,
        }}>
          {title}
        </p>
        <p style={{
          fontSize: 'clamp(1.25rem, 5vw, 1.875rem)',
          fontWeight: 'bold',
          color: valueColor,
          marginBottom: subtitle ? '4px' : 0,
          lineHeight: '1.2',
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
            marginTop: '4px',
            color: subtitleColor,
            opacity: 0.7,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          opacity: 0.6,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
    </div>
  );
};
