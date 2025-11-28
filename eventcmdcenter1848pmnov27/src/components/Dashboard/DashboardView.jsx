import React, { useState } from 'react';
import { Card } from '../common/Card';
import { OccupancyChart } from '../Occupancy/OccupancyChart';
import { LeasingTimeline } from '../Occupancy/LeasingTimeline';
import { SpaceUtilizationHeatmap } from '../SpaceUtilization/Heatmap';
import { EnergyDashboard } from '../Energy/EnergyDashboard';
import { MaintenanceDashboard } from '../Maintenance/MaintenanceDashboard';
import { TenantSatisfactionBoard } from '../TenantSatisfaction/SatisfactionBoard';
import { InvestmentAnalytics } from '../Investment/InvestmentAnalytics';
import { Activity, Zap, Wrench, Users, TrendingUp, Map } from 'lucide-react';

export const DashboardView = ({ building }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'occupancy', label: 'Occupancy', icon: Map },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'satisfaction', label: 'Tenant Satisfaction', icon: Users },
    { id: 'investment', label: 'Investment', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupancyChart buildingId={building.id} />
            <LeasingTimeline buildingId={building.id} />
          </div>
          <SpaceUtilizationHeatmap buildingId={building.id} />
        </div>
      )}

      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          <OccupancyChart buildingId={building.id} />
          <LeasingTimeline buildingId={building.id} />
          <SpaceUtilizationHeatmap buildingId={building.id} />
        </div>
      )}

      {activeTab === 'energy' && (
        <EnergyDashboard buildingId={building.id} />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceDashboard buildingId={building.id} />
      )}

      {activeTab === 'satisfaction' && (
        <TenantSatisfactionBoard buildingId={building.id} />
      )}

      {activeTab === 'investment' && (
        <InvestmentAnalytics buildingId={building.id} />
      )}
    </div>
  );
};
