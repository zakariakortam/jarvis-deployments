# Building Portfolio Dashboard

A production-ready, real-time building portfolio management dashboard with comprehensive analytics and monitoring capabilities.

## Features

### Core Functionality
- **Real-time Data Updates**: Continuous simulation of building metrics updating every 3 seconds
- **12 Building Portfolio**: Monitor multiple properties across different types and locations
- **Comprehensive Analytics**: 6 major dashboard categories with hundreds of datapoints
- **Dark Mode**: System preference detection with manual toggle
- **Data Export**: Export building data and reports in JSON format
- **Advanced Filtering**: Search, filter by type, location, and occupancy rate
- **Responsive Design**: Mobile-first design works on all screen sizes

### Dashboard Modules

#### 1. Occupancy & Leasing
- Historical occupancy rate trends
- Leasing timeline with 20+ events per building
- Real-time occupancy updates
- Available vs leased space tracking
- Lease status monitoring (New Lease, Renewal, Termination, Expansion)

#### 2. Space Utilization Heatmap
- 24-hour utilization tracking across all floors
- 7-day visualization
- Color-coded utilization levels (0-100%)
- Interactive floor-by-floor analysis
- Weekend vs weekday patterns

#### 3. Energy Usage
- Electricity, gas, and water consumption tracking
- 30-day historical data
- Cost analysis and trends
- Real-time usage monitoring
- Energy type breakdown

#### 4. Maintenance Cost Analytics
- Cost breakdown by type (Preventive, Reactive, Emergency, Planned)
- 12-month historical trends
- Category analysis (HVAC, Electrical, Plumbing, Elevators, Security, Cleaning, Landscaping)
- Monthly and annual totals
- Cost optimization insights

#### 5. Tenant Satisfaction
- 8 satisfaction categories with scoring
- Response rate tracking
- Historical trend analysis
- Radar chart visualization
- Real-time feedback monitoring

#### 6. Investment Performance
- Property value tracking (24-month history)
- ROI and Cap Rate calculations
- Revenue vs Expense analysis
- Net Operating Income (NOI) trends
- Investment performance metrics

## Technology Stack

- **Frontend**: React 18 with hooks
- **Build Tool**: Vite 5 with optimized production builds
- **Styling**: TailwindCSS with dark mode support
- **Charts**: Recharts for all visualizations
- **State Management**: Zustand for efficient state handling
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd building-portfolio-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_APP_TITLE=Building Portfolio Dashboard
VITE_UPDATE_INTERVAL=3000
VITE_SIMULATION_SPEED=1
```

## Project Structure

```
building-portfolio-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard/           # Main dashboard components
│   │   ├── Occupancy/           # Occupancy & leasing components
│   │   ├── SpaceUtilization/    # Heatmap visualization
│   │   ├── Energy/              # Energy monitoring
│   │   ├── Maintenance/         # Maintenance analytics
│   │   ├── TenantSatisfaction/  # Satisfaction tracking
│   │   ├── Investment/          # Investment analytics
│   │   └── common/              # Reusable UI components
│   ├── services/
│   │   └── dataSimulator.js     # Data generation engine
│   ├── store/
│   │   └── dashboardStore.js    # Zustand state management
│   ├── styles/
│   │   └── index.css            # Global styles & Tailwind
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Application entry point
├── public/                      # Static assets
├── docs/                        # Additional documentation
├── Dockerfile                   # Docker configuration
├── nginx.conf                   # Nginx server configuration
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

## Deployment

### Docker Deployment

The application includes production-ready Docker configuration:

```bash
# Build Docker image
docker build -t building-portfolio-dashboard .

# Run container
docker run -p 80:80 building-portfolio-dashboard
```

### Coolify Deployment

1. Push code to Git repository
2. Create new service in Coolify
3. Point to repository
4. Coolify will automatically detect Dockerfile and deploy
5. No additional configuration needed

The application includes:
- Optimized Dockerfile with multi-stage builds
- Nginx configuration with proper MIME types
- Security headers
- Gzip compression
- Cache control

## Features Deep Dive

### Real-time Simulation

The data simulator generates realistic building metrics including:
- **Occupancy**: 60-100% range with realistic fluctuations
- **Energy Usage**: Day/night and weekday/weekend patterns
- **Maintenance Events**: Random events with realistic distributions
- **Tenant Satisfaction**: Score variations across categories
- **Investment Performance**: Appreciation, revenue, and NOI calculations

### Data Export

Export building data for external analysis:
- JSON format
- Timestamped filenames
- Complete building information
- Current metrics snapshot

### Filtering & Search

Advanced filtering capabilities:
- Full-text search across building names and IDs
- Filter by building type (Office, Retail, Residential, Mixed-Use, Industrial)
- Filter by location (Downtown, Midtown, Uptown, Waterfront, Suburban, Tech District)
- Minimum occupancy rate filter

### Dark Mode

Automatic dark mode with:
- System preference detection
- Manual toggle in header
- Consistent color scheme across all components
- Smooth transitions

## Performance Optimizations

- Code splitting by route and vendor chunks
- Lazy loading for heavy components
- Optimized bundle size (<200KB gzipped)
- Efficient re-renders with Zustand
- Memoized chart components
- Responsive images and assets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Adding New Buildings

Edit `src/services/dataSimulator.js` and modify the `generateBuildings()` method:

```javascript
generateBuildings(count) {
  // Increase count parameter or customize building properties
}
```

### Customizing Update Interval

Modify `.env` file:

```env
VITE_UPDATE_INTERVAL=5000  # Update every 5 seconds
```

## Troubleshooting

### Build Issues

If build fails, ensure:
1. Node.js version >= 18.0.0
2. All dependencies installed (`npm install`)
3. No TypeScript errors
4. Proper file permissions

### Blank Page After Deployment

If you see a blank page:
1. Check browser console for errors
2. Verify `base: './'` in vite.config.js
3. Ensure nginx.conf is properly configured
4. Check that dist/index.html uses relative paths

### Dark Mode Not Working

If dark mode doesn't activate:
1. Check browser's system preference
2. Clear browser cache
3. Verify CSS variables in index.css
4. Check localStorage for saved preference

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues, questions, or contributions, please open an issue in the project repository.
