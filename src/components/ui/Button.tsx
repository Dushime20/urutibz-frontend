import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  className, 
  children, 
  disabled,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-platform font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:transform active:scale-95';
  
  const variants = {
    primary: 'bg-active text-white hover:bg-active-dark focus-visible:ring-active shadow-platform hover:shadow-platform-lg',
    secondary: 'bg-platform-light-grey text-platform-dark-grey hover:bg-platform-grey focus-visible:ring-platform-grey shadow-platform hover:shadow-platform-lg',
    outline: 'border-2 border-active text-active hover:bg-active hover:text-white focus-visible:ring-active',
    ghost: 'text-active hover:bg-active hover:bg-opacity-10 focus-visible:ring-active',
    danger: 'bg-platform-error text-white hover:bg-error-600 focus-visible:ring-platform-error shadow-platform hover:shadow-platform-lg',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm py-2',
    md: 'h-10 px-4 text-sm py-3',
    lg: 'h-12 px-6 text-base py-4',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="loading-spinner mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;
