import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import useTrafficStore from '../store/trafficStore';
import { format } from 'date-fns';

function getAlertIcon(type) {
  switch (type) {
    case 'severe-congestion':
    case 'traffic-jam':
      return AlertTriangle;
    case 'high-emissions':
      return AlertCircle;
    default:
      return Info;
  }
}

function getAlertColor(severity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 border-red-600 text-white';
    case 'warning':
      return 'bg-yellow-500 border-yellow-600 text-white';
    default:
      return 'bg-blue-500 border-blue-600 text-white';
  }
}

export default function AlertPanel() {
  const alerts = useTrafficStore(state => state.alerts);
  const dismissAlert = useTrafficStore(state => state.dismissAlert);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] space-y-2">
      <AnimatePresence mode="popLayout">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.severity);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`${colorClass} rounded-lg shadow-2xl border-2 p-4 backdrop-blur-sm`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm capitalize">
                      {alert.type.replace(/-/g, ' ')}
                    </h4>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="hover:bg-white/20 rounded p-1 transition-colors"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>{alert.location}</span>
                    <span>{format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {alerts.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted text-muted-foreground rounded-lg p-3 text-center text-sm"
        >
          +{alerts.length - 5} more alerts
        </motion.div>
      )}
    </div>
  );
}
