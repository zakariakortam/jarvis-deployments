# Warehouse Management System

A comprehensive, real-time warehouse management dashboard with live data simulation, inventory tracking, order flow monitoring, and performance analytics.

## Features

### Live Data Simulation
- **300+ Mock Products**: Simulated inventory across 5 categories (Electronics, Furniture, Clothing, Food, Tools)
- **150+ Active Shipments**: Real-time shipment tracking with status updates
- **Continuous Updates**: Stock levels, order statuses, and metrics update every 2-3 seconds
- **Historical Data**: 24-hour order history and 30-day stock movement trends

### Real-Time Dashboards

#### KPI Metrics
- **Total Inventory Value**: Live calculation with gauge visualization
- **Fill Rate**: Percentage of products in stock
- **Average Fulfillment Time**: Mean delivery time across all shipments
- **Reorder Alerts**: Count of products below reorder threshold

#### Live Charts
1. **Inventory Levels by Category**: Bar chart showing current stock vs. reorder points
2. **Order Flow (24h)**: Line chart tracking received, processed, and shipped orders
3. **Stock Movement Trends**: 30-day inbound/outbound movement visualization
4. **Supplier Performance**: Radar chart showing supplier performance scores

### Interactive Tables

#### Product Inventory Table
- **Sortable Columns**: Product ID, Name, Category, Stock Level, Reorder Point, Status, Supplier, Last Updated
- **Search**: Real-time filtering by product ID, name, or supplier
- **Filters**: Category and status filters
- **Status Indicators**: Color-coded badges (In Stock, Low Stock, Out of Stock)
- **Alert Highlighting**: Red highlighting for low/out of stock items

#### Shipments Table
- **Sortable Columns**: Order ID, Product ID, Quantity, Status, Supplier, Order Date, Est. Delivery, Fulfillment Time
- **Search**: Filter by order ID, product ID, or supplier
- **Status Filter**: Filter by shipment status (Pending, Processing, In Transit, Delivered)
- **Live Updates**: Shipment statuses progress automatically

### Supplier Metrics
- **5 Mock Suppliers**: Each with unique performance scores and delivery times
- **Performance Tracking**: 85-95% performance ratings
- **Delivery Time Analysis**: Average delivery times from 48-96 hours
- **Visual Comparison**: Radar chart for quick performance comparison

## Technical Architecture

### Components
1. **data-simulator.js**: Core simulation engine
   - Product generation and management
   - Shipment lifecycle simulation
   - Historical data maintenance
   - Supplier performance tracking

2. **charts.js**: Chart management
   - Chart.js integration
   - Real-time data updates
   - Gauge visualizations
   - Multi-chart coordination

3. **tables.js**: Table management
   - Dynamic sorting
   - Real-time filtering
   - Search functionality
   - Data presentation

4. **app.js**: Application controller
   - KPI updates
   - System time tracking
   - Alert monitoring
   - Export functionality

### Data Flow
```
DataSimulator (generates mock data)
    ↓
Charts & Tables (consume data)
    ↓
User Interface (displays real-time updates)
```

### Update Cycles
- **Stock Changes**: Every 2 seconds (10-20 products)
- **Shipment Updates**: Every 3 seconds (5-10 shipments)
- **New Orders**: Every 5 seconds (2-5 new shipments)
- **Historical Data**: Every 10 seconds
- **UI Refresh**: Every 2 seconds

## Usage

### Opening the Dashboard
Simply open `index.html` in a web browser. The system will automatically:
1. Generate 300 mock products
2. Create 150 active shipments
3. Initialize all charts and tables
4. Begin real-time simulation

### Interacting with Tables

#### Sorting
Click any column header to sort by that column. Click again to reverse sort direction.

#### Filtering Products
- **Search Bar**: Type to filter by product ID, name, or supplier
- **Category Dropdown**: Select a category to view only those products
- **Status Dropdown**: Filter by In Stock, Low Stock, or Out of Stock

#### Filtering Shipments
- **Search Bar**: Type to filter by order ID, product ID, or supplier
- **Status Dropdown**: Filter by Pending, Processing, In Transit, or Delivered

### Monitoring KPIs
- **Green Values**: Optimal performance
- **Orange Values**: Warning level
- **Red Values**: Critical level requiring attention

### Export Data
The system includes export functions (can be triggered via browser console):
```javascript
exportProductData();    // Export products to CSV
exportShipmentData();   // Export shipments to CSV
```

## Mock Data Details

### Product Fields
- Product ID (PRD00001 - PRD00300)
- Name (Category-specific)
- Category (5 categories)
- Stock Level (10-210 units)
- Reorder Point (20-70 units)
- Max Stock (4x reorder point)
- Unit Price ($10-$510)
- Supplier (5 suppliers)
- Status (In Stock, Low Stock, Out of Stock)
- Last Updated (timestamp)

### Shipment Fields
- Order ID (ORD000001 - ORD000200+)
- Product ID (references product)
- Quantity (10-110 units)
- Status (Pending, Processing, In Transit, Delivered)
- Supplier (matches product supplier)
- Order Date (last 7 days)
- Estimated Delivery (calculated from order date)
- Fulfillment Time (12-132 hours)

### Supplier Data
1. Global Electronics Ltd (95% performance, 48h avg delivery)
2. FastShip Industries (88% performance, 72h avg delivery)
3. Premium Goods Co (92% performance, 60h avg delivery)
4. Quick Supply Partners (85% performance, 96h avg delivery)
5. Reliable Wholesale Inc (90% performance, 54h avg delivery)

## Performance Notes

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design, may have performance variations

### Resource Usage
- Initial load: ~1-2 seconds
- Memory usage: ~50-100MB
- CPU usage: Minimal (updates are optimized)
- Chart rendering: Hardware accelerated

### Optimization Features
- Chart updates use 'none' animation mode for performance
- Table rendering uses innerHTML batching
- Event listeners are delegated where possible
- Data filtering is efficient with early exits

## Future Enhancements

Potential additions for production use:
1. Backend API integration
2. Real database connectivity
3. User authentication
4. Role-based access control
5. Advanced analytics and reporting
6. Email/SMS alerts for critical events
7. Barcode scanning integration
8. Mobile app companion
9. Multi-warehouse support
10. Predictive analytics for reorder optimization

## License

This is a demonstration system for educational and evaluation purposes.
