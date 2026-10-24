import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1">
          <span>{label}</span>
          <span className="font-medium font-mono">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full bg-slate-200 dark:bg-slate-750 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}
      >
        <div
          className={`h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
