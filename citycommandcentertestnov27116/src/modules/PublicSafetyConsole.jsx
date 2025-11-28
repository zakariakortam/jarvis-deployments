import { AlertTriangle, Activity, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PublicSafetyConsole({ data }) {
  const { safety } = data;

  const highSeverity = safety.filter(e => e.severity === 'High').length;
  const activeEvents = safety.filter(e => e.status === 'Active' || e.status === 'Responding').length;
  const avgResponseTime = '4.2';
  const totalResources = safety.reduce((sum, e) => sum + e.resources.assigned, 0);

  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'bg-destructive text-destructive-foreground';
    if (severity === 'Medium') return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'text-destructive bg-destructive/10';
    if (status === 'Responding') return 'text-warning bg-warning/10';
    if (status === 'Under Control') return 'text-primary bg-primary/10';
    return 'text-success bg-success/10';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Severity</p>
              <p className="text-3xl font-bold text-foreground">{highSeverity}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-destructive mt-2">Critical incidents</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Events</p>
              <p className="text-3xl font-bold text-foreground">{activeEvents}</p>
            </div>
            <Activity className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">In progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resources</p>
              <p className="text-3xl font-bold text-foreground">{totalResources}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Units assigned</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-3xl font-bold text-foreground">{avgResponseTime}m</p>
            </div>
            <Clock className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">-8% from target</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Live Event Feed</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
          {safety.map(event => (
            <div key={event.id} className="p-4 bg-secondary rounded-lg border-l-4" style={{
              borderLeftColor: event.severity === 'High' ? '#ef4444' : event.severity === 'Medium' ? '#f59e0b' : '#10b981'
            }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground">{event.type}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm text-foreground">{event.location}</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="font-medium text-sm text-foreground">{event.resources.assigned} units</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">En Route</p>
                  <p className="font-medium text-sm text-foreground">{event.resources.enRoute} units</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">On Scene</p>
                  <p className="font-medium text-sm text-foreground">{event.resources.onScene} units</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Priority: <span className="font-medium text-foreground">P{event.priority}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Coordinates: {event.coordinates.lat.toFixed(4)}, {event.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Events by Severity</h3>
          <div className="space-y-3">
            {['High', 'Medium', 'Low'].map(severity => {
              const count = safety.filter(e => e.severity === severity).length;
              const percentage = (count / safety.length) * 100;
              return (
                <div key={severity}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{severity} Severity</span>
                    <span className="text-sm font-medium text-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        severity === 'High' ? 'bg-destructive' :
                        severity === 'Medium' ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Events by Status</h3>
          <div className="space-y-3">
            {['Active', 'Responding', 'Under Control', 'Resolved'].map(status => {
              const count = safety.filter(e => e.status === status).length;
              const percentage = (count / safety.length) * 100;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{status}</span>
                    <span className="text-sm font-medium text-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
