import { useSpcStore } from '../../store/spcStore'
import { useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function AlertsPage() {
  const { alerts, markAlertsAsRead, clearAlerts } = useSpcStore()

  useEffect(() => {
    markAlertsAsRead()
  }, [markAlertsAsRead])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage system alerts and notifications
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => confirm('Clear all alerts?') && clearAlerts()}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="stat-card">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'rounded-lg border p-4 transition-colors',
                  alert.type === 'critical' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20',
                  alert.type === 'warning' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20',
                  alert.type === 'success' && 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20',
                  alert.type === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                )}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <span className={clsx(
                        'alert-badge',
                        alert.type === 'critical' && 'alert-badge-critical',
                        alert.type === 'warning' && 'alert-badge-warning',
                        alert.type === 'success' && 'alert-badge-normal'
                      )}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                    {alert.data && (
                      <div className="mt-2 rounded-md bg-background/50 p-2 text-xs">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No alerts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                All systems are operating normally
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
