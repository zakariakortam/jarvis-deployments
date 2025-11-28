import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Ticket, DollarSign, Shield, UserCheck, Activity,
  BarChart3, AlertCircle, TrendingUp, Clock
} from 'lucide-react';
import AttendeeFlowMap from '../AttendeeFlow/AttendeeFlowMap';
import TicketTimeline from '../TicketScanning/TicketTimeline';
import VendorDashboard from '../VendorSales/VendorDashboard';
import SecurityTiles from '../SecurityMonitoring/SecurityTiles';
import StaffBoard from '../StaffAllocation/StaffBoard';
import HeatmapVis from '../CrowdDensity/HeatmapVis';
import useEventStore from '../../store/eventStore';

const MainDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const {
    attendeeFlow,
    ticketScans,
    vendorSales,
    security,
    staffAllocation,
    crowdDensity,
    stats
  } = useEventStore();

  const views = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'attendees', label: 'Attendee Flow', icon: Users },
    { id: 'tickets', label: 'Ticket Scanning', icon: Ticket },
    { id: 'vendors', label: 'Vendor Sales', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'crowd', label: 'Crowd Density', icon: Activity }
  ];

  const renderStatCard = (title, value, subValue, icon, trend, color = 'primary') => {
    const Icon = icon;
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect p-6 rounded-lg hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-${color}/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
    </motion.div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            {renderStatCard(
              'Total Attendance',
              stats.attendance.checkedIn.toLocaleString(),
              `${stats.attendance.percentage}% of expected`,
              Users,
              `${stats.attendance.rate}/min`,
              'primary'
            )}
            {renderStatCard(
              'Total Revenue',
              `$${stats.revenue.total}`,
              'All sources',
              DollarSign,
              '+12%',
              'success'
            )}
            {renderStatCard(
              'Active Incidents',
              security?.activeIncidents || 0,
              `${security?.resolvedToday || 0} resolved today`,
              AlertCircle,
              null,
              security?.activeIncidents > 2 ? 'warning' : 'success'
            )}
            {renderStatCard(
              'Staff Active',
              staffAllocation?.active || 0,
              `${staffAllocation?.onBreak || 0} on break`,
              UserCheck,
              null,
              'purple-500'
            )}
          </>
        )}
      </div>

      {/* Quick View Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendee Flow Summary */}
        <div className="glass-effect p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendee Flow
            </h3>
            <button
              onClick={() => setActiveView('attendees')}
              className="text-sm text-primary hover:underline"
            >
              View Details →
            </button>
          </div>
          {attendeeFlow.length > 0 && (
            <div className="space-y-3">
              {attendeeFlow.slice(0, 4).map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between p-3 bg-accent rounded">
                  <span className="text-sm font-medium">{zone.zone}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${zone.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {zone.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Ticket Scans */}
        <div className="glass-effect p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Recent Scans
            </h3>
            <button
              onClick={() => setActiveView('tickets')}
              className="text-sm text-primary hover:underline"
            >
              View All →
            </button>
          </div>
          {ticketScans.length > 0 && (
            <div className="space-y-2">
              {ticketScans.slice(0, 5).map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-2 bg-accent rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        scan.status === 'valid' ? 'bg-success' : 'bg-danger'
                      }`}
                    />
                    <span>{scan.attendeeName}</span>
                  </div>
                  <span className="text-muted-foreground">{scan.zone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vendor Performance & Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="glass-effect p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Top Vendors
            </h3>
            <button
              onClick={() => setActiveView('vendors')}
              className="text-sm text-primary hover:underline"
            >
              View All →
            </button>
          </div>
          {vendorSales.length > 0 && (
            <div className="space-y-3">
              {vendorSales
                .sort((a, b) => b.totalSales - a.totalSales)
                .slice(0, 5)
                .map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 bg-accent rounded"
                  >
                    <span className="text-sm font-medium">{vendor.name}</span>
                    <span className="text-sm font-bold text-success">
                      ${vendor.totalSales.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Security Status */}
        <div className="glass-effect p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </h3>
            <button
              onClick={() => setActiveView('security')}
              className="text-sm text-primary hover:underline"
            >
              View Details →
            </button>
          </div>
          {security && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-accent rounded text-center">
                  <p className="text-2xl font-bold text-warning">
                    {security.activeIncidents}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="p-3 bg-accent rounded text-center">
                  <p className="text-2xl font-bold text-success">
                    {security.resolvedToday}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
              <div
                className={`p-3 rounded text-center font-medium border ${
                  security.overallStatus === 'normal'
                    ? 'bg-success/10 text-success border-success/30'
                    : security.overallStatus === 'warning'
                    ? 'bg-warning/10 text-warning border-warning/30'
                    : 'bg-danger/10 text-danger border-danger/30'
                }`}
              >
                Overall Status: {security.overallStatus.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'attendees':
        return <AttendeeFlowMap flowData={attendeeFlow} />;
      case 'tickets':
        return <TicketTimeline scans={ticketScans} />;
      case 'vendors':
        return <VendorDashboard vendorSales={vendorSales} />;
      case 'security':
        return <SecurityTiles securityData={security} />;
      case 'staff':
        return <StaffBoard staffData={staffAllocation} />;
      case 'crowd':
        return <HeatmapVis densityData={crowdDensity} />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* View Navigation */}
      <div className="glass-effect rounded-lg overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors relative ${
                  activeView === view.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{view.label}</span>
                {activeView === view.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Live Update Indicator */}
      <div className="fixed bottom-6 right-6 glass-effect px-4 py-2 rounded-full shadow-lg">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </div>
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
