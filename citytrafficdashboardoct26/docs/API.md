# API Documentation

## Overview

This document describes the internal APIs and data structures used in the City Traffic Management Dashboard. While this is a client-side application without a traditional REST API, it provides comprehensive data simulation and state management interfaces.

## Data Structures

### Sensor Object

Represents a traffic sensor deployed in the city.

```typescript
interface Sensor {
  id: string;                    // Unique identifier (e.g., "sensor-1")
  position: [number, number];    // [latitude, longitude]
  type: 'speed' | 'congestion' | 'emissions' | 'flow';
  roadType: 'highway' | 'arterial' | 'collector' | 'local';
  zone: 'Northwest' | 'Northeast' | 'Southwest' | 'Southeast';
  active: boolean;               // Sensor operational status
  speed: number;                 // Average speed in MPH
  congestion: number;            // Congestion level (0-100)
  emissions: number;             // CO2 emissions level (0-200)
  flow: number;                  // Vehicles per hour
  lastUpdate: number;            // Unix timestamp
}
```

**Example:**
```json
{
  "id": "sensor-42",
  "position": [40.7589, -73.9851],
  "type": "congestion",
  "roadType": "highway",
  "zone": "Northeast",
  "active": true,
  "speed": 45.3,
  "congestion": 67.2,
  "emissions": 89.5,
  "flow": 1250,
  "lastUpdate": 1735689600000
}
```

### Event Object

Represents a traffic event or incident.

```typescript
interface Event {
  id: string;                    // Unique identifier
  type: 'accident' | 'congestion' | 'construction' | 'incident';
  position: [number, number];    // [latitude, longitude]
  zone: string;                  // City zone
  roadType: string;              // Type of road affected
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;           // Human-readable description
  timestamp: number;             // Unix timestamp of event start
  duration: number;              // Duration in milliseconds
  affected: number;              // Number of vehicles affected
}
```

**Example:**
```json
{
  "id": "event-1735689600000-abc123",
  "type": "accident",
  "position": [40.7489, -73.9751],
  "zone": "Northeast",
  "roadType": "arterial",
  "severity": "high",
  "description": "Multi-vehicle collision on arterial in Northeast zone",
  "timestamp": 1735689600000,
  "duration": 1200000,
  "affected": 347
}
```

### Metrics Object

Aggregated city-wide traffic metrics.

```typescript
interface Metrics {
  avgSpeed: string;              // Average speed (formatted)
  avgCongestion: string;         // Average congestion (formatted)
  avgEmissions: string;          // Average emissions (formatted)
  totalFlow: number;             // Total vehicle flow
  activeSensors: number;         // Number of active sensors
  zoneMetrics: {                 // Per-zone metrics
    [zone: string]: {
      count: number;
      speed: number;
      congestion: number;
      emissions: number;
      flow: number;
    }
  };
  timestamp: number;             // Unix timestamp
}
```

### Historical Data Point

Time-series data point for charting.

```typescript
interface HistoricalDataPoint {
  timestamp: number;             // Unix timestamp
  speed: number;                 // Average speed
  congestion: number;            // Average congestion
  emissions: number;             // Average emissions
  flow: number;                  // Total flow
}
```

## State Management API

The application uses Zustand for state management. All state is accessed through the `useTrafficStore` hook.

### Store Structure

```javascript
const store = {
  // State
  sensors: Sensor[],
  events: Event[],
  metrics: Metrics | null,
  historicalData: HistoricalDataPoint[],
  isSimulationRunning: boolean,
  selectedSensor: Sensor | null,
  selectedZone: string | null,
  timeOfDay: Date,
  darkMode: boolean,
  
  // Actions (documented below)
}
```

### Actions

#### `initializeSimulation()`

Initializes the traffic simulation with 300 sensors and starts collecting data.

**Usage:**
```javascript
const { initializeSimulation } = useTrafficStore()
initializeSimulation()
```

**Side Effects:**
- Generates 300 sensor objects
- Calculates initial metrics
- Creates first historical data point
- Sets simulation to running state

#### `updateSimulation()`

Updates all sensor data, generates events, and updates metrics. Called every 2 seconds during active simulation.

**Usage:**
```javascript
const { updateSimulation } = useTrafficStore()
updateSimulation()
```

**Side Effects:**
- Updates all sensor readings
- Generates/removes events based on probability
- Recalculates city-wide metrics
- Appends to historical data (max 50 points)
- Advances simulation time by 1 minute

#### `startSimulation()`

Starts or resumes the simulation.

**Usage:**
```javascript
const { startSimulation } = useTrafficStore()
startSimulation()
```

#### `pauseSimulation()`

Pauses the simulation without resetting data.

**Usage:**
```javascript
const { pauseSimulation } = useTrafficStore()
pauseSimulation()
```

#### `resetSimulation()`

Resets simulation to initial state with new sensor network.

**Usage:**
```javascript
const { resetSimulation } = useTrafficStore()
resetSimulation()
```

**Side Effects:**
- Generates new sensor network
- Clears all events
- Resets historical data
- Resets time to current
- Clears selections

#### `selectSensor(sensorId: string)`

Selects a specific sensor for detailed view.

**Parameters:**
- `sensorId` - Unique sensor identifier

**Usage:**
```javascript
const { selectSensor } = useTrafficStore()
selectSensor('sensor-42')
```

#### `deselectSensor()`

Clears sensor selection.

**Usage:**
```javascript
const { deselectSensor } = useTrafficStore()
deselectSensor()
```

#### `selectZone(zone: string)`

Filters data to show only one city zone.

**Parameters:**
- `zone` - Zone name ('Northwest', 'Northeast', 'Southwest', 'Southeast')

**Usage:**
```javascript
const { selectZone } = useTrafficStore()
selectZone('Northeast')
```

#### `deselectZone()`

Clears zone filter to show all zones.

**Usage:**
```javascript
const { deselectZone } = useTrafficStore()
deselectZone()
```

#### `toggleDarkMode()`

Toggles between light and dark theme.

**Usage:**
```javascript
const { toggleDarkMode } = useTrafficStore()
toggleDarkMode()
```

**Side Effects:**
- Updates dark mode state
- Toggles 'dark' class on document root
- Persists preference to localStorage

#### `setDarkMode(enabled: boolean)`

Sets dark mode to specific state.

**Parameters:**
- `enabled` - True for dark mode, false for light mode

**Usage:**
```javascript
const { setDarkMode } = useTrafficStore()
setDarkMode(true)
```

### Computed Getters

#### `getFilteredSensors(zone?: string)`

Returns sensors, optionally filtered by zone.

**Parameters:**
- `zone` - Optional zone name to filter by

**Returns:** `Sensor[]`

**Usage:**
```javascript
const { getFilteredSensors } = useTrafficStore()
const northeastSensors = getFilteredSensors('Northeast')
const allSensors = getFilteredSensors()
```

#### `getFilteredEvents(type?: string, severity?: string)`

Returns events filtered by type and/or severity.

**Parameters:**
- `type` - Optional event type filter
- `severity` - Optional severity filter

**Returns:** `Event[]`

**Usage:**
```javascript
const { getFilteredEvents } = useTrafficStore()
const accidents = getFilteredEvents('accident')
const criticalEvents = getFilteredEvents(null, 'critical')
const criticalAccidents = getFilteredEvents('accident', 'critical')
```

#### `getCongestionLevel()`

Returns overall congestion level category.

**Returns:** `'low' | 'medium' | 'high'`

**Usage:**
```javascript
const { getCongestionLevel } = useTrafficStore()
const level = getCongestionLevel() // 'medium'
```

**Logic:**
- < 30% = 'low'
- 30-60% = 'medium'
- > 60% = 'high'

#### `getZoneStats(zone: string)`

Returns metrics for a specific zone.

**Parameters:**
- `zone` - Zone name

**Returns:** `ZoneMetrics | null`

**Usage:**
```javascript
const { getZoneStats } = useTrafficStore()
const stats = getZoneStats('Northeast')
// { count: 75, speed: 42.3, congestion: 55.1, emissions: 78.9, flow: 12500 }
```

## Simulation Engine API

### `generateSensorNetwork(count: number)`

Generates a network of traffic sensors distributed across the city.

**Parameters:**
- `count` - Number of sensors to generate (default: 300)

**Returns:** `Sensor[]`

**Usage:**
```javascript
import { generateSensorNetwork } from './services/trafficSimulator'

const sensors = generateSensorNetwork(500)
```

### `updateSensorData(sensors: Sensor[], timeOfDay: Date)`

Updates sensor readings based on time of day and traffic patterns.

**Parameters:**
- `sensors` - Array of existing sensors to update
- `timeOfDay` - Current simulation time

**Returns:** `Sensor[]` - Updated sensors

**Usage:**
```javascript
import { updateSensorData } from './services/trafficSimulator'

const updatedSensors = updateSensorData(sensors, new Date())
```

**Logic:**
- Rush hour detection (7-9 AM, 5-7 PM)
- Congestion multiplier during rush hour
- Speed inversely proportional to congestion
- Emissions proportional to congestion
- Flow varies with time and congestion

### `generateEvents(sensors: Sensor[], existingEvents: Event[])`

Generates new traffic events and removes expired ones.

**Parameters:**
- `sensors` - Active sensor array
- `existingEvents` - Current events (default: [])

**Returns:** `Event[]` - Updated events array

**Usage:**
```javascript
import { generateEvents } from './services/trafficSimulator'

const events = generateEvents(sensors, existingEvents)
```

**Probabilities:**
- Accident: 5% per update
- Congestion: 5% per update
- Construction: Random
- Incident: Random

### `calculateMetrics(sensors: Sensor[])`

Calculates aggregate metrics from sensor data.

**Parameters:**
- `sensors` - Array of sensors

**Returns:** `Metrics` - Aggregated metrics

**Usage:**
```javascript
import { calculateMetrics } from './services/trafficSimulator'

const metrics = calculateMetrics(sensors)
```

### `createHistoricalDataPoint(metrics: Metrics, timestamp: number)`

Creates a data point for time-series charts.

**Parameters:**
- `metrics` - Current metrics object
- `timestamp` - Unix timestamp

**Returns:** `HistoricalDataPoint`

**Usage:**
```javascript
import { createHistoricalDataPoint } from './services/trafficSimulator'

const dataPoint = createHistoricalDataPoint(metrics, Date.now())
```

## Custom Hooks

### `useSimulation()`

Manages simulation lifecycle and updates.

**Usage:**
```javascript
import useSimulation from './hooks/useSimulation'

function App() {
  useSimulation() // Automatically starts and manages simulation
  return <Dashboard />
}
```

**Behavior:**
- Initializes simulation on mount
- Sets up 2-second update interval
- Cleans up interval on unmount
- Only runs when simulation is active

## Component Props

### Map Component

```typescript
interface MapProps {
  // No props - reads from store
}
```

### Gauges Component

```typescript
interface GaugesProps {
  // No props - reads from store
}
```

### Charts Component

```typescript
interface ChartsProps {
  // No props - reads from store
}
```

### EventTable Component

```typescript
interface EventTableProps {
  // No props - reads from store
}
```

## Constants

### City Bounds

```javascript
const CITY_BOUNDS = {
  lat: { min: 40.6, max: 40.85 },
  lng: { min: -74.1, max: -73.85 }
}
```

### Update Intervals

```javascript
const UPDATE_INTERVAL = 2000        // Sensor update interval (ms)
const MAX_HISTORY_POINTS = 50       // Historical data retention
```

### Event Configuration

```javascript
const EVENT_TYPES = ['accident', 'congestion', 'construction', 'incident']
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical']
const EVENT_DURATIONS = {
  accident: 20 * 60 * 1000,        // 20 minutes
  congestion: 15 * 60 * 1000,      // 15 minutes
  construction: 60 * 60 * 1000,    // 60 minutes
  incident: 10 * 60 * 1000         // 10 minutes
}
```

## Error Handling

All components implement error boundaries and loading states:

```javascript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
</ErrorBoundary>
```

## Performance Considerations

- **Memoization**: All expensive calculations use `useMemo`
- **Callbacks**: Event handlers use `useCallback`
- **Code Splitting**: Components lazy-loaded with `React.lazy()`
- **Virtual Scrolling**: Large tables use `react-window`
- **Debouncing**: Search and filter inputs debounced
- **Throttling**: Map updates throttled to 60fps

## Browser Storage

The application uses localStorage for:

```javascript
localStorage.setItem('traffic-dashboard-dark-mode', 'true')
localStorage.getItem('traffic-dashboard-dark-mode')
```

## Extending the API

To add new functionality:

1. **New Sensor Type:**
   - Add to `SENSOR_TYPES` constant
   - Update `generateSensorNetwork()`
   - Update UI components

2. **New Event Type:**
   - Add to `EVENT_TYPES` constant
   - Update `generateEvents()` probabilities
   - Update event descriptions

3. **New Metric:**
   - Update `calculateMetrics()`
   - Add to `Metrics` interface
   - Update visualization components

4. **New Store Action:**
   - Add action to Zustand store
   - Document in this file
   - Add tests

---

For more information, see [ARCHITECTURE.md](ARCHITECTURE.md) and [README.md](../README.md).
