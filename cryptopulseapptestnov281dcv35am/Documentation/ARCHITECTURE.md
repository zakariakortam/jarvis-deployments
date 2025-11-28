# Crypto Pulse - Architecture Documentation

## System Overview

Crypto Pulse is a real-time cryptocurrency dashboard built with a modern, production-ready architecture featuring separate frontend and backend services orchestrated via Docker Compose.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Docker Host                          │
│                                                              │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │   Frontend (Nginx)  │         │   Backend (Node.js)  │    │
│  │   Port: 80         │         │   Port: 8000        │    │
│  │                    │         │                     │    │
│  │  - React SPA       │◄────────┤  - Express API      │    │
│  │  - Static Assets   │  HTTP   │  - WebSocket Server │    │
│  │  - Nginx Proxy     ├────────►│  - Mock Data Layer  │    │
│  │                    │ /api/*  │                     │    │
│  │                    │ /ws     │                     │    │
│  └────────────────────┘         └─────────────────────┘    │
│           │                               │                  │
│           └───────────────┬───────────────┘                  │
│                           │                                  │
│                  crypto-pulse-network                        │
│                    (Docker Bridge)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    External Clients
                 (Browsers, Mobile Apps)
```

## Component Architecture

### Frontend Service

**Technology Stack:**
- React 18.2.0 (UI library)
- Vite 5.1.0 (Build tool)
- Tailwind CSS 3.4.0 (Styling)
- Framer Motion 11.0.0 (Animations)
- Recharts 2.12.0 (Charts)
- Nginx Alpine (Production server)

**Key Components:**

1. **ParticleBackground**
   - Canvas-based animation system
   - 100 particles with physics simulation
   - Connection lines between nearby particles
   - Performance optimized with RAF

2. **CryptoCard**
   - Glassmorphism design with backdrop blur
   - Animated border glow effects
   - Real-time price change animations
   - Sparkline mini-chart integration
   - Click handler for modal chart view

3. **PriceChart**
   - Full 24-hour price history visualization
   - Recharts AreaChart with gradient fills
   - Custom tooltip with formatted data
   - Statistics display (current, high, low)

4. **Sparkline**
   - Compact line chart for card preview
   - Minimal Recharts configuration
   - Color-coded by price direction

5. **useWebSocket Hook**
   - WebSocket connection management
   - Automatic reconnection with exponential backoff
   - Connection state tracking
   - Error handling and logging

6. **API Service**
   - Centralized HTTP client
   - Environment-aware base URL
   - Error handling with custom ApiError class
   - JSON parsing and validation

**Nginx Configuration:**
- Serves static React build from `/usr/share/nginx/html`
- Proxies `/api/*` to backend service
- Proxies `/ws` WebSocket to backend
- Configures MIME types for JavaScript modules
- Implements SPA routing (all routes → index.html)
- Gzip compression for text assets
- Cache headers for static assets

### Backend Service

**Technology Stack:**
- Node.js 18+ (Runtime)
- Express.js 4.18.2 (HTTP framework)
- ws 8.16.0 (WebSocket library)
- CORS 2.8.5 (Cross-origin support)

**Architecture Layers:**

1. **Server Layer** (`server.js`)
   - HTTP server creation
   - WebSocket server initialization
   - CORS configuration
   - Route mounting
   - Health check endpoint
   - Price update broadcast loop (3s interval)
   - Graceful shutdown handling

2. **Routes Layer** (`src/routes/`)
   - RESTful endpoint definitions
   - Route-level middleware
   - Request validation
   - Response formatting

3. **Controllers Layer** (`src/controllers/`)
   - Business logic implementation
   - Data transformation
   - Error handling
   - Response construction

4. **Models Layer** (`src/models/`)
   - Data structure definitions
   - Mock data generation
   - Price simulation algorithms
   - History management

5. **Services Layer** (`src/services/`)
   - WebSocket message broadcasting
   - Client connection management
   - Price update orchestration

**Data Flow:**

```
Client Request
    │
    ▼
Express Router
    │
    ▼
Controller
    │
    ├─► Model (fetch/update data)
    │
    ▼
Response (JSON)


WebSocket Flow:
    │
Client Connect ──► WebSocket Server
    │                    │
    │                    ▼
    │            Store connection
    │                    │
    │            ┌───────┴────────┐
    │            │                │
    │        Interval        onMessage
    │        (3 seconds)      Handler
    │            │                │
    │            ▼                │
    │    Update Prices            │
    │            │                │
    │            ▼                │
    └────── Broadcast ◄───────────┘
           to all clients
```

## Data Model

### Cryptocurrency Object

```typescript
interface Cryptocurrency {
  id: string;           // Unique identifier
  symbol: string;       // Trading symbol (BTC, ETH)
  name: string;         // Full name
  basePrice: number;    // Starting price for simulation
  icon: string;         // Unicode character
  color: string;        // Hex color code
  volatility: number;   // Price fluctuation % (0.02 = 2%)
}
```

### Price Data

```typescript
interface PriceData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;    // Percentage change
  icon: string;
  color: string;
  marketCap: number;
  volume24h: number;
}
```

### Historical Data Point

```typescript
interface HistoricalPoint {
  timestamp: number;    // Unix milliseconds
  price: number;
  volume: number;
}
```

## Price Simulation Algorithm

```javascript
function generatePriceFluctuation(coin) {
  // Get current price
  const currentPrice = currentPrices.get(coin.id);

  // Generate random factor within volatility range
  // Random value between (1 - volatility) and (1 + volatility)
  const randomFactor = 1 + (Math.random() - 0.5) * coin.volatility;

  // Calculate new price
  const newPrice = currentPrice * randomFactor;

  // Bound price to reasonable range (70-130% of base)
  const minPrice = coin.basePrice * 0.7;
  const maxPrice = coin.basePrice * 1.3;
  const boundedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

  return boundedPrice;
}
```

**Characteristics:**
- Realistic price movement simulation
- Bounded volatility prevents extreme swings
- Each coin has unique volatility characteristics
- Prices stay within reasonable range of base price
- Change percentage calculated from previous price

## State Management

### Backend State

**In-Memory Storage:**
- `currentPrices`: Map<coinId, price> - Current prices for all coins
- `priceHistory`: Map<coinId, HistoricalPoint[]> - 25 hours of data per coin

**Update Mechanism:**
- Prices update every 3 seconds via interval
- History limited to last 25 data points (rolling window)
- New price appended, oldest removed if > 25 points

### Frontend State

**React State Management:**
- `useState` for local component state
- No global state library (Redux/Context) - keeps bundle small
- WebSocket messages trigger state updates
- State updates trigger re-renders with animations

**State Flow:**
```
WebSocket Message
    │
    ▼
onMessage Handler
    │
    ▼
setCoins(updatedData)
    │
    ▼
Re-render Components
    │
    ▼
Framer Motion Animations
```

## Real-time Communication

### WebSocket Protocol

**Connection Lifecycle:**
1. Client initiates connection to `ws://host/ws`
2. Server accepts and stores connection
3. Server sends connection confirmation message
4. Server broadcasts price updates every 3 seconds
5. Client receives and processes updates
6. On disconnect, client attempts reconnection

**Reconnection Strategy:**
- Exponential backoff: 1s, 2s, 4s, 8s, 10s (max)
- Maximum 5 reconnection attempts
- Connection state tracked in UI (green/red indicator)
- Automatic cleanup on component unmount

**Message Format:**
```json
{
  "type": "messageType",
  "data": { /* payload */ },
  "timestamp": "ISO-8601"
}
```

## Security Considerations

### Current Implementation

1. **CORS**: Configurable origin (default: allow all)
2. **Input Validation**: API parameters validated before processing
3. **Error Handling**: Errors caught and logged, generic messages to client
4. **WebSocket**: No authentication (suitable for public data)
5. **Docker Isolation**: Services run in isolated containers
6. **No Secrets**: All configuration via environment variables

### Production Recommendations

1. **Authentication**: Implement JWT for WebSocket connections
2. **Rate Limiting**: Add express-rate-limit middleware
3. **HTTPS**: Use SSL/TLS certificates
4. **API Keys**: Require API keys for REST endpoints
5. **Input Sanitization**: Add additional validation layers
6. **DDoS Protection**: Use Cloudflare or similar CDN
7. **Monitoring**: Implement logging and alerting

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: Vite automatically splits by route
2. **Lazy Loading**: React.lazy() for large components
3. **Memoization**: React.memo() for expensive components
4. **Canvas Optimization**: RequestAnimationFrame for particles
5. **Asset Optimization**: Vite minifies and compresses
6. **Bundle Size**: ~200KB gzipped

### Backend Optimizations

1. **Event-Driven**: WebSocket uses event emitters
2. **Single Update Loop**: One interval for all clients
3. **Efficient Broadcasting**: Single message to all clients
4. **Memory Management**: Bounded history arrays
5. **No Database**: In-memory for zero latency

### Network Optimizations

1. **HTTP/2**: Nginx supports HTTP/2
2. **Gzip Compression**: Enabled for text assets
3. **Cache Headers**: Static assets cached 1 year
4. **WebSocket**: Persistent connection (no HTTP overhead)

## Deployment Architecture

### Docker Multi-Stage Build

**Frontend:**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
COPY . .
RUN npm ci && npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Benefits:**
- Small final image (~25MB)
- No dev dependencies in production
- Secure alpine base image
- Multi-stage caching speeds up rebuilds

**Backend:**
```dockerfile
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]
```

### Docker Compose Orchestration

**Services:**
- `backend`: Node.js server (exposed internally on 8000)
- `frontend`: Nginx server (exposed externally on 80)

**Network:**
- Internal bridge network: `crypto-pulse-network`
- Frontend proxies requests to `http://backend:8000`
- Docker DNS resolves service names

**Health Checks:**
- Backend: HTTP GET to `/health` every 30s
- Frontend depends on backend health

## Monitoring & Observability

### Current Implementation

**Logging:**
- Server startup/shutdown messages
- WebSocket connection events
- Price update broadcasts
- API request errors

**Health Checks:**
- `/health` endpoint returns uptime
- Docker healthcheck monitors backend

### Production Recommendations

1. **Structured Logging**: Winston or Pino
2. **Metrics**: Prometheus for metrics collection
3. **APM**: New Relic or DataDog for performance monitoring
4. **Error Tracking**: Sentry for error aggregation
5. **Uptime Monitoring**: External service (Pingdom, UptimeRobot)

## Scalability Considerations

### Current Limitations

- Single backend instance
- In-memory state (lost on restart)
- No load balancing
- No horizontal scaling

### Scaling Strategy

**Horizontal Scaling:**
1. **Backend**: Multiple instances behind load balancer
2. **State**: Move to Redis for shared state
3. **WebSocket**: Use Redis pub/sub for cross-instance messaging
4. **Database**: Add PostgreSQL for persistent data
5. **CDN**: Serve static frontend via CDN

**Architecture for Scale:**
```
Load Balancer (Nginx/HAProxy)
    │
    ├─► Backend Instance 1 ──┐
    │                         │
    ├─► Backend Instance 2 ──┼──► Redis (Pub/Sub & State)
    │                         │
    └─► Backend Instance 3 ──┘
```

## Technology Trade-offs

### Chosen Approach

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Mock data | No external API dependencies | Not real market data |
| In-memory state | Zero latency, simple | Lost on restart |
| WebSocket | Real-time updates | More complex than polling |
| Multi-service | Separation of concerns | More Docker overhead |
| No database | Simplicity | No persistence |
| Tailwind CSS | Rapid development | Larger HTML |
| Recharts | Feature-rich, React-native | Larger bundle vs d3.js |

### Alternative Approaches

1. **SSR with Next.js**: Better SEO, more complex
2. **GraphQL**: Flexible queries, more setup
3. **Server-Sent Events**: Simpler than WebSocket, uni-directional
4. **MongoDB**: Document storage, adds complexity
5. **Redis Cache**: Faster, requires infrastructure
6. **Material-UI**: Pre-built components, larger bundle

## Future Enhancements

### Short-term
- [ ] Persistent data layer (PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Mobile responsive improvements

### Long-term
- [ ] Real cryptocurrency API integration (CoinGecko, CoinMarketCap)
- [ ] Historical data export
- [ ] Advanced charting (candlesticks, indicators)
- [ ] Multi-currency support
- [ ] Social features (share, comments)
- [ ] Machine learning price predictions
- [ ] Progressive Web App (offline support)

## Development Workflow

```
Developer
    │
    ├─► Edit Code
    │       │
    │       ▼
    │   Vite HMR (Frontend)
    │   Nodemon (Backend)
    │       │
    │       ▼
    │   Test Locally
    │       │
    │       ▼
    ├─► Git Commit
    │       │
    │       ▼
    └─► Docker Build
            │
            ▼
        Deploy to Production
            │
            ▼
        Monitor & Iterate
```

## Conclusion

Crypto Pulse demonstrates a modern, production-ready architecture with clear separation of concerns, real-time capabilities, and deployment-ready containerization. The system is designed for ease of development while maintaining production-grade practices.
