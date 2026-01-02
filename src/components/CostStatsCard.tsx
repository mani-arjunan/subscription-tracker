import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface CostStatsCardProps {
  totalMonthlyCost: number;
  icon?: React.ReactNode;
}

type CostCycle = 'M' | 'Q' | 'B' | 'Y';

export const CostStatsCard: React.FC<CostStatsCardProps> = ({
  totalMonthlyCost,
  icon,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const titleColor = isDark ? '#c9c2a6' : '#666666';
  const valueColor = isDark ? '#c9c2a6' : '#000000';
  const buttonBgActive = isDark ? 'rgba(201, 194, 166, 0.2)' : '#e5e7eb';
  const buttonBgInactive = isDark ? 'transparent' : '#f9f9f9';
  const borderColor = isDark ? 'rgba(201, 194, 166, 0.1)' : '#e0e0e0';

  const [selectedCycle, setSelectedCycle] = useState<CostCycle>('Y');

  const costMultipliers: Record<CostCycle, number> = {
    M: 1,
    Q: 3,
    B: 6,
    Y: 12,
  };

  const cycleLabels: Record<CostCycle, string> = {
    M: 'Monthly',
    Q: 'Quarterly',
    B: 'Bi-annual',
    Y: 'Yearly',
  };

  const cost = totalMonthlyCost * costMultipliers[selectedCycle];

  return (
    <div style={{
      padding: 'clamp(12px, 4vw, 20px)',
      borderRadius: '8px',
      border: `1px solid ${borderColor}`,
      backgroundColor: isDark ? 'transparent' : '#f9f9f9',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
        <p style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
          fontWeight: '500',
          color: titleColor,
          opacity: 0.8,
          margin: 0,
        }}>
          Cost
        </p>
        <div style={{ display: 'flex', gap: 'clamp(2px, 1vw, 6px)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(Object.keys(costMultipliers) as CostCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setSelectedCycle(cycle)}
              style={{
                padding: 'clamp(3px, 0.5vw, 6px) clamp(6px, 1vw, 10px)',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: selectedCycle === cycle ? buttonBgActive : buttonBgInactive,
                color: valueColor,
                fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                fontWeight: selectedCycle === cycle ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: selectedCycle === cycle ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (selectedCycle !== cycle) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCycle !== cycle) {
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              {cycle}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 'clamp(1.25rem, 5vw, 1.875rem)',
            fontWeight: 'bold',
            color: valueColor,
            margin: 0,
            lineHeight: '1.2',
          }}>
            ₹ {cost.toFixed(0)}
          </p>
          <p style={{
            fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
            marginTop: '4px',
            color: titleColor,
            opacity: 0.6,
            margin: 0,
          }}>
            {cycleLabels[selectedCycle]}
          </p>
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
    </div>
  );
};
