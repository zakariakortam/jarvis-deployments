import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, issuesAPI, maintenanceAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dateRange, setDateRange] = useState('30');

  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['dashboard-metrics', selectedDepartment, dateRange],
    () => dashboardAPI.getMetrics({ department: selectedDepartment, dateRange }),
    { 
      refetchInterval: 30000, // Refetch every 30 seconds
      select: data => data.data
    }
  );

  const { data: equipmentHealth } = useQuery(
    ['equipment-health', selectedDepartment],
    () => dashboardAPI.getEquipmentHealth({ department: selectedDepartment }),
    {
      refetchInterval: 60000,
      select: data => data.data
    }
  );

  const { data: alerts } = useQuery(
    ['alerts', selectedDepartment],
    () => dashboardAPI.getAlerts({ department: selectedDepartment }),
    {
      refetchInterval: 15000, // More frequent for alerts
      select: data => data.data
    }
  );

  const { data: criticalIssues } = useQuery(
    'critical-issues',
    () => issuesAPI.getCritical(),
    {
      refetchInterval: 30000,
      select: data => data.data
    }
  );

  const { data: overdueTasks } = useQuery(
    'overdue-tasks',
    () => maintenanceAPI.getOverdue(),
    {
      refetchInterval: 60000,
      select: data => data.data
    }
  );

  const statusColors = {
    operational: '#10b981',
    maintenance: '#f59e0b',
    down: '#ef4444',
    retired: '#6b7280'
  };

  const healthColors = {
    excellent: '#10b981',
    good: '#84cc16',
    fair: '#f59e0b',
    poor: '#ef4444'
  };

  const COLORS = ['#dc143c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (metricsLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manufacturing Dashboard</h1>
        <div className="dashboard-filters">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            <option value="Assembly">Assembly</option>
            <option value="Machining">Machining</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Packaging">Packaging</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="alerts-section">
          <h2>🚨 Critical Alerts</h2>
          <div className="alerts-grid">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className={`alert alert-${alert.type}`}>
                <div className="alert-content">
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Equipment Status</h3>
            <span className="metric-value">{metrics?.equipment?.total || 0}</span>
          </div>
          <div className="metric-chart">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={Object.entries(metrics?.equipment?.byStatus || {}).map(([status, count]) => ({
                    name: status,
                    value: count,
                    color: statusColors[status]
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                >
                  {Object.entries(metrics?.equipment?.byStatus || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry[0]]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Maintenance Tasks</h3>
            <div className="metric-badges">
              <span className="badge overdue">{metrics?.maintenance?.overdue || 0} Overdue</span>
              <span className="badge upcoming">{metrics?.maintenance?.upcoming || 0} Upcoming</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-stat">
              <span className="stat-label">Completed This Period</span>
              <span className="stat-value">{metrics?.maintenance?.completed || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Issues</h3>
            <div className="metric-badges">
              <span className="badge critical">{metrics?.issues?.critical || 0} Critical</span>
              <span className="badge open">{metrics?.issues?.open || 0} Open</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-stat">
              <span className="stat-label">Resolved This Period</span>
              <span className="stat-value">{metrics?.issues?.resolved || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Downtime</h3>
            <span className="metric-value">{metrics?.downtime?.totalHours || 0}h</span>
          </div>
          <div className="metric-content">
            <div className="metric-stat">
              <span className="stat-label">Total Minutes</span>
              <span className="stat-value">{metrics?.downtime?.totalMinutes || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Health Overview */}
      {equipmentHealth && (
        <div className="dashboard-section">
          <h2>Equipment Health</h2>
          <div className="equipment-health-grid">
            {equipmentHealth.slice(0, 6).map((equipment) => (
              <Link 
                key={equipment.id} 
                to={`/equipment/${equipment.id}`}
                className="equipment-card"
              >
                <div className="equipment-header">
                  <h4>{equipment.name}</h4>
                  <span className={`health-score ${equipment.healthCategory}`}>
                    {equipment.healthScore}%
                  </span>
                </div>
                <div className="equipment-details">
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className={`status-badge ${equipment.status}`}>
                      {equipment.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Location:</span>
                    <span>{equipment.location}</span>
                  </div>
                  {equipment.openIssuesCount > 0 && (
                    <div className="detail-row">
                      <span>Issues:</span>
                      <span className="issue-count">{equipment.openIssuesCount}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Critical Issues */}
      {criticalIssues && criticalIssues.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Critical Issues</h2>
            <Link to="/issues" className="view-all-link">View All</Link>
          </div>
          <div className="issues-list">
            {criticalIssues.slice(0, 5).map((issue) => (
              <Link key={issue.id} to={`/issues/${issue.id}`} className="issue-item">
                <div className="issue-header">
                  <span className={`severity-badge ${issue.severity}`}>
                    {issue.severity}
                  </span>
                  <span className="issue-title">{issue.title}</span>
                </div>
                <div className="issue-details">
                  <span>{issue.Equipment?.name}</span>
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Maintenance */}
      {overdueTasks && overdueTasks.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Overdue Maintenance</h2>
            <Link to="/maintenance" className="view-all-link">View All</Link>
          </div>
          <div className="tasks-list">
            {overdueTasks.slice(0, 5).map((task) => (
              <Link key={task.id} to={`/maintenance/${task.id}`} className="task-item">
                <div className="task-header">
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                  <span className="task-title">{task.title}</span>
                </div>
                <div className="task-details">
                  <span>{task.Equipment?.name}</span>
                  <span className="overdue-days">
                    {Math.floor((new Date() - new Date(task.scheduledDate)) / (1000 * 60 * 60 * 24))} days overdue
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/scan" className="action-button scan">
            📱 Scan QR Code
          </Link>
          <Link to="/issues?status=new" className="action-button report">
            ⚠️ Report Issue
          </Link>
          <Link to="/maintenance?status=pending" className="action-button maintenance">
            🔧 View Maintenance
          </Link>
          <Link to="/equipment" className="action-button equipment">
            ⚙️ Equipment List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;