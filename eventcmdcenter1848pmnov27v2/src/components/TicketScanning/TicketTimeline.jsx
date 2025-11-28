import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const TicketTimeline = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No recent ticket scans</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    return status === 'valid' ? (
      <CheckCircle className="w-5 h-5 text-success" />
    ) : (
      <XCircle className="w-5 h-5 text-danger" />
    );
  };

  const getStatusBadge = (status) => {
    return status === 'valid' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
        Valid
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger border border-danger/30">
        Invalid
      </span>
    );
  };

  const getTicketTypeColor = (type) => {
    const colors = {
      VIP: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      General: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'Early Bird': 'bg-green-500/20 text-green-500 border-green-500/30',
      Group: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      Student: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
      Staff: 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Recent Ticket Scans
        </h3>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      {/* Scan Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-effect p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Total Scans</p>
          <p className="text-2xl font-bold">{scans.length}</p>
        </div>
        <div className="glass-effect p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Valid</p>
          <p className="text-2xl font-bold text-success">
            {scans.filter(s => s.status === 'valid').length}
          </p>
        </div>
        <div className="glass-effect p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Invalid</p>
          <p className="text-2xl font-bold text-danger">
            {scans.filter(s => s.status === 'invalid').length}
          </p>
        </div>
        <div className="glass-effect p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-primary">
            {Math.round(
              (scans.filter(s => s.status === 'valid').length / scans.length) * 100
            )}
            %
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="glass-effect rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className={`border-b border-border last:border-b-0 p-4 hover:bg-accent/50 transition-colors ${
                  scan.status === 'invalid' ? 'bg-danger/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="mt-1">{getStatusIcon(scan.status)}</div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {scan.attendeeName}
                          </span>
                          {getStatusBadge(scan.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {scan.ticketId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {format(scan.timestamp, 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(scan.timestamp, {
                            addSuffix: true
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getTicketTypeColor(
                          scan.type
                        )}`}
                      >
                        {scan.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {scan.zone}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Ticket className="w-3 h-3" />
                        {scan.scannerDevice}
                      </span>
                    </div>

                    {scan.status === 'invalid' && (
                      <div className="mt-2 text-xs text-danger">
                        <span className="font-medium">Reason:</span> Ticket already
                        used or invalid
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Activity Indicator */}
      <div className="glass-effect p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
            </div>
            <span className="text-sm font-medium">Live Scanning Activity</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Real-time updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketTimeline;
