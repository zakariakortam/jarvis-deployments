# System Architecture

## Overview

The City Traffic Management Dashboard is a client-side React application that simulates real-time traffic monitoring for an urban environment. The architecture follows modern best practices for performance, maintainability, and scalability.

## Technology Stack

### Core Technologies
- **React 18.2**: Component-based UI framework with concurrent features
- **Vite 5.x**: Fast build tool with HMR and optimized production builds
- **JavaScript ES2021**: Modern JavaScript features without TypeScript overhead
- **TailwindCSS 3.x**: Utility-first CSS framework with JIT compilation

### State Management
- **Zustand 4.x**: Lightweight state management with minimal boilerplate
- **React Hooks**: useState, useEffect, useMemo, useCallback for local state

### Data Visualization
- **Recharts 2.x**: Declarative charting library built on D3
- **Leaflet 1.9**: Open-source interactive mapping library
- **React-Leaflet 4.x**: React components for Leaflet integration

### Animation & UX
- **Framer Motion 11.x**: Production-ready animation library
- **React Suspense**: Code splitting and lazy loading boundaries
- **Error Boundaries**: Graceful error handling and recovery

### Build & Optimization
- **Vite Compression Plugin**: Gzip compression for assets
- **Rollup Visualizer**: Bundle size analysis and optimization
- **Manual Chunking**: Strategic code splitting for optimal loading

## Architecture Patterns

### Component Architecture

```
┌─────────────────────────────────────────┐
│              App.jsx                    │
│  (Root Component & Route Management)    │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐     ┌────────▼────────┐
│ Header │     │     Layout      │
└────────┘     └────────┬────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │   Map   │   │ Gauges  │   │ Charts  │
    └─────────┘   └─────────┘   └─────────┘
                        │
                  ┌─────▼──────┐
                  │ EventTable │
                  └────────────┘
```

### Data Flow

```
┌──────────────────────────────────────────────────┐
│           Traffic Simulator Engine                │
│  - Generates sensor data                          │
│  - Simulates vehicle movement                     │
│  - Creates traffic events                         │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              Zustand Store                        │
│  - Centralized state management                   │
│  - Computed getters                               │
│  - Action dispatchers                             │
└────────────────┬─────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
┌─────────┐           ┌──────────┐
│   UI    │           │  Hooks   │
│Components│ ◄────────┤useSimulation│
└─────────┘           └──────────┘
```

### State Management Strategy

**Zustand Store Structure:**
```javascript
{
  // Data
  sensors: Array<Sensor>,
  events: Array<Event>,
  metrics: MetricsObject,
  historicalData: Array<DataPoint>,
  
  // UI State
  isSimulationRunning: boolean,
  selectedSensor: Sensor | null,
  selectedZone: string | null,
  darkMode: boolean,
  
  // Actions
  initializeSimulation(),
  updateSimulation(),
  startSimulation(),
  pauseSimulation(),
  resetSimulation(),
  selectSensor(id),
  toggleDarkMode()
}
```

## Simulation Engine

### Traffic Sensor Network

**Generation:**
- 300 sensors distributed across city grid
- Each sensor assigned:
  - Geographic position (lat/lng)
  - Type (speed, congestion, emissions, flow)
  - Road type (highway, arterial, collector, local)
  - Zone (Northwest, Northeast, Southwest, Southeast)

**Update Cycle:**
- Sensors update every 2 seconds
- Speed varies inversely with congestion
- Emissions increase with congestion
- Flow varies with time of day and rush hour patterns

### Vehicle Simulation

**Characteristics:**
- 1000+ simulated vehicles
- Realistic movement patterns
- Speed adjustments based on congestion
- Boundary collision detection

### Event Generation

**Event Types:**
- Accidents (high/critical severity)
- Congestion (medium/high severity)
- Construction (medium severity)
- Incidents (low/medium severity)

**Event Lifecycle:**
- Random generation based on probability
- Duration varies by type (10-60 minutes)
- Automatic expiration after duration
- Impacts nearby sensor readings

## Performance Optimizations

### Code Splitting

**Route-Based Splitting:**
```javascript
const TrafficMap = lazy(() => import('./components/Map'))
const TrafficGauges = lazy(() => import('./components/Gauges'))
const TrafficCharts = lazy(() => import('./components/Charts'))
const EventTable = lazy(() => import('./components/EventTable'))
```

**Manual Chunks:**
```javascript
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  ui: ['@headlessui/react', 'framer-motion'],
  maps: ['leaflet', 'react-leaflet'],
  charts: ['recharts'],
  utils: ['date-fns', 'clsx', 'zod']
}
```

### Rendering Optimizations

**Memoization:**
- Component memoization with React.memo
- Value memoization with useMemo
- Callback memoization with useCallback

**Virtual Scrolling:**
- Large data sets use react-window
- Only renders visible items
- Reduces DOM nodes significantly

### Bundle Optimization

**Strategies:**
- Tree shaking of unused code
- Minification with Terser
- Gzip compression
- Asset optimization
- Source map generation for debugging

## Component Responsibilities

### Header Component
- Dark mode toggle
- Simulation controls (play/pause/reset)
- Active statistics display
- Responsive navigation

### Map Component
- Renders interactive Leaflet map
- Displays sensor markers with color coding
- Heatmap overlay for congestion
- Click handlers for sensor details
- Zone boundaries visualization

### Gauges Component
- Four circular gauge displays
- Real-time metric updates
- Animated transitions
- Color-coded ranges (green/yellow/red)
- Responsive grid layout

### Charts Component
- Line charts for historical trends
- Speed, congestion, emissions, flow
- Time-based x-axis
- Responsive to window resize
- Tooltip with detailed information

### EventTable Component
- Sortable columns
- Filter by event type
- Search functionality
- Pagination for large datasets
- Real-time updates with smooth animations

## Accessibility Features

### ARIA Labels
- All interactive elements labeled
- Semantic HTML structure
- Landmark regions defined
- Form inputs properly associated

### Keyboard Navigation
- Tab order follows visual flow
- Focus indicators visible
- Keyboard shortcuts for controls
- Escape key closes modals/dropdowns

### Screen Reader Support
- Alt text for images
- ARIA live regions for updates
- Descriptive link text
- Table headers properly marked

## Error Handling

### Error Boundaries
```javascript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

### Loading States
- Suspense boundaries for lazy components
- Skeleton screens during data load
- Spinner animations for actions
- Progress indicators for long operations

### Graceful Degradation
- Map fallback if Leaflet fails
- Chart fallback if data unavailable
- Table fallback for empty data
- Error messages with recovery actions

## Security Considerations

### Input Validation
- Zod schemas for all data structures
- Sanitization of user inputs
- Type checking at runtime
- Boundary validation for coordinates

### Content Security Policy
```javascript
{
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "connect-src": "'self'"
}
```

### XSS Prevention
- React's built-in escaping
- No dangerouslySetInnerHTML usage
- Sanitized third-party content
- CSP headers in production

## Scalability Considerations

### Data Volume
- Handles 300+ sensors efficiently
- 1000+ vehicle updates per second
- 100+ historical data points
- Unlimited events with pagination

### Performance Thresholds
- 60fps animation target
- < 100ms state updates
- < 2s initial load time
- < 1MB total bundle size

### Future Enhancements
- WebSocket for real server integration
- Service worker for offline capability
- IndexedDB for local persistence
- Web workers for heavy computations

## Testing Strategy

### Unit Tests
- Component rendering tests
- State management tests
- Utility function tests
- Simulation logic tests

### Integration Tests
- Component interaction tests
- Data flow tests
- Event handling tests
- Navigation tests

### Performance Tests
- Bundle size monitoring
- Lighthouse CI integration
- Memory leak detection
- FPS monitoring

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         CDN / Static Host           │
│  (Vercel, Netlify, S3+CloudFront)  │
└────────────────┬────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────┐              ┌─────▼────┐
│  HTML  │              │  Assets  │
│  CSS   │              │  JS      │
│  JS    │              │  Images  │
└────────┘              └──────────┘
```

### Build Process
1. Vite processes all source files
2. Rollup bundles and chunks code
3. Terser minifies JavaScript
4. PostCSS processes Tailwind
5. Compression plugin gzips assets
6. Static files output to /dist

### Environment Configuration
- Development: Hot module replacement
- Production: Optimized and minified
- Preview: Production simulation locally

## Monitoring & Observability

### Performance Monitoring
- Lighthouse CI in deployment pipeline
- Bundle size tracking
- Core Web Vitals monitoring
- Error rate tracking

### Logging
- Console warnings for development
- Structured logging in production
- Error boundaries catch React errors
- Network request logging

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills
- None required for modern browsers
- Graceful degradation for older browsers
- Feature detection for APIs

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start dev server
3. Hot module replacement active
4. Instant feedback loop

### Code Quality
1. ESLint for code linting
2. Prettier for formatting
3. Pre-commit hooks (optional)
4. Continuous integration checks

### Build & Deploy
1. `npm run build` - Production build
2. `npm run preview` - Test build locally
3. Deploy to hosting platform
4. Verify deployment health

---

This architecture provides a solid foundation for a production-ready traffic management dashboard with excellent performance, maintainability, and user experience.
