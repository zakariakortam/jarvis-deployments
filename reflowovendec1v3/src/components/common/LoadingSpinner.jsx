import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={clsx(
        'rounded-full border-primary-200 border-t-primary-600 animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
