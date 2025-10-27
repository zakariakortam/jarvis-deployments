import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import useTrafficStore from '../../store/trafficStore'
import 'leaflet/dist/leaflet.css'
import './styles.css'

// Component to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

// Get marker color based on congestion level
const getMarkerColor = (congestion) => {
  if (congestion < 30) return '#10b981' // green
  if (congestion < 60) return '#f59e0b' // yellow
  return '#ef4444' // red
}

// Get marker size based on flow
const getMarkerSize = (flow) => {
  if (flow < 500) return 4
  if (flow < 1000) return 6
  if (flow < 1500) return 8
  return 10
}

const TrafficMap = () => {
  const { sensors, events, selectedZone, selectSensor, darkMode } = useTrafficStore()
  const [mapCenter] = useState([40.7128, -74.006])
  const [mapZoom] = useState(12)
  const [hoveredSensor, setHoveredSensor] = useState(null)

  const filteredSensors = selectedZone
    ? sensors.filter(s => s.zone === selectedZone)
    : sensors

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      {/* Map Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
      >
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
          Congestion Level
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-success-500"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Low (&lt; 30%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-warning-500"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Medium (30-60%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-danger-500"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">High (&gt; 60%)</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold mb-2 text-gray-900 dark:text-white">
            Active Sensors
          </h4>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {filteredSensors.length}
          </p>
        </div>
      </motion.div>

      {/* Event Count Badge */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-[1000] bg-danger-500 text-white rounded-lg shadow-lg px-4 py-2"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{events.length} Active Events</span>
          </div>
        </motion.div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />

        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Sensor Markers */}
        {filteredSensors.map(sensor => (
          <CircleMarker
            key={sensor.id}
            center={sensor.position}
            radius={getMarkerSize(sensor.flow)}
            pathOptions={{
              color: getMarkerColor(sensor.congestion),
              fillColor: getMarkerColor(sensor.congestion),
              fillOpacity: 0.7,
              weight: 2
            }}
            eventHandlers={{
              click: () => selectSensor(sensor.id),
              mouseover: () => setHoveredSensor(sensor),
              mouseout: () => setHoveredSensor(null)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-sm mb-2">{sensor.id}</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-semibold">{sensor.speed.toFixed(1)} mph</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Congestion:</span>
                    <span className="font-semibold">{sensor.congestion.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flow:</span>
                    <span className="font-semibold">{sensor.flow} veh/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emissions:</span>
                    <span className="font-semibold">{sensor.emissions.toFixed(0)} CO2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-semibold">{sensor.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Road Type:</span>
                    <span className="font-semibold capitalize">{sensor.roadType}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Event Markers */}
        {events.map(event => (
          <CircleMarker
            key={event.id}
            center={event.position}
            radius={12}
            pathOptions={{
              color: event.severity === 'critical' ? '#dc2626' : '#f59e0b',
              fillColor: event.severity === 'critical' ? '#dc2626' : '#f59e0b',
              fillOpacity: 0.5,
              weight: 3
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-sm mb-2 capitalize">{event.type}</h3>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700">{event.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Severity:</span>
                    <span className={`font-semibold capitalize ${
                      event.severity === 'critical' ? 'text-red-600' :
                      event.severity === 'high' ? 'text-orange-600' :
                      event.severity === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Affected:</span>
                    <span className="font-semibold">{event.affected} vehicles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-semibold">{event.zone}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredSensor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 pointer-events-none"
          >
            <div className="text-xs space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">{hoveredSensor.id}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Speed: <span className="font-semibold">{hoveredSensor.speed.toFixed(1)} mph</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Congestion: <span className="font-semibold">{hoveredSensor.congestion.toFixed(1)}%</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TrafficMap
