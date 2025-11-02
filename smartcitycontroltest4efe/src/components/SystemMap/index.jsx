import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap } from 'react-leaflet';
import { useCityStore } from '../../store/cityStore';
import { motion } from 'framer-motion';
import { getGradientColor } from '../../utils/helpers';
import 'leaflet/dist/leaflet.css';

const HeatmapLayer = ({ data, system }) => {
  const map = useMap();

  useEffect(() => {
    if (data && data.length > 0) {
      const bounds = data.map(point => [point.lat, point.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return (
    <>
      {data.map((point, index) => {
        const color = point.alert ? '#ef4444' : getGradientColor(point.intensity);

        return (
          <CircleMarker
            key={`${system}-${point.sensorId}-${index}`}
            center={[point.lat, point.lng]}
            radius={point.alert ? 8 : 6}
            pathOptions={{
              fillColor: color,
              fillOpacity: point.alert ? 0.9 : 0.6,
              color: point.alert ? '#dc2626' : color,
              weight: point.alert ? 2 : 1
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{point.sensorId}</p>
                <p className="text-gray-600">Type: {point.type}</p>
                <p className="text-gray-600">Value: {point.intensity.toFixed(2)}</p>
                {point.alert && (
                  <p className="text-red-600 font-semibold mt-1">⚠️ Alert Active</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

const SystemMap = () => {
  const { heatmapData, activeLayers, toggleLayer, mapCenter, darkMode } = useCityStore();

  const systems = [
    { name: 'transportation', label: 'Transportation', color: '#3b82f6' },
    { name: 'power', label: 'Power Grid', color: '#10b981' },
    { name: 'waste', label: 'Waste Management', color: '#f59e0b' },
    { name: 'water', label: 'Water System', color: '#06b6d4' }
  ];

  const tileLayer = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          City Infrastructure Map
        </h2>
        <div className="flex flex-wrap gap-2">
          {systems.map(({ name, label, color }) => (
            <button
              key={name}
              onClick={() => toggleLayer(name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                activeLayers.includes(name)
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              style={{
                backgroundColor: activeLayers.includes(name) ? color : undefined
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[600px] relative">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileLayer}
          />

          {systems.map(({ name }) => (
            activeLayers.includes(name) && heatmapData[name] && (
              <HeatmapLayer
                key={name}
                data={heatmapData[name]}
                system={name}
              />
            )
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000]">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Intensity Scale
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Low (0-33)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Medium (34-66)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">High (67-100)</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="w-4 h-4 rounded-full bg-red-600 ring-2 ring-red-400"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Alert Active</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemMap;
