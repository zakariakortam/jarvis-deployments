# Factory Monitor - Architecture Documentation

## System Overview

Factory Monitor is a single-page application (SPA) built with React that provides real-time monitoring and analytics for industrial machinery. The system simulates a complete factory environment with 10 machines, generating realistic sensor data and providing comprehensive visualization and analysis tools.

## Architecture Layers

### 1. Presentation Layer (UI Components)

**Components Structure:**
- **Atomic Components**: Button, Badge, Card (reusable primitives)
- **Chart Components**: LineChart, BarChart, GaugeChart (data visualization)
- **Layout Components**: Layout, ErrorBoundary (application structure)
- **Page Components**: Dashboard, Machines, MachineDetail, Comparison, CommandCenter

**Design Patterns:**
- Component composition for reusability
- Props-based configuration for flexibility
- Render props for specialized behavior
- Error boundaries for fault isolation

### 2. State Management Layer

**Technology:** Zustand with persistence middleware

**Store Structure:**
```javascript
{
  // Core data
  machines: Array<Machine>,
  alarms: Array<Alarm>,
  lastUpdate: timestamp,

  // UI state
  darkMode: boolean,
  selectedMachineId: string,
  comparisonMachineIds: string[],
  timeRange: { start, end },

  // Configuration
  widgets: Array<Widget>,
  filters: Object,

  // Computed values (getters)
  getFilteredMachines(),
  getKPIs(),
  getAlarmStats(),
  ...
}
```

**State Flow:**
1. DataSimulator generates updates
2. Updates published to subscribers
3. Store receives updates via `updateFromSimulator()`
4. React components re-render based on state changes
5. Persistence middleware saves UI preferences to localStorage

### 3. Business Logic Layer

**DataSimulator Service:**
- Singleton pattern for centralized data management
- Observer pattern for real-time updates
- Configurable update intervals (default: 2 seconds)
- Realistic physics-based sensor simulation

**Simulation Features:**
- Thermal inertia for temperature changes
- Vibration spikes and anomalies
- Correlated voltage/current variations
- Performance-based energy consumption
- Automatic alarm generation based on thresholds

### 4. Data Layer

**In-Memory Storage:**
- Current machine state (10 machines)
- Historical data (24-hour rolling window)
- Maintenance history (generated on init)
- Active alarms (last 100)

**Data Models:**

```typescript
Machine {
  id: string
  name: string
  type: 'milling' | 'turning' | 'stamping' | 'grinding' | 'welding'
  status: 'running' | 'idle' | 'error'
  temperature: number
  vibration: number
  voltage: number
  current: number
  efficiency: number
  throughput: number
  scrapRate: number
  energyUsage: number
  components: Component[]
  ...
}

Alarm {
  id: string
  machineId: string
  errorCode: string
  severity: 'critical' | 'error' | 'warning' | 'info'
  message: string
  timestamp: number
  acknowledged: boolean
}
```

## Data Flow

### Real-time Update Flow

```
DataSimulator.updateSensorData()
  ↓
Calculate new sensor values
  ↓
Check alarm conditions
  ↓
Store historical data
  ↓
Notify subscribers (Zustand store)
  ↓
Store updates state
  ↓
React components re-render
  ↓
Recharts animate transitions
```

### User Interaction Flow

```
User clicks machine card
  ↓
Navigate to /machines/:id
  ↓
MachineDetail component mounts
  ↓
useHistoricalData hook fetches data
  ↓
useMaintenanceHistory hook fetches history
  ↓
Component renders with data
  ↓
Charts display with animations
```

## Component Architecture

### Page Components

**Dashboard:**
- Purpose: Overview of factory performance
- Data: All machines, aggregated KPIs, alarms
- Charts: Real-time line charts, bar charts, gauges
- Updates: Every 2 seconds via simulator

**MachineDetail:**
- Purpose: Deep dive into single machine
- Data: Single machine, historical data, maintenance
- Charts: Temperature/vibration trends, efficiency/energy
- Features: Component health, export reports

**Comparison:**
- Purpose: Side-by-side machine analysis
- Data: Selected machines (max 4)
- Charts: Overlaid time-series, comparison bars
- Features: Statistical summary, metric comparison

**CommandCenter:**
- Purpose: Alarm management and monitoring
- Data: All alarms, KPIs, thresholds
- Features: Filtering, acknowledgment, exports

### Custom Hooks

**useSimulator:**
- Manages simulator lifecycle
- Subscribes to updates
- Auto-starts on mount
- Cleanup on unmount

**useHistoricalData:**
- Fetches time-series data for machine
- Supports time range filtering
- Returns loading state
- Memoizes results

**useMaintenanceHistory:**
- Retrieves maintenance records
- Sorts by date descending
- Filters by machine ID

## Performance Optimizations

### Code Splitting
- Route-based chunks via React.lazy()
- Vendor bundle separation
- Chart library isolated bundle

### Rendering Optimizations
- useMemo for expensive calculations
- Zustand selector optimization
- Chart data windowing (last 50 points)
- Debounced updates for rapid changes

### Bundle Optimization
- Tree shaking enabled
- Minification with Terser
- Gzip compression
- CSS purging via TailwindCSS

## Security Considerations

### Frontend Security
- Input sanitization (currently not applicable - read-only)
- XSS prevention via React's default escaping
- Content Security Policy headers in nginx
- No sensitive data storage

### Deployment Security
- HTTPS enforcement via nginx
- Security headers (X-Frame-Options, X-Content-Type-Options)
- CORS configuration
- Rate limiting (nginx level)

## Scalability

### Current Limitations
- In-memory storage (no persistence)
- Single-client architecture
- 24-hour data retention
- 10 machine limit (configurable)

### Scaling Strategies
- Backend API for multi-client support
- Database for persistent storage
- WebSocket for real-time updates
- Horizontal scaling with load balancer

## Deployment Architecture

### Development
```
Vite Dev Server (port 3000)
  ↓
Hot Module Replacement
  ↓
React Fast Refresh
```

### Production
```
Nginx (port 80)
  ↓
Static files from /usr/share/nginx/html
  ↓
SPA routing via try_files
  ↓
Gzip compression
  ↓
Cache headers for assets
```

### Docker Container
```
Build Stage: Node 18 Alpine
  ↓
npm ci (clean install)
  ↓
npm run build
  ↓
Production Stage: Nginx Alpine
  ↓
Copy dist/ to nginx html
  ↓
Copy nginx.conf
  ↓
Expose port 80
```

## Monitoring and Observability

### Client-Side Monitoring
- Error boundaries catch React errors
- Console logging for development
- Performance metrics via Lighthouse

### Production Monitoring
- Nginx access logs
- Docker container health
- External monitoring via Coolify

## Testing Strategy

### Unit Testing
- Component rendering tests
- Store action tests
- Utility function tests
- Hook behavior tests

### Integration Testing
- Page navigation flows
- Data fetching and display
- User interaction workflows
- Export functionality

### E2E Testing
- Critical user paths
- Multi-page workflows
- Error scenarios
- Performance benchmarks

## Future Enhancements

### Short-term
- Playback controls for historical data
- Customizable dashboard layouts
- Alert notification system
- Real-time data export

### Long-term
- Backend API integration
- Multi-factory support
- Machine learning predictions
- Mobile native apps
- WebSocket real-time streaming
- Advanced analytics and reporting
