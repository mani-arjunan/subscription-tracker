import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'pink' | 'green';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  green: 'from-green-500 to-green-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}) => {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-white text-opacity-75 text-xs mt-2">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
};
