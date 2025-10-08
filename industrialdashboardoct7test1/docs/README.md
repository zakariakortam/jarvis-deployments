# Industrial Dashboard - Factory Monitoring System

A comprehensive real-time industrial monitoring dashboard that visualizes hundreds of mock sensor data points from factory equipment. The dashboard provides live charts, performance gauges, and interactive data tables for monitoring industrial operations.

## Features

### 🔴 Real-Time Data Simulation
- **50 Equipment Units** across 8 factory zones
- **250+ Sensors** monitoring critical parameters
- Live data updates every second
- Realistic sensor behavior with drift, noise, and cyclic patterns

### 📊 Sensor Types Monitored
- **Temperature**: 20-150°C range with thermal cycling
- **Voltage**: 200-250V with power quality monitoring
- **Vibration**: 0-25 mm/s with harmonic analysis
- **Power**: 10-500 kW consumption tracking
- **Pressure**: 0-10 bar system monitoring
- **Speed**: 0-3000 RPM motor monitoring

### 📈 Visualization Components

#### Performance Gauges
- Overall Equipment Efficiency (OEE)
- System Health Score
- Average Uptime Percentage
- Production Throughput Rate

#### Real-Time Charts
- Temperature trends across zones
- Vibration monitoring for rotating equipment
- Power consumption tracking
- Voltage level monitoring
- Smooth animations with historical data

#### Interactive Tables
- Equipment status with real-time updates
- Sensor alerts (warning & critical)
- Critical alerts with acknowledgment
- Sortable columns
- Filter by zone, status, and search term
- Live data refresh

### 🎯 Key Metrics
- Total Equipment Count & Operational Status
- Active Sensors & Alert Counts
- Total Power Consumption
- Production Rate (units/hour)
- Average Efficiency Percentage
- Warning & Critical Sensor Counts

## Architecture

### Core Components

1. **SensorEngine.js** - Data simulation engine
   - Generates realistic sensor data
   - Manages equipment lifecycle
   - Calculates health metrics
   - Maintains historical data

2. **ChartEngine.js** - Visualization engine
   - Canvas-based rendering
   - Line charts with smooth curves
   - Circular gauge displays
   - Bar charts for comparisons
   - Real-time updates with animations

3. **Dashboard.js** - Main controller
   - Orchestrates all components
   - Handles data flow
   - Manages UI updates
   - Implements filtering and sorting

4. **styles.css** - Professional UI theme
   - Dark theme optimized for monitoring
   - Enterprise-grade design
   - Responsive layout
   - Accessible color scheme

## Usage

### Running the Dashboard

1. Open `index.html` in a modern web browser
2. The dashboard will automatically initialize
3. Data will begin streaming immediately
4. All visualizations update in real-time

### Controls

- **Zone Filter**: Filter equipment by factory zone
- **Status Filter**: Show only operational, warning, or critical equipment
- **Search**: Find specific equipment by name
- **Sort**: Click column headers to sort tables
- **Refresh**: Force immediate data refresh

### Equipment Zones
- Assembly Line A
- Assembly Line B
- Welding Station
- Paint Booth
- Quality Control
- Packaging
- Material Handler
- Press Shop

## Technical Details

### Data Generation
- 50 equipment units with 4-6 sensors each
- Total of 250+ active data streams
- Update frequency: 1 second
- Historical data retention: 100 points per sensor

### Performance
- Optimized canvas rendering
- Efficient data structures
- Minimal DOM manipulation
- Smooth 60 FPS animations

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
industrial-dashboard/
├── index.html              # Main entry point
├── assets/
│   └── styles.css         # Dashboard styling
├── src/
│   ├── sensorEngine.js    # Data simulation
│   ├── chartEngine.js     # Chart rendering
│   └── dashboard.js       # Main controller
├── docs/
│   └── README.md          # This file
├── config/
├── scripts/
└── examples/
```

## Customization

### Adding Sensor Types
Edit `sensorEngine.js` and add new sensor specifications in the `createSensor()` method.

### Modifying Update Frequency
Change `updateInterval` in the `SensorEngine` constructor (default: 1000ms).

### Adjusting Equipment Count
Modify the loop count in `SensorEngine.initialize()` method.

### Custom Zones
Add new zones in the `zones` array in `SensorEngine.initialize()`.

## Dependencies

- **None** - Pure vanilla JavaScript
- Uses modern Canvas API for rendering
- No external charting libraries required
- Web Fonts: Inter (Google Fonts)

## Performance Optimization

- Canvas-based rendering for high performance
- Efficient data structures (Maps)
- Minimal reflows and repaints
- Optimized update cycles
- Memory-efficient historical data storage

## Future Enhancements

- Export data to CSV/PDF
- Historical data replay
- Predictive maintenance alerts
- Equipment comparison views
- Multi-dashboard layouts
- Mobile responsive design
- Dark/light theme toggle

## License

Proprietary - Industrial Monitoring System

## Support

For issues or feature requests, contact the development team.
