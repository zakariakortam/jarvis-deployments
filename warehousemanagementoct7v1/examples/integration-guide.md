# Integration Guide

This guide explains how to integrate the Warehouse Management System with real backend services.

## Overview

The current system uses a client-side simulator for demonstration. To integrate with real data:

1. Replace the simulator with API calls
2. Implement authentication
3. Configure backend endpoints
4. Add error handling and retry logic

## Backend Integration Points

### 1. Product Management

Replace `simulator.getProducts()` with API calls:

```javascript
// Before (Simulator)
const products = simulator.getProducts();

// After (Real API)
async function fetchProducts() {
    try {
        const response = await fetch('/api/v1/products', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}
```

### 2. Shipment Tracking

Replace `simulator.getShipments()` with real shipment data:

```javascript
async function fetchShipments(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/v1/shipments?${params}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return await response.json();
}
```

### 3. Real-Time Updates

Replace polling with WebSocket connections:

```javascript
class RealtimeUpdates {
    constructor() {
        this.ws = new WebSocket('wss://your-backend.com/ws');
        this.setupHandlers();
    }

    setupHandlers() {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'product_update':
                    this.handleProductUpdate(data.payload);
                    break;
                case 'shipment_update':
                    this.handleShipmentUpdate(data.payload);
                    break;
                case 'alert':
                    this.handleAlert(data.payload);
                    break;
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.reconnect();
        };
    }

    handleProductUpdate(product) {
        // Update specific product in the table
        updateProductRow(product);
        // Refresh charts if needed
        chartManager.updateInventoryChart();
    }

    reconnect() {
        setTimeout(() => {
            this.ws = new WebSocket('wss://your-backend.com/ws');
            this.setupHandlers();
        }, 5000);
    }
}
```

### 4. KPI Calculations

Move KPI calculations to backend:

```javascript
async function fetchKPIs() {
    const response = await fetch('/api/v1/analytics/kpis', {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return await response.json();
}
```

## API Endpoints

### Required Endpoints

#### Products
```
GET    /api/v1/products              - List all products
GET    /api/v1/products/:id          - Get single product
POST   /api/v1/products              - Create product
PUT    /api/v1/products/:id          - Update product
DELETE /api/v1/products/:id          - Delete product
```

#### Shipments
```
GET    /api/v1/shipments             - List shipments
GET    /api/v1/shipments/:id         - Get single shipment
POST   /api/v1/shipments             - Create shipment
PUT    /api/v1/shipments/:id         - Update shipment status
```

#### Analytics
```
GET    /api/v1/analytics/kpis        - Get current KPIs
GET    /api/v1/analytics/orders      - Get order history
GET    /api/v1/analytics/movements   - Get stock movements
GET    /api/v1/analytics/suppliers   - Get supplier metrics
```

#### Alerts
```
GET    /api/v1/alerts                - Get active alerts
POST   /api/v1/alerts/:id/dismiss    - Dismiss alert
```

## Authentication

### JWT Implementation

```javascript
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    async login(username, password) {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        this.token = data.token;
        localStorage.setItem('auth_token', this.token);
        return data;
    }

    getToken() {
        return this.token;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    isAuthenticated() {
        return !!this.token;
    }
}

const auth = new AuthManager();
```

## Error Handling

### Retry Logic

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### User Notifications

```javascript
function showNotification(message, type = 'info') {
    // Implement toast notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stock_level INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL,
    max_stock INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    supplier_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_supplier ON products(supplier_id);
```

### Shipments Table
```sql
CREATE TABLE shipments (
    id VARCHAR(10) PRIMARY KEY,
    product_id VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    supplier_id VARCHAR(10) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    estimated_delivery TIMESTAMP NOT NULL,
    actual_delivery TIMESTAMP,
    fulfillment_time DECIMAL(5,1),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_product ON shipments(product_id);
CREATE INDEX idx_shipments_dates ON shipments(order_date, estimated_delivery);
```

### Suppliers Table
```sql
CREATE TABLE suppliers (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    performance_score INTEGER NOT NULL,
    avg_delivery_time INTEGER NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50)
);
```

## Performance Optimization

### Caching Strategy

```javascript
class CacheManager {
    constructor(ttl = 60000) { // 1 minute default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }
}

const cache = new CacheManager(30000); // 30 second cache
```

### Pagination

```javascript
async function fetchProductsPaginated(page = 1, limit = 50) {
    const response = await fetch(
        `/api/v1/products?page=${page}&limit=${limit}`,
        {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        }
    );
    return await response.json();
}
```

## Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **CORS**: Configure properly on backend
3. **Rate Limiting**: Implement to prevent abuse
4. **Input Validation**: Validate all user inputs
5. **SQL Injection**: Use parameterized queries
6. **XSS Protection**: Sanitize all displayed data

## Testing Integration

```javascript
// Mock API for testing
class MockAPI {
    constructor() {
        this.products = [];
        this.shipments = [];
    }

    async getProducts() {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.products), 100);
        });
    }

    async updateProduct(id, data) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...data };
            return this.products[index];
        }
        throw new Error('Product not found');
    }
}

// Use in development
const api = process.env.NODE_ENV === 'development'
    ? new MockAPI()
    : new RealAPI();
```

## Migration Path

1. **Phase 1**: Keep simulator, add API layer
2. **Phase 2**: Implement authentication
3. **Phase 3**: Replace simulator with cached API calls
4. **Phase 4**: Add WebSocket for real-time updates
5. **Phase 5**: Full backend integration
6. **Phase 6**: Remove simulator code

This gradual approach ensures the system remains functional throughout migration.
