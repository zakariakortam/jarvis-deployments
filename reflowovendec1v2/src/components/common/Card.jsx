import clsx from 'clsx';

export default function Card({ title, subtitle, children, className, headerAction, noPadding }) {
  return (
    <div className={clsx('card', className)}>
      {(title || headerAction) && (
        <div className="card-header flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'card-body')}>{children}</div>
    </div>
  );
}
