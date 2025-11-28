import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

export default function AlertPanel({ alerts = [], onAcknowledge, onClearAll }) {
  const unacknowledged = alerts.filter((a) => !a.acknowledged)

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive',
      text: 'text-destructive',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning',
      text: 'text-warning',
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-primary/10',
      border: 'border-primary',
      text: 'text-primary',
    },
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          {unacknowledged.length > 0 && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
              {unacknowledged.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.info
              const Icon = config.icon

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border-b border-border ${config.bg} ${
                    alert.acknowledged ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold uppercase ${config.text}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(alert.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {alert.satelliteId}
                      </p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="mt-2 flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </button>
                      )}
                    </div>
                    {alert.acknowledged && (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-12 h-12 text-success mb-3" />
              <p className="text-sm text-muted-foreground">No active alerts</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Compact alert badge for header
export function AlertBadge({ count, onClick }) {
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <AlertCircle className="w-5 h-5 text-foreground" />
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    </button>
  )
}
