# Mitsubishi Electric Manufacturing Support System

A comprehensive manufacturing support application designed for factory-floor operations, featuring equipment maintenance tracking, issue reporting, QR code-based equipment identification, and role-based access control.

## Features

### 🏭 Equipment Management
- **Equipment Tracking**: Complete equipment inventory with specifications and location tracking
- **QR Code Integration**: Generate and scan QR codes for instant equipment access
- **Health Monitoring**: Real-time equipment health scoring and status tracking
- **Maintenance Scheduling**: Automated maintenance task scheduling and tracking

### 📱 Mobile-First Design
- **Progressive Web App (PWA)**: Install on mobile devices for native app experience
- **Offline Functionality**: Continue working even without internet connection
- **Touch-Friendly Interface**: Optimized for tablets and smartphones
- **QR Code Scanner**: Built-in camera integration for equipment identification

### 🔧 Maintenance Management
- **Preventive Maintenance**: Schedule recurring maintenance tasks
- **Maintenance History**: Complete history tracking with costs and parts used
- **Overdue Alerts**: Automatic alerts for overdue maintenance tasks
- **Technician Assignment**: Role-based task assignment and tracking

### ⚠️ Issue Reporting
- **Quick Issue Logging**: Mobile-optimized issue reporting forms
- **Photo Attachments**: Capture and attach photos to issues
- **Severity Classification**: Critical, high, medium, low severity levels
- **Downtime Tracking**: Automatic downtime calculation and reporting

### 📊 Supervisor Dashboards
- **Real-time Metrics**: Equipment status, maintenance KPIs, and issue trends
- **Performance Analytics**: Equipment utilization and technician performance
- **Alert Management**: Critical alerts and notification system
- **Reporting**: Comprehensive reporting with charts and graphs

### 👥 Role-Based Access Control
- **Operator**: Report issues, view assigned equipment
- **Technician**: Complete maintenance tasks, resolve issues
- **Supervisor**: Full system access, user management, analytics

### 🔄 Offline Capabilities
- **Service Worker**: Caches essential app functionality
- **Data Synchronization**: Automatic sync when connection is restored
- **Offline Actions**: Queue actions for later synchronization
- **Background Sync**: Seamless data synchronization

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication with bcrypt password hashing
- **QR Code** generation with qrcode library
- **Docker** containerization

### Frontend
- **React.js** with hooks and context API
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Recharts** for data visualization
- **Progressive Web App (PWA)** capabilities
- **Service Workers** for offline functionality

### Infrastructure
- **Docker Compose** for local development
- **Nginx** reverse proxy and load balancing
- **Redis** for caching and session storage
- **SSL/TLS** encryption support

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running locally)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mitsubishi-manufacturing
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Local Development

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies  
   cd ../client && npm install
   ```

2. **Set up environment variables**
   ```bash
   # Server environment
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```

3. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## Default Accounts

The system comes pre-configured with demo accounts:

- **Supervisor**: `admin` / `password123`
- **Technician**: `tech1` / `password123`
- **Operator**: `op1` / `password123`

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register (supervisor only)
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Equipment
```
GET    /api/equipment
GET    /api/equipment/:id
POST   /api/equipment (technician+)
PUT    /api/equipment/:id (technician+)
DELETE /api/equipment/:id (supervisor only)
POST   /api/equipment/:id/qr-code
```

### Maintenance
```
GET  /api/maintenance
GET  /api/maintenance/:id
POST /api/maintenance (technician+)
PUT  /api/maintenance/:id
POST /api/maintenance/:id/complete
GET  /api/maintenance/overdue
```

### Issues
```
GET  /api/issues
GET  /api/issues/:id
POST /api/issues
PUT  /api/issues/:id
PUT  /api/issues/:id/assign (technician+)
PUT  /api/issues/:id/close
```

### Dashboard
```
GET /api/dashboard/metrics
GET /api/dashboard/equipment-health
GET /api/dashboard/maintenance-schedule
GET /api/dashboard/alerts
GET /api/dashboard/performance (supervisor only)
```

## Mobile Installation

### iOS
1. Open Safari and navigate to the application URL
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm the installation

### Android
1. Open Chrome and navigate to the application URL
2. Tap the three dots menu
3. Select "Add to Home Screen" or "Install App"
4. Confirm the installation

## Offline Usage

The application automatically detects network connectivity and provides:

- **Cached Content**: Essential app functionality works offline
- **Queued Actions**: Form submissions are queued when offline
- **Automatic Sync**: Data synchronizes when connection is restored
- **Status Indicator**: Visual indicator shows online/offline status

## Security Features

- **Authentication**: JWT-based authentication with secure password hashing
- **Authorization**: Role-based access control for all endpoints
- **Data Validation**: Input validation and sanitization
- **Security Headers**: Comprehensive security headers implementation
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS**: SSL/TLS encryption support

## Performance Optimization

- **Database Indexing**: Optimized database indexes for fast queries
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **CDN Ready**: Static asset optimization for CDN deployment
- **Lazy Loading**: Component lazy loading for faster initial load
- **Service Workers**: Aggressive caching for offline performance

## Deployment

### Production Deployment

1. **Environment Configuration**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   export DB_HOST=your-db-host
   ```

2. **Build and Deploy**
   ```bash
   # Build the application
   docker-compose -f docker-compose.prod.yml build
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling

The application supports horizontal scaling:

- **Load Balancing**: Nginx handles load distribution
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session and data caching
- **Stateless Design**: Fully stateless API design

## Monitoring and Logging

- **Health Checks**: Built-in health check endpoints
- **Application Logs**: Structured logging with different levels
- **Performance Metrics**: Built-in performance monitoring
- **Error Tracking**: Comprehensive error handling and reporting

## Support and Maintenance

### Backup Strategy
- **Database Backups**: Automated PostgreSQL backups
- **File Storage**: Equipment photos and attachments backup
- **Configuration**: Environment and configuration backups

### Updates
- **Rolling Updates**: Zero-downtime deployment strategy
- **Database Migrations**: Automated schema migrations
- **Feature Flags**: Gradual feature rollout capability

## License

This project is proprietary software developed for Mitsubishi Electric manufacturing operations.

## Contact

For technical support or feature requests, please contact the development team.