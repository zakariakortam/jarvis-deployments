import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, XCircle, Clock } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { formatDistanceToNow } from 'date-fns';

const AlertPanel = () => {
  const { getRecentAlerts } = useDashboardStore();
  const alerts = getRecentAlerts(10);

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-destructive bg-destructive/10';
      case 'warning':
        return 'border-l-4 border-warning bg-warning/10';
      default:
        return 'border-l-4 border-primary bg-primary/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
        <div className="flex items-center space-x-2">
          <span className="alert-badge bg-destructive text-destructive-foreground">
            {alerts.filter(a => a.severity === 'critical').length}
          </span>
          <span className="alert-badge bg-warning text-warning-foreground">
            {alerts.filter(a => a.severity === 'warning').length}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts at this time</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <motion.div
                key={`${alert.equipmentId}-${alert.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg ${getAlertClass(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{alert.equipmentId}</span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-background/50">
                        {alert.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-warning text-warning-foreground'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AlertPanel;
