// src/components/ui/LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray' | 'gradient';
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  overlay?: boolean;
  className?: string;
}

const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    </div>
  </div>
);

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text,
  variant = 'spinner',
  overlay = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
    gradient: 'border-transparent bg-gradient-to-tr from-blue-500 to-purple-500'
  };

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex space-x-2">
          <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`}></div>
          <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
          <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
        {text && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${
          color === 'gradient' 
            ? 'bg-gradient-to-tr from-blue-500 to-purple-500 border-transparent' 
            : colorClasses[color]
        }`}
      ></div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse font-medium">{text}</p>
      )}
    </div>
  );
}