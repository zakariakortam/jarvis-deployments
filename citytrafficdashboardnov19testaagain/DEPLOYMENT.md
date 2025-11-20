# Deployment Guide - City Traffic Dashboard

This guide covers deploying the City Traffic Dashboard to production environments.

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Build Docker Image

```bash
# Navigate to project directory
cd /home/facilis/workspace/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/city-traffic-dashboard

# Build the image
docker build -t city-traffic-dashboard:latest .

# Run the container
docker run -d \
  --name traffic-dashboard \
  -p 80:80 \
  --restart unless-stopped \
  city-traffic-dashboard:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  traffic-dashboard:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Deploy with:
```bash
docker-compose up -d
```

### 2. Coolify Deployment

#### Prerequisites
- Coolify instance running
- Git repository with the code

#### Steps

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: City Traffic Dashboard"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Configure Coolify**
   - Log into Coolify dashboard
   - Click "New Application"
   - Select "Docker" as build pack
   - Enter repository URL
   - Set branch to `main`

3. **Environment Variables** (Optional)
   In Coolify, add environment variables if needed:
   - `VITE_UPDATE_INTERVAL=2000`
   - Custom map center coordinates
   - API endpoints (for future integration)

4. **Deploy**
   - Click "Deploy"
   - Coolify will detect the Dockerfile automatically
   - Build and deployment will start

5. **Access Application**
   - Use the URL provided by Coolify
   - Verify map loads correctly
   - Test dark mode toggle
   - Check data is updating every 2 seconds

### 3. Traditional VPS Deployment

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Nginx
- Node.js 18+
- PM2 (optional, for process management)

#### Steps

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install Nginx
   sudo apt install -y nginx

   # Install PM2 (optional)
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   cd /var/www
   git clone <your-repo-url> city-traffic-dashboard
   cd city-traffic-dashboard

   # Install dependencies
   npm ci --production

   # Build application
   npm run build
   ```

3. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/traffic-dashboard
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/city-traffic-dashboard/dist;
       index index.html;

       # Proper MIME types
       types {
           application/javascript js mjs;
           text/css css;
           text/html html;
           image/svg+xml svg;
           image/png png;
           image/jpeg jpg jpeg;
       }

       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/javascript application/json;
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/traffic-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL with Let's Encrypt** (Recommended)
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Pre-Deployment Checklist

Run these checks before deploying:

### 1. Build Validation

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Build for production
npm run build

# Check build output
ls -la dist/
```

Expected output:
- `dist/` folder created
- `index.html` present
- `assets/` folder with JS and CSS files
- No build errors

### 2. Verify Asset Paths

```bash
# Check that index.html uses relative paths
cat dist/index.html | grep "script"
```

Expected: `<script type="module" crossorigin src="./assets/index-*.js">`
NOT: `<script type="module" crossorigin src="/assets/index-*.js">`

If absolute paths found, ensure `vite.config.js` has `base: './'`

### 3. Test Production Build Locally

```bash
npm run preview
```

Open `http://localhost:4173` and verify:
- Map loads correctly
- Charts render with data
- Dark mode toggles work
- Events table populates
- Alerts appear
- Export functions work

### 4. Check File Sizes

```bash
# Check bundle size
du -sh dist/
du -h dist/assets/*.js
```

Target bundle size: <300KB total

## Post-Deployment Verification

After deployment, verify:

### 1. Application Health
- [ ] Application loads without errors
- [ ] No console errors in browser DevTools
- [ ] Map tiles load correctly
- [ ] Sensor markers appear on map

### 2. Functionality
- [ ] Data updates every 2 seconds
- [ ] Charts show live data
- [ ] Gauges animate smoothly
- [ ] Event table populates and updates
- [ ] Alerts appear for critical conditions
- [ ] Dark mode toggle works
- [ ] Export to CSV works
- [ ] Export to JSON works

### 3. Performance
- [ ] Initial load < 3 seconds
- [ ] No lag during updates
- [ ] Smooth animations
- [ ] Memory usage stable over time

### 4. Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

### 5. Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Common Deployment Issues

### Issue: Blank Page After Deployment

**Symptoms**: Application loads but shows blank page

**Cause**: Incorrect asset paths

**Solution**:
1. Check `vite.config.js` has `base: './'`
2. Rebuild: `npm run build`
3. Verify paths in `dist/index.html`
4. Redeploy

### Issue: Map Tiles Not Loading

**Symptoms**: Map shows gray background, no tiles

**Cause**: CSP blocking external resources

**Solution**:
1. Check nginx.conf CSP headers
2. Ensure `img-src` includes `https:`
3. Reload Nginx: `sudo systemctl reload nginx`

### Issue: MIME Type Errors

**Symptoms**: Console error about JavaScript MIME type

**Cause**: Server not configured for ES modules

**Solution**:
1. Use provided `nginx.conf` with correct MIME types
2. Ensure `application/javascript` is set for `.js` files
3. Restart Nginx

### Issue: Memory Leak

**Symptoms**: Browser tab uses increasing memory

**Cause**: Unbounded data growth

**Solution**: Application already has data retention limits:
- Events: 500 max
- Alerts: 50 max
- Historical data: 30 points

### Issue: Updates Stop Working

**Symptoms**: Data stops updating after some time

**Cause**: Interval cleanup issue

**Solution**:
1. Check browser console for errors
2. Refresh page
3. Verify no JavaScript errors in production build

## Scaling Considerations

### For Higher Traffic

1. **Enable Nginx Caching**
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=static_cache:10m;

   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       proxy_cache static_cache;
       proxy_cache_valid 200 1y;
   }
   ```

2. **CDN Integration**
   - Serve static assets through CDN
   - Update `base` in `vite.config.js` to CDN URL

3. **Load Balancing**
   - Deploy multiple instances
   - Use Nginx or HAProxy for load balancing

### For Real-Time Data Integration

When integrating with real traffic APIs:

1. **Backend Service**
   - Create separate backend service for API integration
   - Use WebSocket for real-time updates
   - Implement rate limiting

2. **Caching Layer**
   - Redis for session data
   - Cache aggregated statistics

3. **Database**
   - PostgreSQL with TimescaleDB for time-series data
   - Store historical traffic data

## Monitoring

### Application Logs

For Docker:
```bash
docker logs -f traffic-dashboard
```

For Nginx:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks

The Docker container includes a health check:
```bash
docker inspect --format='{{.State.Health.Status}}' traffic-dashboard
```

### Performance Monitoring

Use browser DevTools:
1. Open DevTools (F12)
2. Go to Performance tab
3. Record 30 seconds of usage
4. Check for memory leaks or performance bottlenecks

## Backup and Recovery

### Backup Strategy

The application is stateless, so backup requirements are minimal:

1. **Code Repository**: Ensure code is in Git
2. **Configuration**: Backup `.env` files
3. **Custom Changes**: Document any customizations

### Recovery

To recover from failure:

```bash
# Stop failed container
docker stop traffic-dashboard
docker rm traffic-dashboard

# Rebuild and redeploy
docker build -t city-traffic-dashboard:latest .
docker run -d --name traffic-dashboard -p 80:80 city-traffic-dashboard:latest
```

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build

# For Docker
docker build -t city-traffic-dashboard:latest .
docker stop traffic-dashboard
docker rm traffic-dashboard
docker run -d --name traffic-dashboard -p 80:80 city-traffic-dashboard:latest
```

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test
npm run build
npm run preview

# Commit updated package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **CSP**: Content Security Policy configured in nginx.conf
3. **Headers**: Security headers enabled
4. **Dependencies**: Keep dependencies updated
5. **Secrets**: Never commit API keys or secrets

## Support and Troubleshooting

For deployment issues:

1. Check application logs
2. Verify Nginx configuration
3. Test locally with production build
4. Review browser console for errors
5. Check network tab for failed requests

## Performance Tuning

### Nginx Optimization

```nginx
# Worker processes
worker_processes auto;

# Connection settings
events {
    worker_connections 1024;
    use epoll;
}

# Keepalive
keepalive_timeout 65;
keepalive_requests 100;

# Buffer sizes
client_body_buffer_size 10K;
client_header_buffer_size 1k;
client_max_body_size 8m;
large_client_header_buffers 2 1k;
```

### Application Optimization

Already implemented:
- Code splitting
- Tree shaking
- Minification
- Gzip compression
- Asset caching

## Conclusion

The City Traffic Dashboard is production-ready with:
- Docker containerization
- Nginx configuration
- Health checks
- Security headers
- Performance optimization

Follow this guide for successful deployment to any environment.
