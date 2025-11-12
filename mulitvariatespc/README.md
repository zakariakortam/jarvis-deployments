# Multivariate SPC System

A production-ready real-time Multivariate Statistical Process Control (SPC) system for industrial process monitoring and fault diagnosis.

## Features

### Core SPC Capabilities
- **Hotelling's T² Chart**: Classic multivariate control chart for detecting overall process shifts
- **MEWMA (Multivariate EWMA)**: Exponentially weighted moving average for detecting small shifts
- **MCUSUM (Multivariate CUSUM)**: Cumulative sum chart for persistent shift detection
- **Variable Contribution Analysis**: Identify which variables contribute most to out-of-control signals
- **PCA Integration**: Dimensionality reduction for high-dimensional processes

### Real-time Monitoring
- WebSocket-based real-time data streaming
- Live control charts with automatic updates
- Instant alert notifications for out-of-control conditions
- Process status dashboard with key metrics
- Historical data analysis and trending

### User Interface
- Responsive dark/light mode design
- Interactive control charts with Recharts
- Contribution bar plots for fault diagnosis
- Real-time variable value monitoring
- Alert management system
- Configuration interface for process parameters

### Enterprise Features
- SQLite database for data persistence
- RESTful API for integration
- Docker deployment ready
- Configurable sampling intervals
- Data export capabilities (CSV, Excel, PDF)
- Historical data query and analysis

## Technology Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Zustand for state management
- Socket.io-client for WebSocket
- Recharts for data visualization
- Math.js for statistical calculations
- Framer Motion for animations

### Backend
- Node.js with Express
- Socket.io for WebSocket server
- Better-sqlite3 for database
- Math.js for SPC calculations
- Helmet for security

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone the repository**
```bash
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/multivariate-spc-system
```

2. **Install dependencies**

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

3. **Configure environment variables**

Frontend:
```bash
cd frontend
cp .env.example .env
# Edit .env if needed
```

Backend:
```bash
cd backend
cp .env.example .env
# Edit .env if needed
```

### Development

Run both frontend and backend in separate terminals:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be available at http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

### Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up -d
```

Access the application at http://localhost:3000

## Project Structure

```
multivariate-spc-system/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Layout/      # Main layout wrapper
│   │   │   ├── ControlChart/ # SPC control chart
│   │   │   └── ContributionPlot/ # Variable contributions
│   │   ├── pages/           # Route-based pages
│   │   │   ├── Dashboard/   # Main dashboard
│   │   │   ├── MonitoringPage/ # Real-time monitoring
│   │   │   ├── HistoricalAnalysis/ # Historical data
│   │   │   ├── AlertsPage/  # Alert management
│   │   │   └── ConfigurationPage/ # Settings
│   │   ├── services/        # API and WebSocket
│   │   │   └── websocket.js # WebSocket service
│   │   ├── store/           # Zustand state management
│   │   │   ├── spcStore.js  # SPC data store
│   │   │   └── themeStore.js # Theme preferences
│   │   ├── utils/           # Utility functions
│   │   │   └── spcCalculations.js # SPC algorithms
│   │   └── styles/          # Global styles
│   ├── Dockerfile           # Frontend container
│   ├── nginx.conf           # Nginx configuration
│   └── vite.config.js       # Vite build config
│
├── backend/
│   ├── src/
│   │   └── services/
│   │       ├── spcEngine.js # SPC calculation engine
│   │       ├── dataGenerator.js # Test data generator
│   │       └── database.js  # Database service
│   ├── server.js            # Express + Socket.io server
│   ├── Dockerfile           # Backend container
│   └── package.json
│
├── database/                # SQLite database files
├── docs/                    # Documentation
├── docker-compose.yml       # Multi-container orchestration
└── README.md
```

## Usage Guide

### 1. Starting Monitoring

1. Navigate to the **Real-time Monitoring** page
2. Click **Start Monitoring** button
3. The system will:
   - Initialize Phase I data (30 samples for control limits)
   - Calculate control limits based on Phase I data
   - Begin streaming real-time process data
   - Display live control charts

### 2. Viewing Control Charts

- Select chart type: Hotelling's T², MEWMA, or MCUSUM
- View real-time statistics plotted against control limits
- UCL (Upper Control Limit) shown in red
- CL (Center Line) shown in green
- Current process status indicated by dot color:
  - Green: Normal (in control)
  - Yellow: Warning (approaching limits)
  - Red: Critical (out of control)

### 3. Analyzing Contributions

- Enable "Variable Contribution Analysis"
- View bar chart showing which variables contribute to process shifts
- Higher percentages indicate variables responsible for out-of-control signals
- Use for root cause analysis and fault diagnosis

### 4. Managing Alerts

- View all system alerts in the **Alerts** page
- Alert types:
  - Critical: Process out of control
  - Warning: Process approaching limits
  - Info: System notifications
- Clear alerts after reviewing

### 5. Configuration

Configure process parameters in **Configuration** page:
- Add/remove process variables
- Set specification limits (LSL, USL)
- Adjust sampling interval
- Choose default chart type
- Enable/disable auto-export

### 6. Historical Analysis

- Select date range for analysis
- Load historical data
- Export data in multiple formats:
  - CSV for spreadsheet analysis
  - Excel for advanced reporting
  - PDF for documentation

## SPC Methodology

### Hotelling's T²
Multivariate extension of univariate control charts. Detects overall shifts in the process mean vector.

**Formula:**
```
T² = (x - μ)' Σ⁻¹ (x - μ)
```

**Use cases:**
- Monitoring multiple correlated variables
- Detecting large, sustained shifts
- Phase II monitoring after establishing Phase I limits

### MEWMA
Multivariate Exponentially Weighted Moving Average. Effective for detecting small to moderate shifts.

**Formula:**
```
z_t = λ(x_t - μ) + (1 - λ)z_{t-1}
T² = z_t' (Σλ/(2-λ))⁻¹ z_t
```

**Use cases:**
- Detecting small gradual shifts
- When λ is small (e.g., 0.1-0.3)
- Processes with slowly evolving changes

### MCUSUM
Multivariate Cumulative Sum. Optimal for detecting persistent shifts of known magnitude.

**Use cases:**
- Known shift magnitude
- Quick detection of sustained shifts
- Processes requiring fast response

### Variable Contributions
Identifies which variables are responsible for out-of-control signals.

**Formula:**
```
Contribution_i = Σ_j (x_i - μ_i) Σ⁻¹_{ij} (x_j - μ_j)
```

**Use cases:**
- Root cause analysis
- Fault diagnosis
- Process troubleshooting

## API Documentation

### REST Endpoints

**GET /health**
- Health check endpoint
- Returns: `{ status, timestamp, uptime }`

**GET /api/config**
- Get current configuration
- Returns: Configuration object

**POST /api/config**
- Update configuration
- Body: Configuration object
- Returns: `{ success, config }`

**GET /api/historical**
- Query historical data
- Query params: `startDate`, `endDate`, `variables`
- Returns: Array of historical data points

### WebSocket Events

**Client → Server:**
- `start_monitoring`: Begin real-time monitoring
- `stop_monitoring`: Stop data streaming
- `reset_control_limits`: Reset and recalculate limits
- `update_configuration`: Update monitoring parameters
- `request_historical_data`: Query historical data
- `export_data`: Export data in specified format

**Server → Client:**
- `process_data`: Real-time process observation
- `control_limits`: Control limit values
- `system_alert`: Alert notifications
- `config_update`: Configuration changes
- `historical_data`: Historical query results

## Performance Metrics

### Monitoring Capacity
- Data points per second: 10-100
- Maximum variables: 20
- Historical data retention: 30 days
- Real-time chart samples: 500

### System Requirements
- CPU: 2 cores minimum
- RAM: 2GB minimum
- Storage: 10GB for database
- Network: 1Mbps for WebSocket

## Security

### Implemented Measures
- Helmet.js for HTTP headers
- CORS configuration
- Input validation
- SQL injection prevention (parameterized queries)
- XSS protection
- Content Security Policy
- HTTPS ready

### Recommendations
- Deploy behind reverse proxy (nginx)
- Enable HTTPS/TLS
- Implement authentication (JWT, OAuth2)
- Set up firewall rules
- Regular security updates
- Monitor access logs

## Troubleshooting

### Frontend won't connect to backend
- Check VITE_WS_URL in frontend/.env
- Verify backend is running on correct port
- Check CORS configuration in backend
- Inspect browser console for errors

### WebSocket connection fails
- Verify backend server is running
- Check firewall rules allow WebSocket
- Ensure correct port configuration
- Try polling transport as fallback

### Control limits not appearing
- Need minimum 30 samples for Phase I
- Check data generation is working
- Verify SPC engine initialization
- Check browser console for errors

### Build fails
- Clear node_modules and reinstall
- Check Node.js version >= 18
- Verify all dependencies installed
- Check for TypeScript/JavaScript errors

## Contributing

This is a production application. For modifications:

1. Test changes thoroughly
2. Maintain code quality standards
3. Update documentation
4. Add unit tests
5. Follow existing code style

## License

Proprietary - All rights reserved

## Support

For issues or questions:
- Check documentation
- Review troubleshooting guide
- Check system logs
- Contact system administrator

## Version

Current version: 1.0.0
Release date: 2025
