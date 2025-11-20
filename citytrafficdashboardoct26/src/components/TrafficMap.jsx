import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useTrafficStore from '../store/trafficStore';

// Component to update map view
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

// Get color based on congestion level
function getCongestionColor(level) {
  if (level < 0.3) return '#10b981'; // Green
  if (level < 0.6) return '#f59e0b'; // Yellow
  if (level < 0.8) return '#fb923c'; // Orange
  return '#ef4444'; // Red
}

export default function TrafficMap() {
  const sensors = useTrafficStore(state => state.sensors);
  const setSelectedSensor = useTrafficStore(state => state.setSelectedSensor);
  const darkMode = useTrafficStore(state => state.darkMode);
  const mapRef = useRef(null);

  const center = [40.7128, -74.0060]; // New York City
  const zoom = 12;

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sensors.map((sensor) => (
          <CircleMarker
            key={sensor.id}
            center={[sensor.lat, sensor.lng]}
            radius={6 + sensor.vehicleCount / 10}
            fillColor={getCongestionColor(sensor.congestionLevel)}
            color="#fff"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => handleSensorClick(sensor)
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold mb-2">{sensor.name}</h3>
                <div className="space-y-1">
                  <p><strong>Road Type:</strong> {sensor.roadType}</p>
                  <p><strong>Direction:</strong> {sensor.direction}</p>
                  <p><strong>Speed:</strong> {Math.round(sensor.currentSpeed)} mph / {sensor.speedLimit} mph</p>
                  <p><strong>Vehicles:</strong> {sensor.vehicleCount}</p>
                  <p><strong>Congestion:</strong> {Math.round(sensor.congestionLevel * 100)}%</p>
                  <p><strong>Emissions:</strong> {Math.round(sensor.emissions)} units</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated: {new Date(sensor.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
