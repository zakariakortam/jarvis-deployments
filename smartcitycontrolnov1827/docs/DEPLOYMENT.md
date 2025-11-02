# Smart City Control System - Deployment Guide

## Deployment Options

### 1. Local Development

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser

#### Steps

```bash
# Clone or navigate to project
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/smart-city-control

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Access at: `http://localhost:3000`

### 2. Production Build

#### Build Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build
npm run analyze
```

#### Build Output
- Location: `dist/`
- Optimized assets with hashing
- Gzipped files
- Source maps included

### 3. Docker Deployment

#### Single Container

```bash
# Build Docker image
docker build -t smart-city-control:1.0.0 .

# Run container
docker run -d \
  --name smart-city-control \
  -p 3000:3000 \
  --restart unless-stopped \
  smart-city-control:1.0.0

# View logs
docker logs -f smart-city-control

# Stop container
docker stop smart-city-control
```

#### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### 4. Coolify Deployment

#### Method A: Git Repository

1. **Push to Git**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Coolify Configuration**
- Navigate to Coolify dashboard
- Click "New Resource" → "Application"
- Select "Public Repository" or connect GitHub
- Enter repository URL

3. **Build Settings**
```yaml
Build Command: npm run build
Start Command: npm run preview
Port: 3000
Health Check Path: /
```

4. **Environment Variables**
```
VITE_APP_NAME=Smart City Control
VITE_SENSOR_UPDATE_INTERVAL=2000
VITE_MAP_CENTER_LAT=40.7128
VITE_MAP_CENTER_LNG=-74.0060
```

5. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Access via provided URL

#### Method B: Docker Image

1. **Build and Push Image**
```bash
# Build image
docker build -t your-registry/smart-city-control:1.0.0 .

# Push to registry
docker push your-registry/smart-city-control:1.0.0
```

2. **Coolify Configuration**
- Select "Docker Image"
- Enter image name
- Configure port mapping (3000)
- Deploy

### 5. Static Hosting (Netlify, Vercel, Cloudflare Pages)

#### Netlify

**netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Deploy:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### Vercel

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

Deploy:
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Cloudflare Pages

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `/`
3. Deploy

### 6. Traditional Server (VPS)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/smart-city-control/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Deployment Steps

```bash
# Build locally
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/smart-city-control/dist/

# Restart Nginx
ssh user@server 'sudo systemctl restart nginx'
```

### 7. PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Install serve globally
npm install -g serve

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'smart-city-control',
    script: 'serve',
    args: '-s dist -l 3000',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

## Environment Configuration

### Development (.env.development)
```bash
VITE_APP_NAME=Smart City Control (Dev)
VITE_SENSOR_UPDATE_INTERVAL=2000
VITE_MAP_CENTER_LAT=40.7128
VITE_MAP_CENTER_LNG=-74.0060
VITE_ENABLE_ANALYTICS=false
```

### Production (.env.production)
```bash
VITE_APP_NAME=Smart City Control
VITE_SENSOR_UPDATE_INTERVAL=2000
VITE_MAP_CENTER_LAT=40.7128
VITE_MAP_CENTER_LNG=-74.0060
VITE_ENABLE_ANALYTICS=true
```

## Health Checks

### Endpoint
- URL: `http://your-domain.com/`
- Expected: 200 OK
- Timeout: 10s

### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
```

### Monitoring Script
```bash
#!/bin/bash
while true; do
  if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "$(date): Application is healthy"
  else
    echo "$(date): Application is down - restarting"
    pm2 restart smart-city-control
  fi
  sleep 60
done
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle
npm run build
npm run analyze

# Check bundle size
du -sh dist/
```

### CDN Configuration
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
}
```

### Compression
- Gzip enabled by default
- Brotli available via server config
- Asset optimization in build

## SSL/TLS Configuration

### Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Config
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of config
}
```

## Backup Strategy

### Application Backup
```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups/smart-city-control"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
  /var/www/smart-city-control

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-smart-city.sh
```

## Rollback Procedure

### Docker Rollback
```bash
# Tag current version
docker tag smart-city-control:latest smart-city-control:backup

# Deploy previous version
docker run -d smart-city-control:1.0.0
```

### File-based Rollback
```bash
# Restore from backup
tar -xzf backup_20250127_020000.tar.gz -C /var/www/

# Restart services
sudo systemctl restart nginx
pm2 restart smart-city-control
```

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Container Won't Start**
```bash
# Check logs
docker logs smart-city-control

# Inspect container
docker inspect smart-city-control

# Rebuild image
docker-compose up -d --build
```

**Memory Issues**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## Monitoring and Logging

### Log Locations
- Docker: `docker logs smart-city-control`
- PM2: `pm2 logs smart-city-control`
- Nginx: `/var/log/nginx/access.log`

### Log Rotation
```bash
# /etc/logrotate.d/smart-city-control
/var/log/smart-city-control/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple application instances
- Shared state management (Redis)
- Session persistence

### Vertical Scaling
- Increase container resources
- Optimize build configuration
- Enable caching layers
- Use CDN for static assets

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Access logs enabled
- [ ] Error tracking configured

## Post-Deployment Validation

```bash
# Test health endpoint
curl -f http://your-domain.com/

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s http://your-domain.com/

# Verify SSL
curl -I https://your-domain.com/

# Check bundle size
curl -I https://your-domain.com/assets/index.js | grep content-length
```

## Support and Maintenance

### Regular Maintenance
- Weekly: Check logs for errors
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Performance review

### Update Procedure
```bash
# Update dependencies
npm update

# Test locally
npm run build
npm run preview

# Deploy update
# Follow deployment steps above
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-27
**Support**: Check README.md for contact information
