import React from 'react';
import { cn } from '../../lib/utils';

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-active focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
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

// Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        interactive ? 'card-interactive' : 'card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('card-header', className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('card-body', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('card-footer', className)} {...props}>
    {children}
  </div>
);

// Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={cn(
          'form-input',
          error && 'border-platform-error focus:ring-platform-error focus:border-platform-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-platform-grey">{helperText}</p>
      )}
    </div>
  );
};

// Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <select
        className={cn(
          'form-select',
          error && 'border-platform-error focus:ring-platform-error focus:border-platform-error',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

// Badge Component
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'grey';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    grey: 'badge-grey',
  };
  
  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// AI Badge Component
export interface AIBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn('ai-badge', className)}
      {...props}
    >
      🤖 {children}
    </span>
  );
};

// Verification Badge Component
export interface VerificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  verified?: boolean;
  children: React.ReactNode;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified = true,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'verification-badge',
        !verified && 'bg-warning-100 text-warning-700',
        className
      )}
      {...props}
    >
      {verified ? '✓' : '⚠'} {children}
    </span>
  );
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('loading-spinner', className)} {...props} />
);

// Trust Score Component
export interface TrustScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  maxScore?: number;
}

export const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  maxScore = 100,
  className,
  ...props
}) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className={cn('flex items-center space-x-2', className)} {...props}>
      <div className="trust-score">{score}%</div>
      <div className="flex-1 bg-platform-light-grey rounded-full h-2">
        <div
          className="bg-active h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Currency Selector Component
export interface CurrencySelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  currencies: Array<{ code: string; symbol: string; flag: string; }>;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  className,
  ...props
}) => {
  return (
    <select
      className={cn('currency-selector', className)}
      {...props}
    >
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.flag} {currency.code}
        </option>
      ))}
    </select>
  );
};

// Language Selector Component
export interface LanguageSelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  languages: Array<{ code: string; label: string; flag: string; }>;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  className,
  ...props
}) => {
  return (
    <select
      className={cn('language-selector', className)}
      {...props}
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.flag} {language.label}
        </option>
      ))}
    </select>
  );
};

// Product Card Component
export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;
  price: string;
  rating: number;
  location: string;
  aiRecommended?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  rating,
  location,
  aiRecommended = false,
  className,
  ...props
}) => {
  return (
    <div className={cn('product-card', className)} {...props}>
      <div className="relative">
        <img src={image} alt={title} className="product-image" />
        {aiRecommended && (
          <div className="absolute top-2 right-2">
            <AIBadge>AI Pick</AIBadge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="product-title">{title}</h3>
        <p className="text-sm text-platform-grey mb-2">{location}</p>
        <div className="flex items-center justify-between">
          <span className="product-price">{price}</span>
          <div className="product-rating">
            <span className="text-yellow-400">★</span>
            <span className="ml-1">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Card Component
export interface CategoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  count: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  count,
  className,
  ...props
}) => {
  return (
    <div className={cn('category-card', className)} {...props}>
      <div className="category-icon">{icon}</div>
      <h3 className="category-title">{title}</h3>
      <p className="category-count">{count.toLocaleString()} items</p>
    </div>
  );
};

export default {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Select,
  Badge,
  AIBadge,
  VerificationBadge,
  LoadingSpinner,
  TrustScore,
  CurrencySelector,
  LanguageSelector,
  ProductCard,
  CategoryCard,
};
