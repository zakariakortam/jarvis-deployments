import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { dataSimulator } from '../../utils/mockData';

export default function GlobalOverview() {
  const navigate = useNavigate();
  const plants = useStore((state) => state.plants);
  const machines = useStore((state) => state.machines);
  const alerts = useStore((state) => state.alerts);
  const kpiData = useStore((state) => state.kpiData);
  const [liveData, setLiveData] = useState({});

  useEffect(() => {
    const unsubscribers = plants.map(plant => {
      return dataSimulator.subscribe(`plant-${plant.id}`, (data) => {
        setLiveData(prev => ({ ...prev, [plant.id]: data }));
      }, 2000);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [plants]);

  const getPlantStatus = (plantId) => {
    const plantMachines = machines.filter(m => m.plantId === plantId);
    const criticalCount = plantMachines.filter(m => m.status === 'critical').length;
    const warningCount = plantMachines.filter(m => m.status === 'warning').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 2) return 'warning';
    return 'operational';
  };

  const getPlantKPIs = (plantId) => {
    const plantMachines = machines.filter(m => m.plantId === plantId);
    const avgEfficiency = plantMachines.reduce((sum, m) => sum + m.efficiency, 0) / plantMachines.length;
    const operationalCount = plantMachines.filter(m => m.status === 'operational').length;

    return {
      efficiency: avgEfficiency,
      availability: (operationalCount / plantMachines.length) * 100,
      machineCount: plantMachines.length
    };
  };

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.acknowledged);
  const warningAlerts = alerts.filter(a => a.type === 'warning' && !a.acknowledged);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Operations Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring across all facilities</p>
        </div>

        <div className="flex gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{kpiData.overall.oee.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Overall OEE</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{machines.filter(m => m.status === 'operational').length}</p>
                <p className="text-xs text-muted-foreground">Active Machines</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-bold mb-4">Global Plant Map</h2>
          <div className="relative bg-secondary/20 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <svg className="w-full h-full" viewBox="0 -90 1000 600">
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              <rect width="1000" height="600" fill="url(#mapGradient)" />

              {plants.map((plant, idx) => {
                const x = ((plant.lng + 180) / 360) * 1000;
                const y = ((90 - plant.lat) / 180) * 600;
                const status = getPlantStatus(plant.id);
                const kpis = getPlantKPIs(plant.id);

                return (
                  <g key={plant.id}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="30"
                      className={`cursor-pointer ${
                        status === 'critical' ? 'fill-red-500/20' :
                        status === 'warning' ? 'fill-yellow-500/20' :
                        'fill-green-500/20'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => navigate(`/plant/${plant.id}`)}
                    />

                    <motion.circle
                      cx={x}
                      cy={y}
                      r="8"
                      className={`cursor-pointer ${
                        status === 'critical' ? 'fill-red-500' :
                        status === 'warning' ? 'fill-yellow-500' :
                        'fill-green-500'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        delay: idx * 0.1,
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      onClick={() => navigate(`/plant/${plant.id}`)}
                    />

                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                    >
                      <rect
                        x={x + 15}
                        y={y - 40}
                        width="140"
                        height="70"
                        rx="4"
                        className="fill-card stroke-border"
                        strokeWidth="1"
                      />

                      <text x={x + 25} y={y - 22} className="text-xs font-bold fill-foreground">
                        {plant.name.substring(0, 20)}
                      </text>

                      <text x={x + 25} y={y - 8} className="text-[10px] fill-muted-foreground">
                        Eff: {kpis.efficiency.toFixed(1)}% | Avail: {kpis.availability.toFixed(0)}%
                      </text>

                      <text x={x + 25} y={y + 6} className="text-[10px] fill-muted-foreground">
                        Machines: {kpis.machineCount}
                      </text>

                      <circle
                        cx={x + 145}
                        cy={y - 25}
                        r="4"
                        className={
                          status === 'critical' ? 'fill-red-500' :
                          status === 'warning' ? 'fill-yellow-500' :
                          'fill-green-500'
                        }
                      />
                    </motion.g>
                  </g>
                );
              })}

              {plants.map((plant, idx) => {
                if (idx < plants.length - 1) {
                  const x1 = ((plant.lng + 180) / 360) * 1000;
                  const y1 = ((90 - plant.lat) / 180) * 600;
                  const nextPlant = plants[idx + 1];
                  const x2 = ((nextPlant.lng + 180) / 360) * 1000;
                  const y2 = ((90 - nextPlant.lat) / 180) * 600;

                  return (
                    <motion.line
                      key={`line-${idx}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="stroke-primary/20"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Regional Performance</h3>
            <div className="space-y-4">
              {kpiData.byRegion.map((region, idx) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b pb-3 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{region.region}</span>
                    <span className="text-sm text-muted-foreground">{region.oee.toFixed(1)}% OEE</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${region.oee}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{region.throughput.toFixed(0)} units/day</span>
                    <span>{region.defectRate.toFixed(2)}% defects</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Active Alerts</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.slice(0, 10).map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                    {alert.type === 'warning' && <TrendingUp className="w-4 h-4 text-yellow-500 mt-0.5" />}
                    {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Availability', value: kpiData.overall.availability, unit: '%', trend: 'up' },
          { label: 'Performance', value: kpiData.overall.performance, unit: '%', trend: 'up' },
          { label: 'Quality', value: kpiData.overall.quality, unit: '%', trend: 'up' },
          { label: 'MTBF', value: kpiData.overall.mtbf, unit: 'hrs', trend: 'up' },
          { label: 'MTTR', value: kpiData.overall.mttr, unit: 'hrs', trend: 'down' },
          { label: 'Scrap Rate', value: kpiData.overall.scrapRate, unit: '%', trend: 'down' },
          { label: 'Energy Efficiency', value: kpiData.overall.energyEfficiency, unit: '%', trend: 'up' },
          { label: 'Cost per Unit', value: kpiData.overall.costPerUnit, unit: '$', trend: 'down' }
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold">
              {kpi.value.toFixed(kpi.unit === '$' ? 2 : 1)}{kpi.unit}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
