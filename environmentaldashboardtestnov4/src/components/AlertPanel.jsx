import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AlertPanel = ({ alerts, onDismiss, onClearAll }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shadow-md">
            <AlertCircle className="w-6 h-6 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">All Clear</h3>
          <p className="text-sm text-muted-foreground">No active alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
          <span className="px-3 py-1 text-xs font-medium bg-danger text-white rounded-full">
            {alerts.length}
          </span>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 border-b border-border last:border-b-0 ${
                alert.type === 'danger'
                  ? 'bg-danger/5'
                  : alert.type === 'warning'
                  ? 'bg-warning/5'
                  : 'bg-blue-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        alert.type === 'danger'
                          ? 'bg-danger text-white'
                          : alert.type === 'warning'
                          ? 'bg-warning text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {alert.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(alert.timestamp, 'MMM dd, HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{alert.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Station: {alert.stationName}</span>
                    <span>
                      Value: {alert.value} (Threshold: {alert.threshold})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="ml-4 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertPanel;
