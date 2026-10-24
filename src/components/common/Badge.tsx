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
  const sizeStyles = size === 'sm' ? 'font-label-sm text-label-sm px-2 py-0.5' : 'font-label-md text-label-md px-2.5 py-1';

  const variantStyles = {
    default: 'bg-bg-sunken text-text-secondary',
    urgent: 'bg-danger-bg text-danger font-semibold border border-danger/30',
    high: 'bg-warning-bg text-warning font-medium border border-warning/30',
    medium: 'bg-brand-tint text-brand-strong font-medium',
    low: 'bg-bg-sunken text-text-tertiary',
    success: 'bg-success-bg text-success border border-success/30 font-medium',
    outline: 'border border-border-subtle/40 text-text-secondary bg-transparent',
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
