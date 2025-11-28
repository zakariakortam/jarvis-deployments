# City Command Center

A production-ready, city-scale digital operations command center powered by hundreds of connected mock sensors with comprehensive monitoring modules.

## Features

### Urban Mobility Hub
- Live traffic congestion maps with real-time updates
- Intersection status monitoring with signal states
- Transit performance metrics and occupancy tracking
- Average speed and wait time analytics
- Critical intersection alerts

### Environmental Monitoring Grid
- Air quality index (AQI) tracking by zone
- Water quality monitoring with pH, turbidity, and dissolved oxygen
- Noise level monitoring with violation tracking
- Multi-pollutant tracking (PM2.5, PM10, CO2, NO2, O3)
- Zone-based environmental comparisons

### Infrastructure Health Suite
- Bridge structural integrity monitoring
- Vibration, stress, and corrosion tracking
- Traffic load analysis on infrastructure
- Inspection scheduling and alerts
- Digital twin metrics for each structure

### Utility Consumption Center
- Real-time power consumption and load monitoring
- Gas consumption and pressure tracking
- Water usage and quality metrics
- Cost analysis and renewable energy integration
- Leak detection and outage tracking

### Public Safety Console
- Live emergency event feed with severity scoring
- Resource allocation and dispatch tracking
- Incident status monitoring
- Response time analytics
- Priority-based event handling

### Smart Waste & Sanitation
- Bin fill level monitoring across zones
- Collection route optimization
- Efficiency tracking and analytics
- Urgent bin alerts
- Fleet management and scheduling

### Urban Planning Sandbox
- 10-year population growth projections
- Housing and employment forecasts
- Infrastructure and sustainability scores
- Zone-based development analysis
- Economic growth modeling

## Architecture

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom theme
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data**: Mock sensor data generator with real-time updates

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
city-command-center/
├── src/
│   ├── modules/
│   │   ├── UrbanMobilityHub.jsx
│   │   ├── EnvironmentalGrid.jsx
│   │   ├── InfrastructureHealth.jsx
│   │   ├── UtilityConsumption.jsx
│   │   ├── PublicSafetyConsole.jsx
│   │   ├── WasteSanitation.jsx
│   │   └── UrbanPlanning.jsx
│   ├── utils/
│   │   └── sensorData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── Dockerfile
├── nginx.conf
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t city-command-center .

# Run container
docker run -p 80:80 city-command-center
```

### Coolify Deployment

1. Connect your repository to Coolify
2. Coolify will automatically detect the Dockerfile
3. Deploy with one click
4. Access your application at the provided URL

The application includes:
- Dockerfile for containerized deployment
- nginx.conf for proper MIME type handling
- Optimized production build configuration

## Features Highlights

### Real-time Data Updates
- Sensor data updates every 5 seconds
- Live connection status indicator
- Timestamp of last update
- Automatic reconnection handling

### Interactive Dashboards
- 7 comprehensive monitoring modules
- Dynamic charts and visualizations
- Responsive grid layouts
- Collapsible sidebar navigation

### Enterprise-Grade UI
- Dark mode compatible
- Professional color scheme
- Smooth animations
- Accessible design

### Data Visualization
- Line charts for trends
- Bar charts for comparisons
- Area charts for distributions
- Radar charts for multi-dimensional data
- Pie charts for compositions

## Performance

- Bundle size optimized with code splitting
- Lazy loading of chart components
- Efficient re-rendering with React memoization
- Fast development with Vite HMR

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_UPDATE_INTERVAL=5000
VITE_ENABLE_DARK_MODE=true
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT

## Production Checklist

- [x] All features implemented and functional
- [x] Real-time data updates working
- [x] Responsive design across devices
- [x] Docker and nginx configuration
- [x] Production build optimized
- [x] Charts interactive and accurate
- [x] No console errors
- [x] Professional UI/UX
- [x] Deployment ready
