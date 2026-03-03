import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 active:transition-transform active:duration-100 hover:shadow-lg transform';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-300/50 focus-visible:outline-blue-600 active:bg-blue-800',
    secondary: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-300/50 focus-visible:outline-green-600 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-300/50 focus-visible:outline-red-600 active:bg-red-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 focus-visible:outline-blue-600 active:scale-95 transition-all duration-200',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin-slow border-2 border-current border-t-transparent rounded-full"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl animate-slide-up ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full animate-slide-up">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground transition-colors duration-200">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-0 dark:focus-visible:ring-blue-700 transition-all duration-200 ${
          error ? 'border-red-600 focus-visible:border-red-600 focus-visible:ring-red-300' : ''
        } hover:border-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1 animate-slide-up">{error}</p>}
    </div>
  );
}

interface TabsProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b-2 border-gray-200 dark:border-slate-700 animate-slide-up">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-3 font-medium transition-all duration-300 relative ${
              activeTab === tab.value
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-pressed={activeTab === tab.value}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg animate-slide-up" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  ...props
}: AlertProps) {
  const variantClasses = {
    info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
  };

  return (
    <div
      className={`border-l-4 p-4 rounded-r transition-all duration-300 animate-slide-up ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {title && <h3 className="font-semibold mb-1">{title}</h3>}
      {children}
    </div>
  );
}
