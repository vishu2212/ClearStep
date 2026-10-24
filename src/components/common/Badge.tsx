import React from 'react';
import { TaskPriority } from '../../domain/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'success' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 font-semibold border border-red-200 dark:border-red-900',
    high: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md whitespace-nowrap select-none ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  const labels: Record<TaskPriority, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <Badge variant={priority} size={size}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
      {labels[priority]}
    </Badge>
  );
};
