import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Layers,
  ZoomIn,
  ZoomOut,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Target,
  Ship,
  Plane,
  Radio,
  Shield,
  MapPin,
  Eye,
  RotateCcw,
} from 'lucide-react';
import useStore from '../../stores/mainStore';
import { Panel, Badge, Select } from '../common';
import { COUNTRIES, CITIES } from '../../data/generators';

export default function GeospatialWarRoom() {
  const {
    threats,
    operations,
    cyberEvents,
    incidents,
    mapState,
    setMapCenter,
    setMapZoom,
    toggleMapOverlay,
    setMapTimeline,
    selectMapRegion,
    toggleMapHeatmap,
    selectEntity,
    setActiveModule,
  } = useStore();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const overlays = [
    { id: 'threats', label: 'Threats', icon: AlertTriangle, color: '#ff0040' },
    { id: 'operations', label: 'Operations', icon: Target, color: '#22c55e' },
    { id: 'cyber', label: 'Cyber Events', icon: Shield, color: '#00d4ff' },
    { id: 'infrastructure', label: 'Infrastructure', icon: MapPin, color: '#ff8800' },
    { id: 'shipping', label: 'Maritime', icon: Ship, color: '#6366f1' },
    { id: 'air', label: 'Air Traffic', icon: Plane, color: '#8b5cf6' },
    { id: 'sigint', label: 'SIGINT', icon: Radio, color: '#f59e0b' },
  ];

  const threatLevelColors = {
    critical: '#ff0040',
    high: '#ff4400',
    elevated: '#ff8800',
    guarded: '#ffcc00',
    low: '#00cc44',
  };

  // Group threats by country
  const threatsByCountry = useMemo(() => {
    const grouped = {};
    threats.forEach(t => {
      const code = t.origin?.code;
      if (code) {
        if (!grouped[code]) grouped[code] = [];
        grouped[code].push(t);
      }
    });
    return grouped;
  }, [threats]);

  // Map markers
  const markers = useMemo(() => {
    const m = [];

    if (mapState.activeOverlays.includes('threats')) {
      COUNTRIES.forEach(country => {
        const countryThreats = threatsByCountry[country.code] || [];
        if (countryThreats.length > 0) {
          const maxThreat = countryThreats.reduce((max, t) =>
            ['critical', 'high', 'elevated', 'guarded', 'low'].indexOf(t.threatLevel) <
            ['critical', 'high', 'elevated', 'guarded', 'low'].indexOf(max.threatLevel) ? t : max
          );
          m.push({
            id: `threat-${country.code}`,
            type: 'threat',
            coords: country.coords,
            country: country,
            count: countryThreats.length,
            threatLevel: maxThreat.threatLevel,
            data: countryThreats,
          });
        }
      });
    }

    if (mapState.activeOverlays.includes('operations')) {
      operations.filter(o => o.status === 'active').forEach(op => {
        if (op.targetRegion?.coords) {
          m.push({
            id: `op-${op.id}`,
            type: 'operation',
            coords: op.targetRegion.coords,
            data: op,
          });
        }
      });
    }

    if (mapState.activeOverlays.includes('cyber')) {
      cyberEvents.filter(c => c.status === 'active').forEach((event, i) => {
        const city = CITIES[i % CITIES.length];
        m.push({
          id: `cyber-${event.id}`,
          type: 'cyber',
          coords: city.coords,
          data: event,
        });
      });
    }

    return m;
  }, [mapState.activeOverlays, threats, operations, cyberEvents, threatsByCountry]);

  const handleMarkerClick = (marker) => {
    if (marker.type === 'threat' && marker.data.length > 0) {
      selectEntity(marker.data[0], 'threat');
      setActiveModule('threats');
    } else if (marker.type === 'operation') {
      selectEntity(marker.data, 'operation');
      setActiveModule('operations');
    } else if (marker.type === 'cyber') {
      selectEntity(marker.data, 'cyberEvent');
      setActiveModule('cyber');
    }
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setMapCenter(country.coords);
    setMapZoom(4);
  };

  // Simple map projection (Mercator-like)
  const projectCoords = (lat, lon) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="h-full flex">
      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Map Header */}
        <div className="p-4 bg-cmd-panel border-b border-cmd-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-agency-foreign/20">
              <Globe size={24} className="text-agency-foreign" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Global Geospatial Intelligence War-Room</h1>
              <p className="text-sm text-gray-500">Multi-domain intelligence overlay system</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-cmd-dark rounded-lg p-1">
              <button
                onClick={() => setMapZoom(Math.max(1, mapState.zoom - 1))}
                className="p-1.5 hover:bg-cmd-border rounded transition-colors"
              >
                <ZoomOut size={16} className="text-gray-400" />
              </button>
              <span className="px-2 text-xs text-gray-400">{mapState.zoom}x</span>
              <button
                onClick={() => setMapZoom(Math.min(10, mapState.zoom + 1))}
                className="p-1.5 hover:bg-cmd-border rounded transition-colors"
              >
                <ZoomIn size={16} className="text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => { setMapCenter([20, 0]); setMapZoom(2); }}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-cmd-darker overflow-hidden">
          {/* World Map Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Crect fill='%23050508' width='1000' height='500'/%3E%3Cpath fill='%23111118' d='M100,200 Q200,150 300,200 T500,180 T700,220 T900,200 L900,350 L100,350 Z'/%3E%3Cpath fill='%23111118' d='M0,250 Q100,200 200,250 T400,230 T600,270 T800,240 L800,400 L0,400 Z'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
              opacity: 0.5,
            }}
          />

          {/* Grid Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '5% 10%',
            }}
          />

          {/* Markers */}
          {markers.map((marker) => {
            const pos = projectCoords(marker.coords[0], marker.coords[1]);
            const isHovered = hoveredMarker === marker.id;

            return (
              <motion.div
                key={marker.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ left: pos.x, top: pos.y }}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => handleMarkerClick(marker)}
              >
                {marker.type === 'threat' && (
                  <>
                    <div
                      className={`w-4 h-4 rounded-full ${marker.threatLevel === 'critical' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: threatLevelColors[marker.threatLevel] }}
                    />
                    {marker.count > 1 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] bg-white text-black rounded-full flex items-center justify-center font-bold">
                        {marker.count}
                      </span>
                    )}
                  </>
                )}
                {marker.type === 'operation' && (
                  <div className="w-3 h-3 rounded-full bg-status-active animate-pulse" />
                )}
                {marker.type === 'cyber' && (
                  <div className="w-3 h-3 rounded-full bg-agency-cyber" />
                )}

                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-cmd-panel border border-cmd-border rounded shadow-xl z-20"
                  >
                    {marker.type === 'threat' && (
                      <>
                        <p className="text-xs font-bold text-white">{marker.country.name}</p>
                        <p className="text-[10px] text-gray-500">{marker.count} active threats</p>
                        <Badge variant={marker.threatLevel} className="mt-1">
                          {marker.threatLevel}
                        </Badge>
                      </>
                    )}
                    {marker.type === 'operation' && (
                      <>
                        <p className="text-xs font-bold text-cmd-accent">{marker.data.codeName}</p>
                        <p className="text-[10px] text-gray-500">{marker.data.type}</p>
                      </>
                    )}
                    {marker.type === 'cyber' && (
                      <>
                        <p className="text-xs font-bold text-agency-cyber">{marker.data.type}</p>
                        <p className="text-[10px] text-gray-500">{marker.data.target}</p>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Timeline Slider */}
          <div className="absolute bottom-4 left-4 right-4 bg-cmd-panel/90 backdrop-blur-sm rounded-lg border border-cmd-border p-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-cmd-dark rounded hover:bg-cmd-border transition-colors"
              >
                {isPlaying ? <Pause size={14} className="text-gray-400" /> : <Play size={14} className="text-gray-400" />}
              </button>
              <Clock size={14} className="text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={mapState.timelinePosition}
                onChange={(e) => setMapTimeline(parseInt(e.target.value))}
                className="flex-1 h-1 bg-cmd-border rounded-full appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-20">
                {mapState.timelinePosition === 100 ? 'NOW' : `-${100 - mapState.timelinePosition}h`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-cmd-panel border-l border-cmd-border flex flex-col">
        {/* Overlay Controls */}
        <div className="p-4 border-b border-cmd-border">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-cmd-accent" />
            <span className="text-sm font-semibold text-white">Map Overlays</span>
          </div>
          <div className="space-y-2">
            {overlays.map((overlay) => {
              const Icon = overlay.icon;
              const isActive = mapState.activeOverlays.includes(overlay.id);
              return (
                <button
                  key={overlay.id}
                  onClick={() => toggleMapOverlay(overlay.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-cmd-accent/20 border border-cmd-accent/50' : 'bg-cmd-dark hover:bg-cmd-border border border-transparent'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: overlay.color }} />
                  <Icon size={14} style={{ color: isActive ? overlay.color : '#666' }} />
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>{overlay.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Stats */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-cmd-accent" />
            <span className="text-sm font-semibold text-white">Regional Overview</span>
          </div>

          <div className="space-y-2">
            {COUNTRIES.filter(c => ['critical', 'high'].includes(c.threatLevel)).slice(0, 10).map((country) => {
              const countryThreats = threatsByCountry[country.code] || [];
              return (
                <div
                  key={country.code}
                  onClick={() => handleCountryClick(country)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCountry?.code === country.code ? 'bg-cmd-accent/20 border border-cmd-accent/50' : 'bg-cmd-dark hover:bg-cmd-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{country.name}</span>
                    <Badge variant={country.threatLevel}>{country.threatLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{country.region}</span>
                    <span>|</span>
                    <span>{countryThreats.length} threats</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Legend */}
        <div className="p-4 border-t border-cmd-border">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Threat Levels</p>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(threatLevelColors).map(([level, color]) => (
              <div key={level} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: color }} />
                <span className="text-[8px] text-gray-500 uppercase">{level.slice(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
