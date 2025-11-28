import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Camera, Users, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const SecurityTiles = ({ securityData }) => {
  if (!securityData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading security monitoring data...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      normal: 'text-success',
      warning: 'text-warning',
      critical: 'text-danger'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusBg = (status) => {
    const colors = {
      normal: 'bg-success/20 border-success/30',
      warning: 'bg-warning/20 border-warning/30',
      critical: 'bg-danger/20 border-danger/30'
    };
    return colors[status] || 'bg-muted/20 border-muted/30';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-500 border-red-500/30'
    };
    return colors[severity] || 'bg-muted/20 text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="glass-effect p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status Overview
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBg(
              securityData.overallStatus
            )}`}
          >
            <span className={getStatusColor(securityData.overallStatus)}>
              {securityData.overallStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Active Incidents</span>
            </div>
            <p className="text-3xl font-bold">
              {securityData.activeIncidents}
            </p>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Resolved Today</span>
            </div>
            <p className="text-3xl font-bold">
              {securityData.resolvedToday}
            </p>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">On Duty</span>
            </div>
            <p className="text-3xl font-bold">
              {securityData.securityPersonnel.onDuty}
            </p>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Cameras Online</span>
            </div>
            <p className="text-3xl font-bold">
              {securityData.cameras.operational}/{securityData.cameras.total}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Status */}
        <div className="glass-effect p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Zone Security Status</h3>
          <div className="space-y-3">
            {securityData.zones.map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-accent rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{zone.zone}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(
                      zone.status
                    )}`}
                  >
                    {zone.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last incident: {zone.lastIncident}</span>
                  <span>{zone.patrols} active patrol{zone.patrols !== 1 ? 's' : ''}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="glass-effect p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {securityData.recentIncidents.map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${
                  incident.status === 'active'
                    ? 'bg-danger/5 border-danger/20'
                    : 'bg-accent border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{incident.type}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {incident.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(incident.timestamp, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  {incident.status === 'active' ? (
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Assigned to: <span className="text-foreground">{incident.assignedTo}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        incident.status === 'active'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-success/20 text-success'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Personnel Status */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Security Personnel Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Duty</p>
                <p className="text-2xl font-bold text-success">
                  {securityData.securityPersonnel.onDuty}
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available</p>
                <p className="text-2xl font-bold text-primary">
                  {securityData.securityPersonnel.available}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Responding</p>
                <p className="text-2xl font-bold text-warning">
                  {securityData.securityPersonnel.responding}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Camera System Status */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Camera System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {securityData.cameras.total}
            </p>
            <p className="text-sm text-muted-foreground">Total Cameras</p>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <p className="text-4xl font-bold text-success mb-2">
              {securityData.cameras.operational}
            </p>
            <p className="text-sm text-muted-foreground">Operational</p>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <p className="text-4xl font-bold text-warning mb-2">
              {securityData.cameras.alerts}
            </p>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTiles;
