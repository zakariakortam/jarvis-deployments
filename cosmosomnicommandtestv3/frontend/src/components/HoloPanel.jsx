import { motion } from 'framer-motion';

export default function HoloPanel({
  children,
  title,
  subtitle,
  className = '',
  headerActions,
  status,
  glow = false,
  animate = true,
  onClick
}) {
  const statusColors = {
    online: 'bg-holo-green',
    operational: 'bg-holo-green',
    warning: 'bg-holo-orange',
    caution: 'bg-holo-orange',
    alert: 'bg-holo-red',
    critical: 'bg-holo-red',
    offline: 'bg-gray-500',
    maintenance: 'bg-holo-purple'
  };

  const PanelContent = (
    <>
      {/* Corner decorations */}
      <div className="corner-decor corner-tl" />
      <div className="corner-decor corner-tr" />
      <div className="corner-decor corner-bl" />
      <div className="corner-decor corner-br" />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Header */}
      {(title || headerActions) && (
        <div className="flex items-center justify-between p-3 border-b border-panel-border">
          <div className="flex items-center gap-3">
            {status && (
              <div className={`status-indicator ${statusColors[status] || 'bg-gray-500'}`} />
            )}
            <div>
              {title && (
                <h3 className="font-display text-sm font-semibold text-holo-blue uppercase tracking-wider">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-holo-cyan/60 font-mono">{subtitle}</p>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </>
  );

  const baseClasses = `holo-panel relative ${glow ? 'shadow-holo' : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
      >
        {PanelContent}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {PanelContent}
    </div>
  );
}
