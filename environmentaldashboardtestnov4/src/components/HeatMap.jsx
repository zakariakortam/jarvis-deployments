import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

const HeatMap = ({ data }) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [hoveredStation, setHoveredStation] = useState(null);

  // Generate interactive map layout with positioning
  const mapLayout = useMemo(() => {
    const positions = [
      // Top row
      { x: 15, y: 20 }, { x: 35, y: 15 }, { x: 55, y: 20 }, { x: 75, y: 18 },
      // Middle row
      { x: 20, y: 45 }, { x: 45, y: 50 }, { x: 70, y: 48 }, { x: 85, y: 45 },
      // Bottom row
      { x: 25, y: 75 }, { x: 50, y: 80 }, { x: 75, y: 78 }
    ];

    return data.slice(0, 11).map((station, index) => ({
      ...station,
      position: positions[index] || { x: 50, y: 50 },
    }));
  }, [data]);

  // Calculate color intensity based on risk level
  const getStationColor = (station) => {
    const type = station.type;

    if (type === 'air') {
      const co2 = station.readings.co2 || 0;
      if (co2 > 800) return { bg: 'bg-red-500', glow: 'shadow-red-500/50', text: 'text-red-500' };
      if (co2 > 600) return { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', text: 'text-yellow-500' };
      return { bg: 'bg-green-500', glow: 'shadow-green-500/50', text: 'text-green-500' };
    }

    if (type === 'water') {
      const ph = station.readings.ph || 7;
      if (ph < 6 || ph > 8) return { bg: 'bg-red-500', glow: 'shadow-red-500/50', text: 'text-red-500' };
      if (ph < 6.5 || ph > 7.5) return { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', text: 'text-yellow-500' };
      return { bg: 'bg-blue-500', glow: 'shadow-blue-500/50', text: 'text-blue-500' };
    }

    if (type === 'weather') {
      const temp = station.readings.temperature || 20;
      if (temp > 35 || temp < 5) return { bg: 'bg-red-500', glow: 'shadow-red-500/50', text: 'text-red-500' };
      if (temp > 30 || temp < 10) return { bg: 'bg-orange-500', glow: 'shadow-orange-500/50', text: 'text-orange-500' };
      return { bg: 'bg-cyan-500', glow: 'shadow-cyan-500/50', text: 'text-cyan-500' };
    }

    // Energy
    const efficiency = station.readings.efficiency || 50;
    if (efficiency < 30) return { bg: 'bg-red-500', glow: 'shadow-red-500/50', text: 'text-red-500' };
    if (efficiency < 60) return { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', text: 'text-yellow-500' };
    return { bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', text: 'text-emerald-500' };
  };

  const getStationIcon = (type) => {
    const icons = {
      air: '🌫️',
      water: '💧',
      weather: '⛅',
      energy: '⚡'
    };
    return icons[type] || '📍';
  };

  const getStationStatus = (station) => {
    const color = getStationColor(station);
    if (color.bg.includes('red')) return { icon: AlertTriangle, label: 'Critical', color: 'text-red-500' };
    if (color.bg.includes('yellow') || color.bg.includes('orange')) return { icon: TrendingDown, label: 'Warning', color: 'text-yellow-500' };
    return { icon: TrendingUp, label: 'Normal', color: 'text-green-500' };
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Interactive Geographic Heatmap</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
            <span className="text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-background to-muted rounded-2xl p-4 border border-border min-h-[500px] overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {mapLayout.map((station, i) => (
              mapLayout.slice(i + 1).map((otherStation, j) => {
                const distance = Math.sqrt(
                  Math.pow(station.position.x - otherStation.position.x, 2) +
                  Math.pow(station.position.y - otherStation.position.y, 2)
                );
                if (distance < 40) {
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={`${station.position.x}%`}
                      y1={`${station.position.y}%`}
                      x2={`${otherStation.position.x}%`}
                      y2={`${otherStation.position.y}%`}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                }
                return null;
              })
            ))}
          </svg>

          {/* Station Markers */}
          {mapLayout.map((station, index) => {
            const color = getStationColor(station);
            const isHovered = hoveredStation?.id === station.id;
            const isSelected = selectedStation?.id === station.id;

            return (
              <motion.div
                key={station.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${station.position.x}%`,
                  top: `${station.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1.3 : isHovered ? 1.2 : 1,
                  opacity: 1
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300
                }}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
                onClick={() => setSelectedStation(station)}
              >
                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 rounded-full ${color.bg} blur-xl`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Station Marker */}
                <div className={`relative w-12 h-12 rounded-full ${color.bg} shadow-2xl ${color.glow} flex items-center justify-center text-2xl border-4 border-background`}>
                  {getStationIcon(station.type)}
                </div>

                {/* Station Label */}
                <motion.div
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isHovered || isSelected ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-card border border-border rounded-full px-3 py-1 shadow-lg">
                    <p className="text-xs font-medium text-foreground">{station.name}</p>
                  </div>
                </motion.div>

                {/* Pulse Ring */}
                {(isHovered || isSelected) && (
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 ${color.text}`}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Station Details Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedStation ? (
              <motion.div
                key={selectedStation.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-card to-muted rounded-2xl p-5 border border-border shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${getStationColor(selectedStation).bg} flex items-center justify-center text-xl shadow-lg`}>
                      {getStationIcon(selectedStation.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedStation.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{selectedStation.type} Station</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-background"
                  >
                    ✕
                  </button>
                </div>

                {/* Status Badge */}
                {(() => {
                  const status = getStationStatus(selectedStation);
                  const StatusIcon = status.icon;
                  return (
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full bg-background border border-border mb-4`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  );
                })()}

                {/* Readings */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Readings</h5>
                  {Object.entries(selectedStation.readings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-background rounded-xl p-3">
                      <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        {key === 'temperature' && '°C'}
                        {key === 'humidity' && '%'}
                        {key === 'co2' && ' ppm'}
                        {key === 'ph' && ' pH'}
                        {key === 'efficiency' && '%'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Location Info */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Station ID: {selectedStation.id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <Info className="w-3 h-3" />
                    <span>Last updated: Just now</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl p-8 border border-border shadow-lg text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Select a Station</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any station marker on the map to view detailed information
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-lg">
            <h5 className="text-sm font-semibold text-foreground mb-3">Map Statistics</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Stations</span>
                <span className="font-medium text-foreground">{mapLayout.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Critical Alerts</span>
                <span className="font-medium text-red-500">
                  {mapLayout.filter(s => getStationColor(s).bg.includes('red')).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Warnings</span>
                <span className="font-medium text-yellow-500">
                  {mapLayout.filter(s => getStationColor(s).bg.includes('yellow')).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Normal Operation</span>
                <span className="font-medium text-green-500">
                  {mapLayout.filter(s => !getStationColor(s).bg.includes('red') && !getStationColor(s).bg.includes('yellow')).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
