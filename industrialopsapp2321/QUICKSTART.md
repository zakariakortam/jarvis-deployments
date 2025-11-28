# Quick Start Guide

Get the Industrial Operations Platform running in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Terminal/command line access

## Installation

```bash
cd industrial-operations-platform
npm install
```

Installation time: ~20 seconds

## Development

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

## First Look

After starting the dev server, you'll see:

1. **Global Overview** (default page)
   - Interactive world map with 11 plants
   - Real-time status indicators
   - KPI cards updating every 2 seconds

2. **Navigation Bar**
   - 7 modules accessible via top menu
   - Theme toggle (sun/moon icon)
   - Alert notifications bell

## Quick Tour

### 1. Explore the Map (10 seconds)
- Click any plant marker on the world map
- You'll be taken to that plant's Digital Twin

### 2. View Machine Room (20 seconds)
- See 15-25 machines in an interactive layout
- Click any machine to view real-time sensors:
  - Temperature
  - Vibration
  - Power
  - RPM
  - Efficiency
- Watch the temperature chart update every second

### 3. Process Lines (30 seconds)
- Click "Process Lines" in navigation
- Press "Play" button
- Watch the timeline animate through 5 production stages
- Observe 24-hour throughput charts

### 4. Energy Management (20 seconds)
- Click "Energy Management"
- Toggle "Peak Shaving" switch
- See real-time load curves
- View cost savings calculations

### 5. Quality Analytics (20 seconds)
- Click "Quality Analytics"
- View SPC (Statistical Process Control) chart
- See defect clustering
- Check batch traceability

### 6. Maintenance (15 seconds)
- Click "Maintenance"
- View predictive failure risks
- Check parts availability
- See maintenance schedule

### 7. Executive Dashboard (20 seconds)
- Click "Executive Dashboard"
- View 8 KPI cards with trends
- See 14-day performance charts
- Check regional comparisons

## Testing Features

### Real-time Updates
- Leave any page open
- Watch numbers and charts update automatically
- Updates happen every 1-3 seconds

### Theme Switching
- Click sun/moon icon (top right)
- Watch instant dark/light mode switch
- Preference is saved

### Responsive Design
- Resize browser window
- See layout adapt to different sizes
- Try on mobile device

### Navigation
- All 7 modules interconnected
- Click plant markers to jump to details
- Use top navigation for quick access

## Common Actions

### Switch Plants
```
Global Overview → Click plant marker → Digital Twin
```

### View Machine Details
```
Digital Twin → Click machine in layout → See live sensors
```

### Compare Regions
```
Executive Dashboard → View "Regional Performance" panel
```

### Monitor Alerts
```
Any page → Check bell icon (top right) → See alert count
```

## Production Build

Build for deployment:

```bash
npm run build
```

Build output: `dist/` folder (~309 KB gzipped)

Preview production build:

```bash
npm run preview
```

## Docker Deployment

Build and run container:

```bash
docker build -t industrial-ops .
docker run -p 80:80 industrial-ops
```

Access at: **http://localhost**

## Troubleshooting

### Port already in use
```bash
# Change port in vite.config.js or:
PORT=3001 npm run dev
```

### Build errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Slow performance
- Check browser console for errors
- Ensure Node.js 18+ is installed
- Close other resource-intensive apps

## Key Keyboard Shortcuts

- `Ctrl/Cmd + Click` - Open link in new tab
- `Esc` - Close modals (if any)
- `Tab` - Navigate interactive elements

## Data Updates

All data is mock/simulated:
- **Plants**: 11 across 4 regions
- **Machines**: 165+ with live sensors
- **Process Lines**: 33+ with 5 stages each
- **Quality Samples**: 5,500+ data points
- **Updates**: Every 1-3 seconds

## File Structure

```
src/
├── pages/              7 main modules
├── components/         Shared components
├── store/             State management
└── utils/             Mock data system
```

## Next Steps

1. Explore all 7 modules (5 minutes)
2. Read FEATURES.md for detailed documentation
3. Check README.md for architecture details
4. See DEPLOYMENT.md for production setup

## Support

- Check console for any errors
- Ensure all dependencies installed
- Verify Node.js version: `node --version`

## Summary

You now have a fully functional industrial operations platform with:
- 7 interconnected modules
- Real-time data updates
- Interactive visualizations
- Responsive design
- Dark/light mode

Enjoy exploring! 
