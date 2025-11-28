# Architecture Documentation

## System Overview

The Building Portfolio Dashboard is a single-page application (SPA) built with React and Vite, featuring real-time data simulation and comprehensive analytics.

## Architecture Layers

### 1. Presentation Layer (Components)

#### Component Hierarchy
```
App
├── Header
│   ├── Dark Mode Toggle
│   ├── Export Button
│   └── View Mode Toggle
├── BuildingSelector (when no building selected)
│   └── Building Cards (with real-time data)
└── DashboardView (when building selected)
    ├── Tab Navigation
    └── Dynamic Content
        ├── Overview
        ├── Occupancy & Leasing
        ├── Energy Dashboard
        ├── Maintenance Dashboard
        ├── Tenant Satisfaction
        └── Investment Analytics
```

#### Component Responsibilities

**Common Components**
- `Card`: Reusable container with optional title and actions
- `MetricCard`: Display key metrics with icons and trends
- `Button`: Consistent button styling across the app
- `LoadingSpinner`: Loading state indicator

**Dashboard Components**
- `Header`: Navigation, theme toggle, and actions
- `BuildingSelector`: Grid/list view of all buildings with filters
- `DashboardView`: Tabbed interface for selected building

**Feature Components**
- `OccupancyChart`: Line/area chart for occupancy trends
- `LeasingTimeline`: Event timeline with filtering
- `SpaceUtilizationHeatmap`: Interactive heatmap by floor and time
- `EnergyDashboard`: Energy consumption analytics
- `MaintenanceDashboard`: Cost breakdown and trends
- `TenantSatisfactionBoard`: Satisfaction metrics and radar chart
- `InvestmentAnalytics`: Financial performance metrics

### 2. State Management Layer

#### Zustand Store Structure

```javascript
{
  // Data
  buildings: Array<Building>,
  selectedBuilding: Building | null,
  realtimeData: Array<RealtimeUpdate>,

  // UI State
  darkMode: boolean,
  viewMode: 'grid' | 'list',

  // Filters
  filters: {
    buildingType: string,
    location: string,
    occupancyMin: number
  },
  searchQuery: string,

  // Actions
  setSelectedBuilding: (building) => void,
  setDarkMode: (enabled) => void,
  toggleDarkMode: () => void,
  setViewMode: (mode) => void,
  setFilters: (filters) => void,
  setSearchQuery: (query) => void,
  updateRealtimeData: (data) => void,
  getFilteredBuildings: () => Array<Building>,
  exportData: (type, data) => void
}
```

### 3. Data Layer

#### Data Simulator Service

**Purpose**: Generate realistic building data without backend dependency

**Key Methods**:
- `generateBuildings(count)`: Create building portfolio
- `generateOccupancyData(buildingId)`: Historical occupancy
- `generateLeasingTimeline(buildingId)`: Lease events
- `generateSpaceUtilization(buildingId)`: Floor-by-floor usage
- `generateEnergyUsage(buildingId)`: Utility consumption
- `generateMaintenanceCosts(buildingId)`: Maintenance breakdown
- `generateTenantSatisfaction(buildingId)`: Satisfaction metrics
- `generateInvestmentPerformance(buildingId)`: Financial data
- `generateRealtimeUpdates()`: Live data updates
- `startRealtimeSimulation(callback, interval)`: Begin updates
- `stopRealtimeSimulation()`: Stop updates

**Data Generation Strategy**:
1. Base values assigned to each building
2. Randomization with realistic bounds
3. Time-based patterns (hourly, daily, weekly, monthly)
4. Variance modeling for natural fluctuations

### 4. Styling Layer

#### TailwindCSS Configuration

**Design System**:
- CSS Custom Properties for theming
- Light/Dark mode support
- Consistent spacing scale
- Color palette with semantic naming
- Responsive breakpoints

**Theme Variables**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark variants */
}
```

## Data Flow

### Initial Load
1. App mounts
2. System theme preference detected
3. Zustand store initializes with buildings
4. Real-time simulation starts
5. BuildingSelector renders with all buildings

### Building Selection
1. User clicks building card
2. `setSelectedBuilding()` updates store
3. App re-renders with DashboardView
4. Components fetch data for selected building
5. Charts render with building-specific data

### Real-time Updates
1. Simulator generates updates every 3s
2. `updateRealtimeData()` called with new data
3. Store updates realtimeData array
4. Components subscribed to data re-render
5. Metrics and alerts update on building cards

### Data Export
1. User clicks Export button
2. Current building data serialized
3. JSON blob created
4. File download triggered
5. Timestamp added to filename

## Performance Considerations

### Optimization Strategies

**1. Code Splitting**
- Vendor chunks (React, ReactDOM)
- Chart library chunk (Recharts)
- Utility chunk (date-fns, Zustand)

**2. Render Optimization**
- Zustand shallow comparison
- Memoized selectors
- Component-level optimization with React.memo where needed

**3. Data Efficiency**
- Simulated data generated on-demand
- Historical data calculated once per selection
- Real-time updates use minimal payload

**4. Bundle Optimization**
- Tree-shaking unused code
- Minification and compression
- Asset optimization

## Security Considerations

### Client-Side Security

**1. Content Security Policy**
- Implemented in nginx.conf
- Restricts script sources
- Prevents XSS attacks

**2. Data Sanitization**
- All user inputs sanitized
- No innerHTML usage
- React's built-in XSS protection

**3. Secure Headers**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection enabled
- Referrer-Policy configured

## Scalability

### Current Limitations
- Client-side simulation (no persistent backend)
- 12 buildings hardcoded
- Data resets on page reload

### Scaling to Production

**Backend Integration**:
1. Replace DataSimulator with API service
2. Implement WebSocket for real-time updates
3. Add authentication/authorization
4. Implement data persistence

**Database Schema**:
```sql
buildings (id, name, type, location, specs)
occupancy (building_id, timestamp, rate, leased, available)
leases (id, building_id, tenant, start_date, end_date, area, value)
energy (building_id, date, electricity, gas, water, cost)
maintenance (building_id, date, type, category, cost)
satisfaction (building_id, date, category, score, responses)
performance (building_id, date, value, revenue, expenses, noi)
```

**API Endpoints**:
```
GET  /api/buildings
GET  /api/buildings/:id
GET  /api/buildings/:id/occupancy
GET  /api/buildings/:id/leases
GET  /api/buildings/:id/energy
GET  /api/buildings/:id/maintenance
GET  /api/buildings/:id/satisfaction
GET  /api/buildings/:id/performance
WS   /api/realtime
```

## Deployment Architecture

### Docker Container
```
┌─────────────────────────────────────┐
│   Nginx (Port 80)                   │
│   ├── Serve static files            │
│   ├── SPA routing                   │
│   ├── Gzip compression              │
│   └── Security headers              │
└─────────────────────────────────────┘
```

### Build Process
1. Install dependencies (npm ci)
2. Build with Vite (npm run build)
3. Output to dist/
4. Copy to nginx html directory
5. Start nginx server

## Testing Strategy

### Recommended Test Coverage

**Unit Tests**:
- DataSimulator methods
- Zustand store actions
- Utility functions
- Component logic

**Integration Tests**:
- Dashboard workflows
- Filter functionality
- Data export
- Theme switching

**E2E Tests**:
- Building selection
- Tab navigation
- Real-time updates
- Responsive behavior

## Future Enhancements

### Planned Features
1. Multi-user support with authentication
2. Custom dashboard layouts
3. Alerts and notifications
4. Report generation (PDF/Excel)
5. Predictive analytics with ML
6. Mobile native apps
7. Offline mode with service workers
8. Advanced data visualization options
9. Integration with building management systems
10. Automated maintenance scheduling

### Technical Improvements
1. GraphQL API for efficient queries
2. Redis caching layer
3. PostgreSQL with TimescaleDB for time-series
4. Kubernetes deployment
5. CI/CD pipeline with automated tests
6. Performance monitoring (DataDog/New Relic)
7. Error tracking (Sentry)
8. Analytics (Mixpanel/Amplitude)
