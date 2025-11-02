# Deployment Guide

## Production Deployment

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Reverse proxy (nginx recommended)
- SSL certificate (Let's Encrypt or commercial)
- PostgreSQL or MongoDB (optional, for persistent storage)

## Environment Setup

### 1. Clone and Install

```bash
cd /path/to/deployment
git clone <repository-url> bof-spc-system
cd bof-spc-system
npm install
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
# Server Configuration
PORT=3000
API_PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRES_IN=24h

# Database (if using)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bof_spc
DB_USER=postgres
DB_PASSWORD=<secure-password>

# Industrial Integration
OPC_UA_ENDPOINT=opc.tcp://plc.plant.local:4840
SCADA_HOST=scada.plant.local
SCADA_PORT=502
MES_API_URL=http://mes.plant.local:8080

# Alert Configuration
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_FROM=alerts@plant.com
ALERT_EMAIL_TO=engineer@plant.com
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=alerts@plant.com
SMTP_PASSWORD=<smtp-password>

# Data Retention
DATA_RETENTION_DAYS=365
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24

# Security
CORS_ORIGIN=https://spc.plant.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Build Application

```bash
npm run build
```

### 4. Start Services

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start backend/server.js --name bof-spc-api

# Start frontend (if serving with Node)
pm2 start npm --name bof-spc-frontend -- run preview

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

#### Using systemd

Create `/etc/systemd/system/bof-spc-api.service`:

```ini
[Unit]
Description=BOF SPC System API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/bof-spc-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable bof-spc-api
sudo systemctl start bof-spc-api
sudo systemctl status bof-spc-api
```

## Nginx Configuration

### Basic Configuration

Create `/etc/nginx/sites-available/bof-spc`:

```nginx
upstream api_backend {
    server localhost:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name spc.plant.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name spc.plant.com;

    ssl_certificate /etc/letsencrypt/live/spc.plant.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/spc.plant.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend static files
    root /path/to/bof-spc-system/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API proxy
    location /api {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/bof-spc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000 5000

# Start application
CMD ["npm", "run", "server"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=bof_spc
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

## Database Setup

### PostgreSQL Schema

```sql
CREATE TABLE heats (
    id SERIAL PRIMARY KEY,
    heat_number VARCHAR(50) UNIQUE NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(6,2),
    carbon_content DECIMAL(5,4),
    oxygen_level DECIMAL(5,2),
    slag_basicity DECIMAL(4,2),
    phosphorus DECIMAL(5,4),
    sulfur DECIMAL(5,4),
    manganese DECIMAL(5,3),
    blow_time DECIMAL(5,2),
    oxygen_flow DECIMAL(6,2),
    slag_weight INTEGER,
    operator_id INTEGER,
    status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_heats_timestamp ON heats(timestamp DESC);
CREATE INDEX idx_heats_heat_number ON heats(heat_number);
CREATE INDEX idx_heats_status ON heats(status);
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs bof-spc-api

# Monitor resources
pm2 monit

# Status
pm2 status
```

### Log Files

Logs are stored in `./logs/`:
- `error.log` - Error logs
- `combined.log` - All logs

Rotate logs with logrotate:

```bash
/path/to/bof-spc-system/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
```

## Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR=/path/to/backups
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump bof_spc > $BACKUP_DIR/db_$DATE.sql

# Backup application data
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /path/to/bof-spc-system/data

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Schedule with cron:

```bash
0 2 * * * /path/to/backup-script.sh
```

## SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d spc.plant.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable firewall (UFW/iptables)
- [ ] Configure fail2ban for SSH
- [ ] Set up SSL/TLS certificates
- [ ] Enable security headers in nginx
- [ ] Restrict API rate limits
- [ ] Configure CORS properly
- [ ] Regular security updates
- [ ] Enable audit logging

## Performance Optimization

### Node.js Tuning

```bash
# Increase max old space size
NODE_OPTIONS="--max-old-space-size=4096"

# Enable V8 optimizations
NODE_OPTIONS="--optimize_for_size --max_old_space_size=4096"
```

### Nginx Tuning

```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs bof-spc-api

# Check environment
env | grep NODE_ENV

# Test manually
NODE_ENV=production node backend/server.js
```

### Database connection issues

```bash
# Test connection
psql -h localhost -U postgres -d bof_spc

# Check PostgreSQL status
sudo systemctl status postgresql
```

### WebSocket not connecting

- Check nginx WebSocket proxy configuration
- Verify firewall allows WebSocket connections
- Check browser console for errors

## Rollback Procedure

```bash
# Stop services
pm2 stop all

# Restore from backup
tar -xzf /path/to/backups/data_YYYYMMDD_HHMMSS.tar.gz

# Restore database
psql bof_spc < /path/to/backups/db_YYYYMMDD_HHMMSS.sql

# Start services
pm2 start all
```

## Health Checks

API health endpoint: `GET /health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-02T10:00:00Z"
}
```

## Support

For deployment issues:
- Check logs in `./logs/`
- Verify environment variables
- Test database connectivity
- Contact system administrator
