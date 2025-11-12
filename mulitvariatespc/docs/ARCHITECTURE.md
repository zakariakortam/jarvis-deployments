# System Architecture

## Overview

The Multivariate SPC System is a full-stack real-time monitoring application designed for industrial process control using advanced statistical methods.

## Architecture Diagram

```
┌─────────────────┐
│   Client (Web)  │
│   React + Vite  │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Nginx Reverse  │
│     Proxy       │
└────────┬────────┘
         │
┌────────▼────────────────────┐
│   Backend Server            │
│   Node.js + Express         │
│   + Socket.io               │
├─────────────────────────────┤
│   ┌─────────────────────┐   │
│   │   SPC Engine        │   │
│   │   - Hotelling T²    │   │
│   │   - MEWMA           │   │
│   │   - MCUSUM          │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │   Data Generator    │   │
│   │   (Test/Simulation) │   │
│   └─────────────────────┘   │
└────────┬────────────────────┘
         │
┌────────▼────────┐
│  SQLite Database│
│  (Process Data) │
└─────────────────┘
```

## Component Architecture

### Frontend Layer

#### React Application
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for SPA navigation
- **State Management**: Zustand for global state

#### Key Components

1. **Layout Component**
   - Navigation sidebar
   - Header with connection status
   - Theme toggle
   - Outlet for page content

2. **ControlChart Component**
   - Recharts-based real-time plotting
   - Control limits visualization
   - Status-based coloring
   - Responsive design

3. **ContributionPlot Component**
   - Bar chart for variable contributions
   - Percentage-based analysis
   - Interactive tooltips

4. **Pages**
   - Dashboard: Overview and KPIs
   - Monitoring: Real-time charts
   - Historical: Data query and analysis
   - Alerts: Notification management
   - Configuration: System settings

#### State Management

**spcStore (Zustand)**
```javascript
{
  realtimeData: [],        // Live process data
  processStatus: 'normal', // Current status
  controlLimits: {},       // Chart limits
  alerts: [],              // System alerts
  config: {}               // Configuration
}
```

**themeStore (Zustand)**
```javascript
{
  theme: 'light',          // Theme preference
  toggleTheme: fn          // Toggle function
}
```

#### Services

**WebSocket Service**
- Manages Socket.io connection
- Handles real-time events
- Reconnection logic
- Event dispatching to store

### Backend Layer

#### Express Server
- RESTful API endpoints
- WebSocket server (Socket.io)
- CORS configuration
- Compression middleware
- Security headers (Helmet)

#### SPC Engine

**Phase I Initialization**
```javascript
initializePhaseI(data) {
  // Calculate mean vector
  // Calculate covariance matrix
  // Compute control limits
  // Set initialized flag
}
```

**Real-time Processing**
```javascript
processObservation(obs) {
  // Calculate statistic (T², MEWMA, or MCUSUM)
  // Evaluate status (normal/warning/critical)
  // Calculate contributions
  // Return result
}
```

**Algorithms Implemented**
- Hotelling's T² statistic
- MEWMA (Multivariate EWMA)
- MCUSUM (Multivariate CUSUM)
- Variable contribution decomposition
- PCA for dimensionality reduction

#### Data Generator

Simulates real-time process data:
- Normal (in-control) observations
- Random process shifts
- Multivariate normal distribution
- Configurable mean and covariance

#### Database Service

**SQLite Schema**

```sql
-- Process data table
CREATE TABLE process_data (
  id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  values TEXT NOT NULL,      -- JSON array
  statistic REAL NOT NULL,
  chart_type TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Alerts table
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  data TEXT,
  acknowledged INTEGER DEFAULT 0
);

-- Configuration table
CREATE TABLE configuration (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);
```

## Communication Flow

### Real-time Monitoring Flow

```
1. Client clicks "Start Monitoring"
   │
   ▼
2. WebSocket emits 'start_monitoring'
   │
   ▼
3. Backend initializes Phase I data
   │
   ▼
4. Backend calculates control limits
   │
   ▼
5. Backend starts data interval
   │
   ▼
6. For each sample:
   │
   ├─► Generate observation
   │
   ├─► Calculate statistic
   │
   ├─► Evaluate status
   │
   ├─► Store in database
   │
   └─► Emit to client
       │
       ▼
7. Client receives 'process_data'
   │
   ├─► Updates store
   │
   ├─► Triggers chart re-render
   │
   └─► Shows alert if needed
```

### Alert Flow

```
Out-of-control detected
   │
   ▼
Backend evaluates severity
   │
   ├─► Critical: T² > UCL
   │
   └─► Warning: T² > 0.8*UCL
       │
       ▼
Backend emits 'system_alert'
   │
   ▼
Client receives alert
   │
   ├─► Updates alerts store
   │
   ├─► Shows toast notification
   │
   └─► Increments unread counter
```

## Data Flow

### Phase I (Initialization)

```
Historical Data (30+ samples)
   │
   ▼
Calculate Statistics:
   ├─► Mean vector (μ)
   ├─► Covariance matrix (Σ)
   └─► Control limits (UCL, CL)
       │
       ▼
Store in SPC Engine
   │
   ▼
Ready for Phase II Monitoring
```

### Phase II (Monitoring)

```
New Observation (x)
   │
   ▼
Calculate T² = (x-μ)' Σ⁻¹ (x-μ)
   │
   ▼
Compare to UCL
   │
   ├─► T² > UCL → Critical
   ├─► T² > 0.8*UCL → Warning
   └─► T² ≤ 0.8*UCL → Normal
       │
       ▼
Calculate Contributions
   │
   ▼
Return Result + Contributions
```

## Scalability Considerations

### Current Limitations
- Single-server architecture
- In-memory SPC state
- SQLite database (single writer)
- WebSocket connections per server

### Scaling Strategies

**Horizontal Scaling**
- Add Redis for shared state
- Implement Socket.io Redis adapter
- Use PostgreSQL instead of SQLite
- Load balancer with sticky sessions

**Vertical Scaling**
- Increase server CPU for calculations
- Add RAM for larger datasets
- SSD storage for database

**Performance Optimization**
- Implement data sampling for charts
- Use Web Workers for calculations
- Cache control limits
- Batch database writes

## Security Architecture

### Transport Security
- HTTPS/TLS for HTTP traffic
- WSS for WebSocket connections
- CORS configuration
- CSP headers

### Application Security
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escaping)
- Rate limiting (to be implemented)

### Future Enhancements
- JWT authentication
- Role-based access control
- Audit logging
- Session management

## Deployment Architecture

### Docker Containers

```
┌─────────────────────────────┐
│   Docker Host               │
│                             │
│  ┌────────────────────────┐ │
│  │ Frontend Container     │ │
│  │ Nginx + Static Files   │ │
│  │ Port: 80               │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ Backend Container      │ │
│  │ Node.js + Express      │ │
│  │ Port: 5000             │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ Volume: spc-data       │ │
│  │ (Database persistence) │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

### Production Deployment

**Recommended Setup**
```
Internet
   │
   ▼
Cloud Load Balancer
   │
   ├─► Frontend Server (Static CDN)
   │
   └─► Backend Server
       │
       └─► Database (Managed)
```

## Monitoring & Observability

### Metrics to Monitor
- WebSocket connection count
- Data processing rate (samples/sec)
- Database size
- Memory usage
- CPU utilization
- Alert frequency

### Logging Strategy
- Application logs (Winston/Pino)
- Access logs (Morgan)
- Error tracking (Sentry)
- Performance metrics (DataDog/New Relic)

## Technology Choices

### Frontend
- **React**: Component reusability, large ecosystem
- **Vite**: Fast builds, HMR, ES modules
- **Zustand**: Simple state management
- **Recharts**: React-native charts, good for real-time
- **TailwindCSS**: Utility-first, fast development

### Backend
- **Node.js**: Non-blocking I/O, good for real-time
- **Express**: Mature, middleware ecosystem
- **Socket.io**: WebSocket with fallbacks
- **SQLite**: Embedded, zero-config, sufficient for medium scale
- **Math.js**: Matrix operations, statistical functions

## Future Enhancements

### Planned Features
1. **Authentication System**
   - User registration/login
   - JWT tokens
   - Role-based access

2. **Advanced Analytics**
   - Multivariate capability indices
   - Process capability studies
   - Trend analysis
   - Forecasting

3. **Integration**
   - OPC UA for industrial data
   - REST API for external systems
   - Database connectors
   - SCADA integration

4. **Machine Learning**
   - Anomaly detection
   - Pattern recognition
   - Predictive maintenance
   - Adaptive control limits

5. **Reporting**
   - Automated reports
   - Email notifications
   - PDF generation
   - Excel exports with charts

## Maintenance

### Regular Tasks
- Database cleanup (old data)
- Log rotation
- Security updates
- Dependency updates
- Performance monitoring
- Backup verification

### Backup Strategy
- Daily database backups
- Configuration versioning
- Code repository backups
- Restore testing

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Deployment
```bash
# Build
npm run build

# Docker
docker-compose up -d

# Manual
npm start
```

## Performance Benchmarks

### Target Metrics
- Page load: < 2 seconds
- Time to interactive: < 3 seconds
- WebSocket latency: < 100ms
- Data processing: 100 samples/sec
- Chart update: < 50ms
- Database query: < 100ms

### Optimization Applied
- Code splitting
- Lazy loading
- Gzip compression
- Asset minification
- Database indexing
- Efficient algorithms

## Conclusion

This architecture provides a solid foundation for real-time SPC monitoring with room for growth and enhancement. The modular design allows for easy maintenance and feature additions while maintaining performance and reliability.
