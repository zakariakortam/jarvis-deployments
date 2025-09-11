'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Activity, Zap, PlayCircle } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import ProcessParametersGrid from '@/components/dashboard/ProcessParametersGrid';
import SetpointComparison from '@/components/dashboard/SetpointComparison';
import EfficiencyChart from '@/components/charts/EfficiencyChart';
import AlertPanel from '@/components/alerts/AlertPanel';

export default function Dashboard() {
  const {
    dashboardData,
    selectedPlant,
    selectedUnit,
    alerts,
    isLoading,
    error,
    setDashboardData,
    setSelectedPlant,
    setSelectedUnit,
    setLoading,
    setError,
    addAlert
  } = useAppStore();

  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  useEffect(() => {
    // Initialize WebSocket connection
    wsClient.connect();
    
    // Subscribe to real-time updates
    wsClient.subscribe('data_update', (message) => {
      if (message.payload.type === 'process_data') {
        setDashboardData(message.payload.data);
      }
    });

    wsClient.subscribe('alert', (message) => {
      addAlert(message.payload);
    });

    // Load initial data
    loadDashboardData();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock dashboard data for demonstration
      const mockData = {
        plants: [
          {
            id: 'DET',
            name: 'Detroit Plant',
            location: 'Detroit, MI',
            status: 'online' as const,
            units: [
              {
                id: 'UNIT_1',
                name: 'Thinning Unit 1',
                plant_id: 'DET',
                status: 'running' as const,
                current_setpoints: {
                  acid_flow_rate: 2.2,
                  temperature: 88.0,
                  ph: 6.1,
                  mixing_power: 45.0
                },
                optimal_setpoints: {
                  acid_flow_rate: 2.5,
                  temperature: 90.0,
                  ph: 6.0,
                  mixing_power: 50.0
                }
              }
            ]
          },
          {
            id: 'HOU',
            name: 'Houston Plant',
            location: 'Houston, TX',
            status: 'online' as const,
            units: [
              {
                id: 'UNIT_1',
                name: 'Thinning Unit 1',
                plant_id: 'HOU',
                status: 'running' as const,
                current_setpoints: {
                  acid_flow_rate: 2.1,
                  temperature: 87.5,
                  ph: 6.2,
                  mixing_power: 42.0
                },
                optimal_setpoints: {
                  acid_flow_rate: 2.3,
                  temperature: 89.0,
                  ph: 6.0,
                  mixing_power: 48.0
                }
              }
            ]
          }
        ],
        kpis: [
          {
            id: 'efficiency',
            name: 'Process Efficiency',
            value: 87.3,
            unit: '%',
            change: 2.1,
            changePercent: 2.5,
            status: 'good' as const,
            trend: 'up' as const
          },
          {
            id: 'cost_savings',
            name: 'Cost Savings',
            value: 1247.50,
            unit: '$/day',
            change: 125.30,
            changePercent: 11.2,
            status: 'good' as const,
            trend: 'up' as const
          },
          {
            id: 'acid_consumption',
            name: 'Acid Consumption',
            value: 2.35,
            unit: 'L/min',
            change: -0.15,
            changePercent: -6.0,
            status: 'good' as const,
            trend: 'down' as const
          },
          {
            id: 'temperature',
            name: 'Average Temp',
            value: 88.5,
            unit: '°C',
            change: 1.2,
            changePercent: 1.4,
            status: 'warning' as const,
            trend: 'up' as const
          }
        ],
        activeAlerts: 2,
        optimizationStatus: 'idle' as const,
        lastUpdate: new Date().toISOString()
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantChange = (plantId: string) => {
    setSelectedPlant(plantId);
    setSelectedUnit(null);
    loadDashboardData();
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId);
  };

  const triggerOptimization = async () => {
    try {
      setOptimizationStatus('running');
      
      // Mock optimization trigger
      setTimeout(() => {
        setOptimizationStatus('completed');
      }, 5000);

      // In real implementation:
      // await api.triggerOptimization(config_id);
      
    } catch (err) {
      console.error('Failed to trigger optimization:', err);
      setOptimizationStatus('idle');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and optimization for corn dry thinning processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={triggerOptimization}
            disabled={optimizationStatus === 'running'}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {optimizationStatus === 'running' ? 'Optimizing...' : 'Run Optimization'}
          </Button>
          
          <Select value={selectedPlant || ''} onValueChange={handlePlantChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Plants</SelectItem>
              {dashboardData?.plants.map((plant) => (
                <SelectItem key={plant.id} value={plant.id}>
                  {plant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedPlant && (
            <Select value={selectedUnit || ''} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Units</SelectItem>
                {dashboardData?.plants
                  .find(p => p.id === selectedPlant)
                  ?.units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Optimization Status */}
      {optimizationStatus !== 'idle' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {optimizationStatus === 'running' && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                )}
                {optimizationStatus === 'completed' && (
                  <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {optimizationStatus === 'running' && 'Optimization in progress...'}
                  {optimizationStatus === 'completed' && 'Optimization completed'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {optimizationStatus === 'running' && 'Analyzing process parameters and generating recommendations'}
                  {optimizationStatus === 'completed' && 'New setpoint recommendations are available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData?.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Content */}
        <div className="col-span-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="setpoints">Setpoints</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <EfficiencyChart />
            </TabsContent>
            
            <TabsContent value="parameters" className="space-y-4">
              <ProcessParametersGrid />
            </TabsContent>
            
            <TabsContent value="setpoints" className="space-y-4">
              <SetpointComparison />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="col-span-3">
          <AlertPanel 
            alerts={[
              {
                id: '1',
                type: 'warning',
                title: 'High Temperature',
                message: 'Temperature in Unit 1 approaching upper limit',
                plant_id: 'DET',
                unit_id: 'UNIT_1',
                parameter: 'temperature',
                value: 95.2,
                threshold: 95.0,
                status: 'active',
                created_at: new Date().toISOString()
              },
              {
                id: '2',
                type: 'info',
                title: 'Optimization Complete',
                message: 'New setpoint recommendations available',
                plant_id: 'DET',
                unit_id: 'UNIT_1',
                status: 'active',
                created_at: new Date().toISOString()
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}