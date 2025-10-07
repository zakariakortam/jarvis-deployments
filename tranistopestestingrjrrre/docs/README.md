# Transit Operations Dashboard

A real-time transit operations monitoring system that simulates and visualizes schedules, ridership, delays, and maintenance for up to 10,000 vehicles across trains, buses, and ride-share services.

## Features

### Real-Time Simulation
- **10,000 Vehicle Support**: Handles trains, buses, and ride-share vehicles simultaneously
- **Autonomous Operation**: Continuous mock data streams without placeholders
- **Realistic Behavior**:
  - Route generation with geographic coordinates
  - Delay simulation (weather, traffic, mechanical)
  - Maintenance scheduling with random intervals
  - Time-based ridership patterns (rush hours, midday, night)

### Live Visualizations

#### Interactive Map
- Real-time vehicle tracking with Leaflet.js
- Marker clustering for performance (handles 10k+ markers)
- Vehicle type filtering (train/bus/ride-share)
- Status indicators (active/delayed/maintenance)
- Route visualization
- Clickable markers with vehicle details

#### Performance Gauges
- Active vehicle count
- Average speed
- Total trips completed
- On-time performance rate

#### Time-Series Charts
- Average speed trends
- Active vehicle count over time
- Configurable time windows (15min, 1hr, 4hr, 24hr)
- Real-time updates with smooth animations

#### Trip Logs Table
- Sortable by all columns
- Filter by vehicle type and status
- Search by trip ID or route
- Pagination (20 rows per page)
- Export to CSV

## Architecture

```
transit-operations-dashboard/
├── index.html                 # Main dashboard entry point
├── src/
│   ├── core/
│   │   ├── TransitSimulator.js       # Vehicle simulation engine
│   │   └── DataStreamManager.js      # Real-time data streaming
│   └── components/
│       ├── LiveMap.js                # Leaflet map integration
│       ├── PerformanceGauges.js      # KPI metrics display
│       ├── TimeSeriesCharts.js       # Chart.js visualizations
│       └── TripLogsTable.js          # Trip logs table
├── config/
│   └── nginx.conf                    # NGINX configuration
├── docs/
│   └── README.md                     # Documentation
├── Dockerfile                        # Docker container definition
└── docker-compose.yml                # Docker Compose configuration
```

## Technologies

- **Frontend**: Vanilla JavaScript (ES6+)
- **Mapping**: Leaflet.js 1.9.4 + MarkerCluster 1.5.3
- **Charts**: Chart.js 4.4.0
- **Server**: NGINX (Alpine)
- **Deployment**: Docker

## Quick Start

### Using Docker

1. **Build and run**:
   ```bash
   docker-compose up -d
   ```

2. **Access dashboard**:
   Open browser to `http://localhost:8080`

3. **Stop**:
   ```bash
   docker-compose down
   ```

### Manual Deployment

1. **Serve with any static server**:
   ```bash
   # Using Python
   python -m http.server 8080

   # Using Node.js
   npx http-server -p 8080

   # Using PHP
   php -S localhost:8080
   ```

2. **Access dashboard**:
   Open browser to `http://localhost:8080`

## Usage

### Starting Simulation

1. Click **"Start Simulation"** button in sidebar
2. Vehicles will begin spawning automatically
3. Map updates every second with vehicle positions
4. Charts and gauges update in real-time

### Adjusting Vehicle Count

1. Use slider in sidebar (100-5000 vehicles)
2. Default: 1000 vehicles
3. Changes take effect on next simulation start

### Viewing Vehicle Details

- **Click vehicle marker** on map to see popup with:
  - Vehicle ID and type
  - Current route
  - Speed and passenger count
  - Status

### Filtering Data

- **Map**: Use layer controls to filter by vehicle type
- **Trip Logs**: Use dropdown filters for type/status
- **Search**: Filter trips by ID or route name

### Exporting Data

- Click **"Export CSV"** button in trip logs section
- Downloads filtered trip data with timestamp

## Performance Optimization

### Efficient Rendering
- Canvas-based map rendering for 10k+ markers
- Marker clustering when zoomed out
- Batch DOM updates to prevent flickering
- Debounced search/filter operations

### Memory Management
- Rolling window for time-series data (max 100 points)
- Automatic cleanup of old data points
- Efficient data structures (Maps for O(1) lookups)

### Update Cycles
- Simulation: 1 second intervals
- UI updates: Batched every 100ms
- Chart animations: Disabled during updates for smoothness

## Configuration

### Simulation Parameters

Edit `src/core/TransitSimulator.js`:

```javascript
{
  maxVehicles: 10000,          // Maximum vehicle count
  vehicleDistribution: {
    train: 0.2,                // 20% trains
    bus: 0.5,                  // 50% buses
    rideshare: 0.3             // 30% ride-share
  },
  updateInterval: 1000,        // Update frequency (ms)
  centerLat: 40.7128,          // Map center latitude
  centerLng: -74.0060          // Map center longitude
}
```

### NGINX Configuration

Edit `config/nginx.conf` for:
- Port changes
- Cache settings
- Security headers
- Compression options

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers supported

## System Requirements

- **CPU**: 2+ cores recommended for 5000+ vehicles
- **RAM**: 2GB minimum, 4GB recommended
- **Browser**: Modern browser with JavaScript enabled

## Troubleshooting

### Map Not Loading
- Check internet connection (Leaflet tiles require external access)
- Verify no console errors
- Try refreshing browser

### Slow Performance
- Reduce vehicle count using slider
- Close other browser tabs
- Try Chrome for best performance

### Simulation Not Starting
- Check browser console for errors
- Verify all JS files loaded correctly
- Clear browser cache and reload

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the project repository.
