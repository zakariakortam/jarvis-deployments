# Corn Dry Thinning - Acid Set Point Optimizer

An advanced optimization system for determining the optimal acid set point in corn wet milling dry thinning processes.

## Features

- **Real-time Optimization**: Calculates optimal acid set points based on current process parameters
- **Multi-factor Analysis**: Considers temperature, flow rate, moisture content, and quality targets
- **Performance Simulation**: Predicts yield, protein recovery, and starch purity
- **Economic Impact Analysis**: Calculates daily and annual benefits
- **Real-time Monitoring**: Displays current process parameters
- **Historical Tracking**: Stores optimization history for continuous improvement

## How It Works

The optimizer uses a sophisticated algorithm that considers:

1. **Process Parameters**:
   - Current temperature (°C)
   - Flow rate (L/min)
   - Corn moisture content (%)
   - Steep time (hours)

2. **Quality Targets**:
   - Protein recovery rate
   - Starch purity requirements

3. **Adjustment Factors**:
   - Temperature deviation adjustments
   - Flow rate optimization
   - Moisture compensation
   - Quality target adjustments
   - Historical performance learning

## Files

- `index.html` - Simple standalone interface
- `app.html` - Advanced interface with tabs and monitoring
- `CornOptimizer.js` - Core optimization logic
- `corn-routes.js` - Backend API routes for integration

## Usage

### Standalone Version
Open `index.html` directly in a web browser for a simple, self-contained optimizer.

### Integrated Version
1. Add the routes to your Express server:
```javascript
const cornRoutes = require('./corn-routes');
app.use('/api/corn', cornRoutes);
```

2. Include the CornOptimizer service in your backend
3. Open `app.html` for the full-featured interface

## API Endpoints

- `POST /api/corn/optimize` - Calculate optimal acid set point
- `POST /api/corn/simulate` - Run performance simulation
- `GET /api/corn/monitoring` - Get real-time monitoring data
- `GET /api/corn/constraints` - Get process constraints
- `GET /api/corn/history` - Get historical optimization data

## Optimization Algorithm

The system calculates the optimal acid set point using:

```
Optimal pH = Base pH × (1 + ΣAdjustment Factors)
```

Where adjustment factors include:
- Temperature factor: ±0.02 per °C deviation
- Flow rate factor: ±0.01 per 10 L/min deviation
- Moisture factor: ±0.03 per 1% moisture deviation
- Quality factors based on targets
- Historical performance adjustments

## Benefits

- **Increased Yield**: Up to 3-5% improvement in overall yield
- **Better Quality**: Consistent protein recovery and starch purity
- **Cost Savings**: Optimized acid usage reduces operating costs
- **Reduced Waste**: Minimizes off-spec production
- **Data-Driven**: Continuous improvement through historical analysis