import { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { FlaskConical, Play, RotateCcw, Save, Sliders } from 'lucide-react';
import useStore from '../store/useStore';
import { Card, StatCard } from '../components/common';
import { ZONE_COLORS, TEMPERATURE_LIMITS } from '../utils/constants';
import { formatNumber } from '../utils/calculations';

export default function Simulator() {
  const { simulationParams, setSimulationParams, getFilteredData } = useStore();
  const actualData = getFilteredData();

  const [params, setParams] = useState({ ...simulationParams });
  const [isRunning, setIsRunning] = useState(false);

  const defaultProfile = {
    conveyorSpeed: 1.0,
    targetPeakTemp: 245,
    soakTime: 90,
    preheatRate: 2.0,
    coolingRate: 4.0,
    soakTemp: 180,
    preheatEndTemp: 150,
    timeAboveLiquidus: 45,
  };

  const generateSimulatedProfile = useCallback((p) => {
    const profile = [];
    const totalTime = 360; // 6 minutes in seconds
    const sampleRate = 1; // 1 second intervals

    // Calculate zone transit time based on conveyor speed
    const zoneLength = 0.5; // meters per zone
    const transitTime = (zoneLength * 10) / p.conveyorSpeed; // seconds per zone

    for (let t = 0; t < totalTime; t += sampleRate) {
      const point = {
        time: t,
        timeLabel: `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`,
      };

      // Determine phase based on time
      const preheatEnd = 60; // seconds
      const soakStart = preheatEnd;
      const soakEnd = soakStart + p.soakTime;
      const reflowStart = soakEnd;
      const reflowPeak = reflowStart + 30;
      const coolingStart = reflowPeak + p.timeAboveLiquidus;

      let temp;
      if (t < preheatEnd) {
        // Preheat phase - linear ramp
        temp = 25 + (p.preheatRate * t);
        point.phase = 'Preheat';
      } else if (t < soakEnd) {
        // Soak phase - gradual increase
        const soakProgress = (t - soakStart) / p.soakTime;
        temp = p.preheatEndTemp + (p.soakTemp - p.preheatEndTemp) * soakProgress;
        point.phase = 'Soak';
      } else if (t < reflowPeak) {
        // Reflow ramp up
        const reflowProgress = (t - reflowStart) / (reflowPeak - reflowStart);
        temp = p.soakTemp + (p.targetPeakTemp - p.soakTemp) * reflowProgress;
        point.phase = 'Reflow';
      } else if (t < coolingStart) {
        // Reflow peak hold
        const peakProgress = (t - reflowPeak) / (coolingStart - reflowPeak);
        temp = p.targetPeakTemp - (p.targetPeakTemp - 230) * peakProgress * 0.1;
        point.phase = 'Peak';
      } else {
        // Cooling phase
        const coolingProgress = (t - coolingStart) / (totalTime - coolingStart);
        temp = 230 - (p.coolingRate * (t - coolingStart) / 10);
        temp = Math.max(25, temp);
        point.phase = 'Cooling';
      }

      // Add some realistic variation
      const noise = (Math.random() - 0.5) * 2;
      point.temperature = temp + noise;

      // Simulate zone temperatures
      for (let z = 1; z <= 10; z++) {
        const zoneOffset = (z - 1) * 5; // Each zone adds ~5°C
        const zoneNoise = (Math.random() - 0.5) * 3;
        point[`zone${z}`] = Math.min(300, temp + zoneOffset + zoneNoise);
      }

      profile.push(point);
    }

    return profile;
  }, []);

  const simulatedData = useMemo(() => {
    return generateSimulatedProfile(params);
  }, [params, generateSimulatedProfile]);

  const profileMetrics = useMemo(() => {
    const peakTemp = Math.max(...simulatedData.map(d => d.temperature));
    const timeAbove217 = simulatedData.filter(d => d.temperature > 217).length;
    const preheatData = simulatedData.filter(d => d.phase === 'Preheat');
    const coolingData = simulatedData.filter(d => d.phase === 'Cooling');

    const preheatSlope = preheatData.length > 1
      ? (preheatData[preheatData.length - 1].temperature - preheatData[0].temperature) / preheatData.length
      : 0;

    const coolingSlope = coolingData.length > 1
      ? Math.abs(coolingData[0].temperature - coolingData[coolingData.length - 1].temperature) / coolingData.length
      : 0;

    return {
      peakTemp,
      timeAbove217,
      preheatSlope,
      coolingSlope,
      totalTime: simulatedData.length,
    };
  }, [simulatedData]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setSimulationParams(params);
      setIsRunning(false);
    }, 500);
  };

  const resetParams = () => {
    setParams(defaultProfile);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Time: {data.timeLabel} ({data.phase})
        </p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500">{entry.name}:</span>
              <span className="font-medium">{formatNumber(entry.value, 1)}°C</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Process Simulator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Experiment with reflow profile parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetParams} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="btn btn-primary"
          >
            {isRunning ? (
              <>
                <div className="spinner w-4 h-4 border-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parameter Controls */}
      <Card title="Simulation Parameters" subtitle="Adjust parameters to see real-time profile changes">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conveyor Speed (m/min)
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={params.conveyorSpeed}
              onChange={(e) => handleParamChange('conveyorSpeed', parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.conveyorSpeed.toFixed(1)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Peak Temperature (°C)
            </label>
            <input
              type="range"
              min="230"
              max="270"
              step="1"
              value={params.targetPeakTemp}
              onChange={(e) => handleParamChange('targetPeakTemp', parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.targetPeakTemp}°C
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Soak Time (s)
            </label>
            <input
              type="range"
              min="60"
              max="150"
              step="5"
              value={params.soakTime}
              onChange={(e) => handleParamChange('soakTime', parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.soakTime}s
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preheat Rate (°C/s)
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.25"
              value={params.preheatRate}
              onChange={(e) => handleParamChange('preheatRate', parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.preheatRate.toFixed(2)}°C/s
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cooling Rate (°C/s)
            </label>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={params.coolingRate}
              onChange={(e) => handleParamChange('coolingRate', parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.coolingRate.toFixed(1)}°C/s
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Above Liquidus (s)
            </label>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={params.timeAboveLiquidus}
              onChange={(e) => handleParamChange('timeAboveLiquidus', parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {params.timeAboveLiquidus}s
            </span>
          </div>
        </div>
      </Card>

      {/* Profile Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Peak Temperature"
          value={formatNumber(profileMetrics.peakTemp, 1)}
          unit="°C"
          changeType={profileMetrics.peakTemp >= 240 && profileMetrics.peakTemp <= 250 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Time Above 217°C"
          value={profileMetrics.timeAbove217}
          unit="s"
          changeType={profileMetrics.timeAbove217 >= 30 && profileMetrics.timeAbove217 <= 90 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Preheat Slope"
          value={formatNumber(profileMetrics.preheatSlope * 60, 1)}
          unit="°C/min"
          changeType={profileMetrics.preheatSlope * 60 <= 3 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Cooling Slope"
          value={formatNumber(profileMetrics.coolingSlope * 60, 1)}
          unit="°C/min"
          changeType={profileMetrics.coolingSlope * 60 <= 6 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Time"
          value={Math.floor(profileMetrics.totalTime / 60)}
          unit="min"
        />
      </div>

      {/* Simulated Profile Chart */}
      <Card title="Simulated Temperature Profile" subtitle="Predicted thermal profile based on parameters">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulatedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 11 }}
                interval={30}
                label={{ value: 'Time', position: 'bottom', offset: 0 }}
              />
              <YAxis
                domain={[0, 300]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}°C`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Reference areas for process phases */}
              <ReferenceArea
                y1={TEMPERATURE_LIMITS.IDEAL_PREHEAT.min}
                y2={TEMPERATURE_LIMITS.IDEAL_PREHEAT.max}
                fill="#3b82f6"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={TEMPERATURE_LIMITS.IDEAL_SOAK.min}
                y2={TEMPERATURE_LIMITS.IDEAL_SOAK.max}
                fill="#f59e0b"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={TEMPERATURE_LIMITS.IDEAL_PEAK.min}
                y2={TEMPERATURE_LIMITS.IDEAL_PEAK.max}
                fill="#ef4444"
                fillOpacity={0.1}
              />

              <ReferenceLine y={217} stroke="#ef4444" strokeDasharray="5 5" label="Liquidus (217°C)" />

              <Line
                type="monotone"
                dataKey="temperature"
                name="Profile"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />

              {[1, 5, 10].map((z) => (
                <Line
                  key={`zone${z}`}
                  type="monotone"
                  dataKey={`zone${z}`}
                  name={`Zone ${z}`}
                  stroke={ZONE_COLORS[z]}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  opacity={0.6}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Process Guidelines */}
      <Card title="Reflow Process Guidelines" subtitle="IPC-7530 recommended parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-700 dark:text-blue-400">Preheat</h4>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Rate: 1-3°C/s<br />
              Target: 150-200°C<br />
              Duration: 60-120s
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Thermal Soak</h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              Temp: 150-200°C<br />
              Duration: 60-120s<br />
              Rate: 0.5-1°C/s
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-700 dark:text-red-400">Reflow (Peak)</h4>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Peak: 230-250°C<br />
              Time above 217°C: 30-90s<br />
              Peak time: 10-30s
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-700 dark:text-green-400">Cooling</h4>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              Max rate: -6°C/s<br />
              Natural cooling preferred<br />
              Target: below 100°C
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
