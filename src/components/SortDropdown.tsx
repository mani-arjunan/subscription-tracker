import React from 'react';
import type { SortField, SortDirection } from '../types/subscription';

interface SortDropdownProps {
  sortBy: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
  isDark: boolean;
  textColor: string;
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'renewalDate', label: 'Renewal Date' },
  { field: 'yearlyTotal', label: 'Yearly Cost' },
  { field: 'name', label: 'Name' },
  { field: 'status', label: 'Status' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortDirection,
  onSortChange,
  onDirectionChange,
  isDark,
  textColor,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLabel = SORT_OPTIONS.find((opt) => opt.field === sortBy)?.label || 'Sort';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.3)' : '#d0d0d0'}`,
            backgroundColor: isDark ? 'rgba(201, 194, 166, 0.05)' : '#f9f9f9',
            color: textColor,
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          Sort: {currentLabel}
        </button>
        <button
          onClick={() => onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '6px 8px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'transparent',
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            fontSize: '1rem',
            fontWeight: '500',
            opacity: 0.5,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
          title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            backgroundColor: isDark ? '#1a1f2e' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.3)' : '#d0d0d0'}`,
            borderRadius: '6px',
            boxShadow: isDark
              ? '0 10px 25px rgba(0, 0, 0, 0.5)'
              : '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            minWidth: '160px',
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.field}
              onClick={() => {
                onSortChange(option.field);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor:
                  sortBy === option.field
                    ? isDark
                      ? 'rgba(201, 194, 166, 0.1)'
                      : '#f0f0f0'
                    : 'transparent',
                color: textColor,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: sortBy === option.field ? '600' : '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? 'rgba(201, 194, 166, 0.15)'
                  : '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  sortBy === option.field
                    ? isDark
                      ? 'rgba(201, 194, 166, 0.1)'
                      : '#f0f0f0'
                    : 'transparent';
              }}
            >
              {sortBy === option.field ? '✓ ' : '  '}
              {option.label}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
};
