import { motion } from 'framer-motion';
import { Users, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const HeatmapVis = ({ densityData }) => {
  if (!densityData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading crowd density data...</p>
      </div>
    );
  }

  const gridSize = 8;
  const cellSize = 'min-w-[60px] min-h-[60px]';

  const getDensityLabel = (level) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    return labels[level] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Heatmap Header */}
      <div className="glass-effect p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Real-Time Crowd Density Heatmap
          </h3>
          <div className="text-sm text-muted-foreground">
            Updated: {format(densityData.timestamp, 'HH:mm:ss')}
          </div>
        </div>

        {/* Occupancy Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Occupancy</p>
            <p className="text-2xl font-bold">{densityData.totalOccupancy}</p>
          </div>
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Capacity</p>
            <p className="text-2xl font-bold">{densityData.capacity}</p>
          </div>
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Utilization</p>
            <p className="text-2xl font-bold text-primary">
              {Math.round((densityData.totalOccupancy / densityData.capacity) * 100)}%
            </p>
          </div>
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Hotspots</p>
            <p className="text-2xl font-bold text-warning">
              {densityData.hotspots.length}
            </p>
          </div>
        </div>

        {/* Density Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Density:</span>
          {[
            { level: 'low', color: '#10b981', label: 'Low (0-30%)' },
            { level: 'medium', color: '#f59e0b', label: 'Medium (30-60%)' },
            { level: 'high', color: '#f97316', label: 'High (60-85%)' },
            { level: 'critical', color: '#ef4444', label: 'Critical (85%+)' }
          ].map(({ level, color, label }) => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-border/50"
                style={{ backgroundColor: color + '40' }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-lg">
          <h4 className="text-md font-semibold mb-4">Venue Layout</h4>
          <div className="overflow-x-auto">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(60px, 1fr))` }}>
              {densityData.grid.map((cell, index) => (
                <motion.div
                  key={cell.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`${cellSize} relative group cursor-pointer rounded border transition-all hover:scale-105 hover:z-10`}
                  style={{
                    backgroundColor: cell.color + '40',
                    borderColor: cell.color + '60'
                  }}
                  title={`${cell.zone}\nDensity: ${cell.density}%\nCount: ${cell.count}`}
                >
                  {/* Cell Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color: cell.color }}>
                      {Math.round(cell.density)}%
                    </span>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                    <p className="text-xs font-semibold mb-1">{cell.zone}</p>
                    <p className="text-xs text-muted-foreground">
                      Density: {cell.density}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Count: {cell.count} people
                    </p>
                    <p className="text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: cell.color }}
                      />
                      {getDensityLabel(cell.level)}
                    </p>
                  </div>

                  {/* Critical Warning */}
                  {cell.level === 'critical' && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1 right-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-danger" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Grid Info */}
          <div className="mt-4 p-3 bg-accent rounded text-xs text-muted-foreground">
            Hover over cells for detailed information. Critical areas are highlighted with
            warning indicators.
          </div>
        </div>

        {/* Hotspots & Recommendations */}
        <div className="space-y-4">
          {/* Hotspots */}
          <div className="glass-effect p-6 rounded-lg">
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Active Hotspots
            </h4>
            <div className="space-y-3">
              {densityData.hotspots.length > 0 ? (
                densityData.hotspots.map((hotspot, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-warning/10 border border-warning/30 rounded-lg"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{hotspot.zone}</h5>
                        <p className="text-xs text-muted-foreground">
                          Density: {hotspot.density}%
                        </p>
                      </div>
                    </div>
                    <div className="pl-6">
                      <p className="text-xs text-warning font-medium">
                        {hotspot.recommendation}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No critical hotspots detected
                </div>
              )}
            </div>
          </div>

          {/* Density Distribution */}
          <div className="glass-effect p-6 rounded-lg">
            <h4 className="text-md font-semibold mb-4">Density Distribution</h4>
            <div className="space-y-3">
              {[
                { level: 'critical', label: 'Critical', color: '#ef4444' },
                { level: 'high', label: 'High', color: '#f97316' },
                { level: 'medium', label: 'Medium', color: '#f59e0b' },
                { level: 'low', label: 'Low', color: '#10b981' }
              ].map(({ level, label, color }) => {
                const count = densityData.grid.filter(
                  (cell) => cell.level === level
                ).length;
                const percentage = (count / densityData.grid.length) * 100;

                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} cells ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Status */}
          <div className="glass-effect p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                </div>
                <span className="text-sm font-medium">Live Updates</span>
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Crowd density is being monitored in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapVis;
