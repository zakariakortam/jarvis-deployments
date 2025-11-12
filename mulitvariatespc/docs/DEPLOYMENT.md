# Deployment Guide

## Production Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 20GB disk space

#### Steps

1. **Clone/Copy the application**
```bash
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/multivariate-spc-system
```

2. **Configure environment variables**

Create `.env` files:

Frontend (.env):
```env
VITE_API_URL=http://your-domain.com:5000
VITE_WS_URL=ws://your-domain.com:5000
```

Backend (.env):
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://your-domain.com
```

3. **Build and start containers**
```bash
docker-compose up -d --build
```

4. **Verify deployment**
```bash
docker-compose ps
docker-compose logs -f
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

#### Docker Commands

```bash
# View logs
docker-compose logs -f [frontend|backend]

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
docker-compose down
docker-compose up -d --build

# Backup database
docker cp multivariate-spc-backend:/app/database ./backup
```

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 18+
- npm 9+
- Nginx (for frontend)
- PM2 (for process management)

#### Backend Deployment

1. **Prepare the backend**
```bash
cd backend
npm ci --production
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Install PM2**
```bash
npm install -g pm2
```

4. **Start backend with PM2**
```bash
pm2 start server.js --name spc-backend
pm2 save
pm2 startup
```

5. **Monitor backend**
```bash
pm2 status
pm2 logs spc-backend
pm2 monit
```

#### Frontend Deployment

1. **Build frontend**
```bash
cd frontend
npm ci
npm run build
```

2. **Install Nginx**
```bash
sudo apt-get update
sudo apt-get install nginx
```

3. **Configure Nginx**

Create `/etc/nginx/sites-available/spc-system`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    # MIME types
    include /etc/nginx/mime.types;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Enable site and restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/spc-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 3: Cloud Platform Deployment

#### Coolify Deployment

1. **Connect repository**
   - Create new application in Coolify
   - Connect Git repository
   - Select branch

2. **Configure build**
   - Build command: `npm run build`
   - Start command: `npm start`
   - Port: 5000 (backend), 80 (frontend)

3. **Environment variables**
   - Add all variables from .env.example
   - Set production URLs

4. **Deploy**
   - Click Deploy
   - Monitor build logs
   - Verify health check

#### Heroku Deployment

**Backend:**
```bash
cd backend
heroku create spc-backend
heroku config:set NODE_ENV=production
git push heroku main
```

**Frontend:**
```bash
cd frontend
heroku create spc-frontend
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku-community/nginx
git push heroku main
```

#### AWS EC2 Deployment

1. **Launch EC2 instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - 20GB storage
   - Security group: ports 22, 80, 443, 5000

2. **Connect and setup**
```bash
ssh -i key.pem ubuntu@ec2-instance

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone application
git clone <repository-url>
cd multivariate-spc-system
```

3. **Deploy backend**
```bash
cd backend
npm ci --production
pm2 start server.js --name spc-backend
pm2 startup
pm2 save
```

4. **Deploy frontend**
```bash
cd frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/
```

5. **Configure Nginx** (as shown in manual deployment)

## SSL/TLS Configuration

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Database Management

### Backup Strategy

**Automated daily backup:**
```bash
# Create backup script
cat > /usr/local/bin/backup-spc-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/spc"
mkdir -p $BACKUP_DIR
cp /app/database/spc_data.db $BACKUP_DIR/spc_data_$DATE.db
# Keep only last 30 days
find $BACKUP_DIR -name "spc_data_*.db" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-spc-db.sh

# Add to crontab
crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-spc-db.sh
```

### Restore from Backup

```bash
# Stop backend
pm2 stop spc-backend

# Restore database
cp /backups/spc/spc_data_YYYYMMDD_HHMMSS.db /app/database/spc_data.db

# Start backend
pm2 start spc-backend
```

## Monitoring Setup

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs spc-backend --lines 100

# Monitor resources
pm2 monit

# Web dashboard
pm2 web
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt-get install htop iotop

# Check system resources
htop
df -h
free -m

# Check logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Application Monitoring

**Install monitoring agent (optional):**
- New Relic
- DataDog
- Sentry for error tracking

## Performance Tuning

### Node.js Optimization

```bash
# Set Node.js memory limit
pm2 start server.js --name spc-backend --node-args="--max-old-space-size=2048"

# Enable cluster mode for multiple cores
pm2 start server.js --name spc-backend -i max
```

### Nginx Optimization

```nginx
# Worker processes
worker_processes auto;
worker_connections 1024;

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 10m;

# Timeouts
keepalive_timeout 65;
```

### Database Optimization

```sql
-- Vacuum database periodically
VACUUM;

-- Analyze tables
ANALYZE;

-- Check integrity
PRAGMA integrity_check;
```

## Security Hardening

### Firewall Configuration

```bash
# UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Application Security

1. **Update dependencies regularly**
```bash
npm audit fix
npm update
```

2. **Secure environment variables**
```bash
chmod 600 .env
```

3. **Rate limiting** (add to backend)
```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use(limiter)
```

## Troubleshooting

### Frontend Issues

**Blank page:**
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build output
ls -la dist/

# Check asset paths in index.html
cat dist/index.html | grep src
```

**WebSocket not connecting:**
```bash
# Check CORS configuration
# Verify WebSocket URL in .env
# Check nginx WebSocket proxy
```

### Backend Issues

**Server not starting:**
```bash
# Check logs
pm2 logs spc-backend --err

# Check port availability
sudo lsof -i :5000

# Verify environment variables
pm2 env 0
```

**High memory usage:**
```bash
# Monitor memory
pm2 monit

# Restart application
pm2 restart spc-backend

# Increase memory limit
pm2 delete spc-backend
pm2 start server.js --node-args="--max-old-space-size=4096"
```

### Database Issues

**Database locked:**
```bash
# Check for stuck processes
lsof /app/database/spc_data.db

# Restart application
pm2 restart spc-backend
```

**Database corruption:**
```bash
# Check integrity
sqlite3 spc_data.db "PRAGMA integrity_check;"

# Restore from backup
cp /backups/spc/latest.db spc_data.db
```

## Health Checks

### Automated Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $BACKEND_STATUS -ne 200 ]; then
    echo "Backend unhealthy, restarting..."
    pm2 restart spc-backend
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ $FRONTEND_STATUS -ne 200 ]; then
    echo "Frontend unhealthy, checking nginx..."
    sudo systemctl status nginx
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk usage critical: ${DISK_USAGE}%"
fi
```

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration:**
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

**Redis for Session Storage:**
```javascript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

io.adapter(createAdapter(redis))
```

### Vertical Scaling

- Upgrade EC2 instance type
- Increase memory allocation
- Add more CPU cores
- Use SSD storage

## Maintenance Schedule

### Daily
- Monitor application logs
- Check system resources
- Verify backups completed

### Weekly
- Review security alerts
- Update dependencies
- Analyze performance metrics
- Clean old logs

### Monthly
- Security audit
- Performance review
- Database optimization
- Backup restoration test

## Rollback Procedure

```bash
# 1. Stop current version
pm2 stop spc-backend

# 2. Restore previous code
git checkout <previous-commit>
cd backend && npm ci

# 3. Restore database backup
cp /backups/spc/previous.db database/spc_data.db

# 4. Start application
pm2 start spc-backend

# 5. Verify functionality
curl http://localhost:5000/health
```

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Verify configuration
4. Test in staging environment
5. Contact system administrator

## Appendix

### Environment Variable Reference

**Frontend (.env):**
- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket server URL

**Backend (.env):**
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (production/development)
- `CORS_ORIGIN`: Allowed frontend origin
- `DATABASE_PATH`: SQLite database path
- `DATA_RETENTION_DAYS`: Data cleanup interval

### Port Reference

- **3000**: Frontend (development)
- **80**: Frontend (production HTTP)
- **443**: Frontend (production HTTPS)
- **5000**: Backend API and WebSocket

### Useful Commands

```bash
# System status
systemctl status nginx
pm2 status

# View logs
journalctl -u nginx -f
pm2 logs spc-backend --lines 100

# Resource usage
htop
df -h
du -sh /app/database

# Network
netstat -tulpn | grep :5000
lsof -i :80

# Database
sqlite3 spc_data.db ".tables"
sqlite3 spc_data.db "SELECT COUNT(*) FROM process_data;"
```
