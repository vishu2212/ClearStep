import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'font-label-md text-label-md px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'font-body-md text-body-md px-4 py-2 gap-2 min-h-[40px]',
    lg: 'font-title-md text-title-md px-5 py-2.5 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-brand text-brand-on hover:bg-brand-strong active:brightness-95 shadow-sm font-semibold',
    secondary:
      'bg-bg-sunken text-text-primary hover:bg-border-subtle/40 active:bg-border-subtle font-medium',
    outline:
      'border border-border-subtle/40 bg-bg-surface text-text-primary hover:bg-bg-sunken active:bg-border-subtle/30 shadow-sm font-medium',
    ghost:
      'text-text-primary hover:bg-bg-sunken active:bg-border-subtle/30 font-medium',
    danger:
      'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-sm font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
