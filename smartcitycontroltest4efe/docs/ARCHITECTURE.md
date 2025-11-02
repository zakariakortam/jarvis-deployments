# Smart City Control System - Architecture Documentation

## System Overview

The Smart City Control System is a real-time monitoring dashboard designed to visualize and manage data from 10,000+ simulated sensors across four critical infrastructure systems.

## Architecture Layers

### 1. Presentation Layer (React Components)

```
┌─────────────────────────────────────────┐
│           Dashboard (Main)              │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ KPI Grid │  │Alert Panel│ │Theme   ││
│  └──────────┘  └──────────┘  └────────┘│
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  System Map  │  │  Trend Charts   │ │
│  └──────────────┘  └─────────────────┘ │
├─────────────────────────────────────────┤
│          ┌──────────────────┐           │
│          │   Data Table     │           │
│          └──────────────────┘           │
└─────────────────────────────────────────┘
```

### 2. State Management Layer (Zustand)

**cityStore.js**
- Central state container using Zustand
- Manages global application state
- Handles auto-refresh intervals
- Maintains filter and view states

**State Structure:**
```javascript
{
  darkMode: boolean,
  activeSystem: string,
  systemMetrics: Object,
  heatmapData: Object,
  alerts: Array,
  timeSeriesData: Object,
  filters: Object,
  mapState: Object,
  selectedSensor: Object
}
```

### 3. Data Simulation Layer

**sensorSimulator.js**
- Generates realistic sensor data for 10,000+ sensors
- Manages sensor lifecycle and status
- Produces time-series data with trends
- Simulates anomalies and alerts
- Maintains historical data buffers

**Sensor Distribution:**
- Transportation: 3,000 sensors
- Power: 2,500 sensors
- Waste: 2,000 sensors
- Water: 2,500 sensors

### 4. Utility Layer

**helpers.js**
- Data formatting functions
- Export utilities (CSV)
- Statistical calculations
- Search and filter operations
- Performance optimization helpers

## Data Flow Architecture

```
┌──────────────────┐
│ Sensor Simulator │
│   (10K sensors)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Zustand Store  │
│  (State Manager) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ React Components │
│  (UI Rendering)  │
└──────────────────┘
```

### Real-Time Update Cycle

1. **Initialization** (0ms)
   - Sensor simulator creates 10,000 sensors
   - Initial data generation
   - Store population

2. **Auto-Refresh Loop** (Every 2000ms)
   - Generate new readings for all sensors
   - Calculate system metrics
   - Update heatmap coordinates
   - Compute time series
   - Trigger React re-renders

3. **User Interactions**
   - Filter changes
   - System selection
   - Map interactions
   - Table sorting/searching

## Component Architecture

### Dashboard Component
**Purpose**: Main container and layout orchestration

**Responsibilities:**
- Initialize auto-refresh
- Coordinate lazy-loaded components
- Manage error boundaries
- Handle suspense fallbacks

**Children:**
- KPIGrid
- AlertPanel
- SystemMap
- TrendCharts
- DataTable

### KPIGrid Component
**Purpose**: Display high-level system metrics

**Features:**
- Real-time gauge charts
- Health score visualization
- Efficiency metrics
- Alert counts

**Performance:**
- Memoized calculations
- Optimized re-renders
- Animated transitions

### SystemMap Component
**Purpose**: Geographic visualization with Leaflet

**Layers:**
- Transportation (blue markers)
- Power (green markers)
- Waste (yellow markers)
- Water (cyan markers)

**Features:**
- Toggle-able layers
- Heatmap intensity
- Alert highlighting
- Popup details

**Performance:**
- Clustered markers for large datasets
- Lazy rendering
- Viewport-based optimization

### TrendCharts Component
**Purpose**: Time-series visualization

**Chart Types:**
- Area charts (individual systems)
- Line charts (comparison)

**Features:**
- Real-time updates
- Custom tooltips
- Responsive sizing
- Dark mode support

### DataTable Component
**Purpose**: Tabular data presentation

**Features:**
- Sortable columns
- Multi-filter support
- Search functionality
- CSV export
- Pagination

**Optimization:**
- Virtual scrolling ready
- Memoized filter operations
- Debounced search
- Lazy row rendering

## Performance Optimization Strategies

### 1. Code Splitting
```javascript
const SystemMap = lazy(() => import('../SystemMap'));
const TrendCharts = lazy(() => import('../TrendCharts'));
const DataTable = lazy(() => import('../DataTable'));
```

### 2. Memoization
- React.memo for pure components
- useMemo for expensive calculations
- useCallback for stable function references

### 3. Bundle Optimization
- Manual chunk splitting (vendor, charts, maps, ui)
- Tree shaking via ES modules
- Gzip compression
- Terser minification

### 4. Rendering Optimization
- Suspense boundaries
- Error boundaries
- Lazy component loading
- Conditional rendering

### 5. Data Management
- Limited history (100 points per sensor)
- Aggregated metrics vs raw data
- Efficient array operations
- Map data structures for O(1) lookups

## State Update Flow

```
User Action / Timer
      │
      ▼
State Update (Zustand)
      │
      ├─→ System Metrics Calculation
      │
      ├─→ Heatmap Data Generation
      │
      ├─→ Time Series Update
      │
      └─→ Alert Detection
            │
            ▼
    Component Re-render
            │
            ├─→ KPIGrid Update
            │
            ├─→ Map Markers Update
            │
            ├─→ Charts Update
            │
            └─→ Table Update
```

## Error Handling Strategy

### Error Boundary Hierarchy
```
App (Root Boundary)
  └─ Dashboard
       ├─ KPIGrid (Individual Boundary)
       ├─ AlertPanel (Individual Boundary)
       ├─ SystemMap (Individual Boundary)
       ├─ TrendCharts (Individual Boundary)
       └─ DataTable (Individual Boundary)
```

### Error Recovery
- Component-level isolation
- Graceful degradation
- User-friendly error messages
- Reload capabilities
- Development error details

## Scalability Considerations

### Current Scale
- 10,000 sensors
- 2-second update interval
- 100 historical points per sensor
- ~1M data points in memory

### Scaling Strategies

**Horizontal Scaling:**
- Add WebSocket server for real data
- Implement Redis for state management
- Use CDN for static assets
- Load balancer for multiple instances

**Vertical Scaling:**
- Increase update interval
- Reduce historical data retention
- Implement data sampling
- Use IndexedDB for client-side caching

**Optimization for Larger Datasets:**
- Virtual scrolling for tables
- Map marker clustering
- Data aggregation at source
- Progressive data loading

## Security Architecture

### Client-Side Security
- Input sanitization (DOMPurify)
- XSS prevention
- CSRF token ready
- Secure headers configured

### Data Privacy
- No PII collection
- Simulated data only
- No external API calls
- No tracking scripts

## Technology Stack Rationale

### React 18
- Concurrent features
- Automatic batching
- Suspense support
- Strong ecosystem

### Zustand
- Minimal boilerplate
- No providers needed
- TypeScript ready
- DevTools support

### Vite
- Fast HMR
- Optimized builds
- ES modules native
- Plugin ecosystem

### TailwindCSS
- Utility-first approach
- Dark mode support
- Minimal bundle size
- Rapid development

### Recharts
- React-native charts
- Responsive by default
- Customizable
- Good documentation

### Leaflet
- Lightweight mapping
- Plugin ecosystem
- Mobile-friendly
- Open source

## Deployment Architecture

### Docker Container
```
┌─────────────────────────┐
│   Node 18 Alpine        │
├─────────────────────────┤
│   Vite Build Output     │
├─────────────────────────┤
│   Serve Static Server   │
├─────────────────────────┤
│   Port 3000             │
└─────────────────────────┘
```

### Production Environment
- Health checks enabled
- Graceful shutdown
- Log aggregation ready
- Resource limits set
- Auto-restart configured

## Monitoring and Observability

### Built-in Metrics
- FPS tracking
- Memory usage
- Render performance
- Network timing

### Ready for Integration
- DataDog APM
- New Relic
- Sentry error tracking
- Google Analytics
- Custom logging service

## Future Enhancements

### Planned Features
1. Real-time WebSocket integration
2. Historical data analysis
3. Predictive analytics
4. Custom alert rules
5. Report generation
6. Multi-user support
7. Role-based access control
8. API endpoints for external integrations

### Technical Improvements
1. Server-side rendering (SSR)
2. Progressive Web App (PWA)
3. Offline mode
4. GraphQL API
5. Real-time collaboration
6. Advanced filtering
7. Custom dashboard layouts
8. Export to multiple formats

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-27
**Maintainer**: Smart City Control Team
