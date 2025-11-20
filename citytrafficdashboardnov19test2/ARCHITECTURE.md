# Architecture - City Traffic Dashboard

## System Overview

The City Traffic Dashboard is a single-page application (SPA) built with React that simulates and visualizes real-time city traffic data. The architecture is designed for performance, scalability, and maintainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │
│  │  │  Components  │  │  State Store │  │  Services │ │   │
│  │  │  (UI Layer)  │←→│   (Zustand)  │←→│(Simulation)│   │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Web Server                          │
│              (Static File Serving + Caching)                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. State Management (Zustand Store)

**Location**: `src/store/trafficStore.js`

**Purpose**: Centralized state management for all application data

**State Structure**:
```javascript
{
  sensors: [],              // 300 traffic sensors
  vehicles: [],             // 1000 tracked vehicles
  events: [],               // Traffic events (max 500)
  historicalData: {         // Time-series data (max 30 points)
    speed: [],
    congestion: [],
    emissions: [],
    timestamps: []
  },
  alerts: [],               // Active alerts (max 50)
  stats: {                  // Aggregate statistics
    avgSpeed: 0,
    totalVehicles: 0,
    avgCongestion: 0,
    totalEmissions: 0,
    activeAlerts: 0
  },
  darkMode: false,
  selectedSensor: null,
  filters: {}
}
```

**Key Features**:
- Immutable updates
- Selective subscriptions for performance
- Built-in data retention limits to prevent memory leaks

### 2. Traffic Simulation Engine

**Location**: `src/services/trafficSimulation.js`

**Purpose**: Generate realistic traffic data and simulate city-wide traffic patterns

**Key Methods**:

```javascript
class TrafficSimulation {
  initializeSensors()      // Create 300 sensors with geographic distribution
  initializeVehicles()     // Create 1000 vehicles with random positions
  updateSensors()          // Update sensor readings with realistic variations
  updateVehicles()         // Update vehicle positions and movements
  generateEvents()         // Create traffic events based on probability
  generateAlerts()         // Create alerts for critical conditions
  calculateStats()         // Compute aggregate statistics
}
```

**Simulation Features**:
- Geographic distribution across city radius (15km)
- Road type classification (highway, arterial, collector, local)
- Time-based variations (rush hour simulation)
- Realistic congestion modeling
- Event probability system
- Emissions calculations

### 3. Component Architecture

#### Component Hierarchy

```
App
├── Header
│   ├── Logo & Title
│   ├── Quick Stats
│   └── Dark Mode Toggle
├── AlertPanel (Floating)
│   └── Alert Cards (Animated)
├── CongestionGauges
│   ├── Linear Gauges (4)
│   └── Circular Gauges (4)
├── TrafficMap
│   ├── Leaflet Map Container
│   ├── Tile Layer
│   └── Sensor Markers (300+)
├── TrendCharts
│   ├── Speed Chart
│   ├── Congestion Chart
│   └── Emissions Chart
└── EventTable
    ├── Filter Controls
    ├── Search Bar
    ├── Sort Controls
    └── Data Export Buttons
```

#### Key Components

**Header** (`src/components/Header.jsx`)
- Displays real-time statistics
- Dark mode toggle with animation
- Responsive layout (mobile/desktop)

**TrafficMap** (`src/components/TrafficMap.jsx`)
- Leaflet-based interactive map
- 300+ sensor markers with color coding
- Click interactions for detailed info
- Popup displays with sensor data

**TrendCharts** (`src/components/TrendCharts.jsx`)
- Three real-time line charts
- Recharts library with custom styling
- Dark mode support
- Rolling window of 30 data points

**CongestionGauges** (`src/components/CongestionGauges.jsx`)
- Linear progress bars (4 metrics)
- Circular gauges (4 metrics)
- Framer Motion animations
- Color-coded by severity

**EventTable** (`src/components/EventTable.jsx`)
- Sortable columns
- Advanced filtering
- Search functionality
- CSV/JSON export
- Paginated display (100 visible rows)

**AlertPanel** (`src/components/AlertPanel.jsx`)
- Floating notification system
- Animated entry/exit
- Dismissible alerts
- Priority-based display

## Data Flow

### Real-Time Update Cycle

```
1. Interval Timer (2000ms)
           ↓
2. TrafficSimulation
   - updateSensors()
   - updateVehicles()
   - generateEvents()
   - generateAlerts()
   - calculateStats()
           ↓
3. State Updates (Zustand)
   - setSensors()
   - addEvent()
   - addAlert()
   - updateStats()
   - updateHistoricalData()
           ↓
4. Component Re-renders
   - Selective updates via selectors
   - Only affected components re-render
           ↓
5. UI Updates
   - Map markers update positions
   - Charts add new data points
   - Gauges animate to new values
   - Event table adds new rows
   - Alerts appear with animation
```

### Event Handling Flow

```
User Interaction
       ↓
Component Event Handler
       ↓
State Action Dispatch
       ↓
State Update
       ↓
UI Re-render
```

**Examples**:
- Dark mode toggle → `toggleDarkMode()` → Re-render with new theme
- Sort table → `handleSort()` → Re-compute sorted array → Table update
- Export data → Generate file → Browser download
- Dismiss alert → `dismissAlert(id)` → Remove from array → Alert fade out

## Performance Optimizations

### 1. Code Splitting

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],      // 302KB
        maps: ['leaflet', 'react-leaflet'],  // 153KB
        charts: ['recharts'],                // 387KB
        ui: ['framer-motion', '@headlessui'] // 128KB
      }
    }
  }
}
```

**Benefits**:
- Parallel chunk loading
- Better caching (vendor chunks rarely change)
- Faster initial load

### 2. Data Retention Limits

```javascript
// Prevent memory leaks
events: [event, ...state.events].slice(0, 500)    // Max 500 events
alerts: [alert, ...state.alerts].slice(0, 50)     // Max 50 alerts
historicalData: {
  speed: [...data.speed, newPoint].slice(-30)     // Rolling 30 points
}
```

### 3. Selective Rendering

```javascript
// Components subscribe only to needed state
const sensors = useTrafficStore(state => state.sensors);
const darkMode = useTrafficStore(state => state.darkMode);
```

**Benefits**:
- Component only re-renders when its specific data changes
- Prevents cascading re-renders

### 4. Animation Performance

```javascript
// Framer Motion with GPU acceleration
<motion.div
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.5 }}
/>
```

**Benefits**:
- Hardware-accelerated animations
- Smooth 60fps updates

### 5. Table Virtualization

```javascript
// Display only visible rows
{filteredAndSortedEvents.slice(0, 100).map(...)}
```

**Benefits**:
- Renders max 100 DOM nodes regardless of data size
- Maintains performance with thousands of events

## State Management Strategy

### Zustand Benefits

1. **No Provider Boilerplate**: Direct hook usage
2. **Minimal Re-renders**: Granular subscriptions
3. **Simple API**: Easy to understand and maintain
4. **TypeScript Ready**: Full type inference
5. **DevTools Support**: Redux DevTools compatible

### State Update Patterns

**Immutable Updates**:
```javascript
set((state) => ({
  sensors: state.sensors.map(s =>
    s.id === id ? { ...s, ...updates } : s
  )
}))
```

**Array Operations**:
```javascript
// Add to front, limit size
set((state) => ({
  events: [newEvent, ...state.events].slice(0, 500)
}))
```

**Nested Updates**:
```javascript
set((state) => ({
  historicalData: {
    ...state.historicalData,
    speed: [...state.historicalData.speed, newSpeed].slice(-30)
  }
}))
```

## Simulation Engine Design

### Sensor Distribution

**Geographic Algorithm**:
```javascript
// Polar coordinate distribution
const angle = (Math.PI * 2 * i) / sensorCount;
const radius = Math.random() * cityRadius;
const lat = centerLat + radius * Math.cos(angle);
const lng = centerLng + radius * Math.sin(angle);
```

**Result**: Even distribution across city with realistic clustering

### Traffic Modeling

**Congestion Calculation**:
```javascript
const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
const rushHourMultiplier = isRushHour ? 1.5 : 1.0;
const congestionChange = (Math.random() - 0.5) * 0.2 * rushHourMultiplier;
```

**Speed Variation**:
```javascript
const newSpeed = Math.max(5, Math.min(
  sensor.speedLimit,
  sensor.currentSpeed + speedVariation
));
```

**Emissions Formula**:
```javascript
const emissionsBase = vehicleCount * (1 + congestion * 2);
const emissions = emissionsBase * (0.8 + Math.random() * 0.4);
```

### Event Generation

**Probability-Based System**:
```javascript
const eventTypes = [
  { type: 'congestion', severity: 'warning', probability: 0.05 },
  { type: 'accident', severity: 'critical', probability: 0.01 },
  { type: 'roadwork', severity: 'info', probability: 0.02 }
];

// For each sensor, roll dice for each event type
if (Math.random() < eventType.probability) {
  generateEvent(eventType, sensor);
}
```

## Build and Deployment Architecture

### Multi-Stage Docker Build

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Benefits**:
- Smaller final image (only production files)
- Faster deployment
- Better security (no build tools in production)

### Nginx Configuration

**Key Features**:
1. Proper MIME types for ES modules
2. SPA routing with `try_files`
3. Aggressive caching for hashed assets
4. No caching for HTML
5. Gzip compression
6. Security headers

## Scalability Considerations

### Current Limits

- **Sensors**: 300 (can easily scale to 1000+)
- **Vehicles**: 1000 (can scale to 10,000+)
- **Update Frequency**: 2 seconds (configurable)
- **Event History**: 500 events
- **Alert History**: 50 alerts

### Future Enhancements

**Backend Integration**:
```
React Frontend
      ↓
WebSocket Connection
      ↓
Node.js Backend
      ↓
Redis (Real-time cache)
      ↓
PostgreSQL + TimescaleDB (Historical data)
      ↓
External Traffic APIs
```

**Benefits**:
- Real data integration
- Historical analysis
- Multi-user support
- Data persistence

## Security Architecture

### Client-Side Security

1. **Content Security Policy**: Configured in nginx.conf
2. **XSS Prevention**: React's built-in escaping
3. **Input Sanitization**: Filter validation
4. **No Sensitive Data**: All data is simulated

### Deployment Security

1. **HTTPS Only**: Enforced in production
2. **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
3. **Regular Updates**: Dependency security updates
4. **Container Isolation**: Docker containerization

## Monitoring and Observability

### Built-in Metrics

- Active sensor count
- Average speed
- Congestion percentage
- Total emissions
- Alert count

### Browser Performance

- React DevTools profiling
- Chrome Performance tab
- Lighthouse audits
- Memory profiling

### Production Monitoring (Future)

- Error tracking (Sentry)
- Analytics (Google Analytics, Mixpanel)
- Performance monitoring (DataDog, New Relic)
- Uptime monitoring (Pingdom)

## Technology Decisions

### Why React?
- Component-based architecture
- Large ecosystem
- Excellent performance
- TypeScript support

### Why Zustand?
- Simpler than Redux
- Better performance than Context API
- Minimal boilerplate
- Easy to test

### Why Vite?
- Fast development server
- Optimized builds
- Modern tooling
- Great DX

### Why Leaflet?
- Open source
- Well-documented
- Large plugin ecosystem
- No API keys required

### Why Recharts?
- Composable API
- Responsive by default
- Good performance
- Active maintenance

### Why Tailwind CSS?
- Utility-first approach
- Excellent DX
- Small production bundle
- Easy dark mode

### Why Framer Motion?
- Declarative animations
- Great performance
- Physics-based motion
- Easy to use

## Conclusion

The City Traffic Dashboard architecture is designed for:

1. **Performance**: Optimized rendering, code splitting, efficient state management
2. **Scalability**: Easy to extend with real APIs, can handle more sensors/vehicles
3. **Maintainability**: Clear separation of concerns, well-documented, testable
4. **User Experience**: Smooth animations, responsive design, real-time updates
5. **Production-Ready**: Docker deployment, proper caching, security headers

The architecture supports both the current simulation-based implementation and future integration with real traffic APIs without major refactoring.
