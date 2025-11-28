# Deployment Guide - Factory Monitor

## Pre-Deployment Checklist

Before deploying the Factory Monitor application, ensure all prerequisites are met:

### Build Validation

```bash
cd /home/facilis/workspace/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/factory-monitor

# Install dependencies
npm install

# Run production build
npm run build

# Verify build output
ls -la dist/
```

**Expected Output:**
- `dist/index.html` with relative asset paths (`./assets/`)
- `dist/assets/` directory with chunked JS and CSS files
- No build errors or warnings

### File Verification

Ensure these critical files exist:
- `Dockerfile` - Container build instructions
- `nginx.conf` - Web server configuration with proper MIME types
- `vite.config.js` - Must include `base: './'`

## Deployment Options

### Option 1: Coolify Deployment (Recommended)

Coolify provides the easiest deployment experience with automatic builds and health monitoring.

#### Step 1: Prepare Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Factory Monitor v1.0.0"

# Add remote repository
git remote add origin <your-git-url>
git push -u origin main
```

#### Step 2: Create Coolify Application

1. Log into Coolify dashboard
2. Click "New Application"
3. Select "Git Repository"
4. Connect your repository
5. Select branch (main/master)
6. Coolify auto-detects Dockerfile

#### Step 3: Configure Deployment

**Build Settings:**
- Build Pack: Dockerfile
- Dockerfile Location: `./Dockerfile`
- Port: 80

**Environment Variables:**
- Not required for basic operation
- Optional: Add custom variables from `.env.example`

#### Step 4: Deploy

1. Click "Deploy" button
2. Monitor build logs
3. Verify successful deployment
4. Access application via provided URL

**Expected Build Time:** 2-5 minutes

### Option 2: Docker Deployment

For manual Docker deployments on any server.

#### Build Docker Image

```bash
cd /home/facilis/workspace/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/factory-monitor

# Build image
docker build -t factory-monitor:latest .

# Verify image
docker images | grep factory-monitor
```

#### Run Container

```bash
# Run on port 80
docker run -d \
  --name factory-monitor \
  -p 80:80 \
  --restart unless-stopped \
  factory-monitor:latest

# Verify container is running
docker ps | grep factory-monitor

# Check logs
docker logs factory-monitor
```

#### Access Application

Open browser: `http://your-server-ip`

### Option 3: Traditional Server Deployment

For deployment on traditional web servers (Apache, Nginx).

#### Build Static Files

```bash
npm run build
```

#### Copy to Web Server

```bash
# Copy dist contents to web root
cp -r dist/* /var/www/html/factory-monitor/

# Or via SCP to remote server
scp -r dist/* user@server:/var/www/html/factory-monitor/
```

#### Configure Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/factory-monitor;
    index index.html;

    # Include the nginx.conf from the project
    include /path/to/project/nginx.conf;
}
```

#### Restart Web Server

```bash
sudo systemctl restart nginx
```

## Post-Deployment Verification

### Health Checks

1. **Application Loads:**
   - Navigate to deployment URL
   - Verify page loads without errors
   - Check browser console for errors

2. **Data Simulation:**
   - Observe real-time data updates (every 2 seconds)
   - Verify charts are animating
   - Check machine status changes

3. **Navigation:**
   - Test all navigation links
   - Verify routes work on page refresh
   - Check browser back/forward buttons

4. **Features:**
   - Dark mode toggle works
   - Machine detail pages load
   - Comparison mode functions
   - Export features generate PDFs/CSVs
   - Alarm acknowledgment works

### Performance Testing

```bash
# Using Lighthouse CLI
npm install -g lighthouse
lighthouse https://your-deployment-url --view

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### Browser Testing

Test on multiple browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### Issue: Blank Page After Deployment

**Symptoms:**
- Application loads but shows blank page
- Console error: "Failed to load module script: Expected a JavaScript module but the server responded with MIME type of ''"

**Solution:**
1. Verify `vite.config.js` has `base: './'`
2. Ensure `Dockerfile` and `nginx.conf` are present
3. Rebuild: `npm run build`
4. Check `dist/index.html` has relative paths (`./assets/`)

### Issue: SPA Routing Not Working

**Symptoms:**
- Direct URLs return 404
- Page refresh breaks navigation

**Solution:**
Ensure nginx.conf includes:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: Build Fails

**Common Errors:**

**Error: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Out of memory"**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Issue: Container Won't Start

**Check logs:**
```bash
docker logs factory-monitor
```

**Common fixes:**
- Port 80 already in use: Change to `-p 8080:80`
- Permission issues: Run with sudo or adjust user permissions

## Monitoring

### Application Monitoring

**Nginx Access Logs:**
```bash
docker exec factory-monitor tail -f /var/log/nginx/access.log
```

**Nginx Error Logs:**
```bash
docker exec factory-monitor tail -f /var/log/nginx/error.log
```

### Performance Monitoring

Monitor these metrics:
- Response times (should be < 100ms for static files)
- Memory usage (container should stay under 100MB)
- CPU usage (minimal, < 1% at idle)

### Uptime Monitoring

Recommended external monitoring:
- UptimeRobot
- Pingdom
- StatusCake

Configure HTTP checks to main URL.

## Scaling Considerations

### Horizontal Scaling

For high-traffic scenarios:

```bash
# Run multiple containers with load balancer
docker run -d -p 8001:80 factory-monitor:latest
docker run -d -p 8002:80 factory-monitor:latest
docker run -d -p 8003:80 factory-monitor:latest

# Configure load balancer (nginx, HAProxy, etc.)
```

### CDN Integration

For global distribution:
1. Deploy static files to CDN (CloudFlare, AWS CloudFront)
2. Update asset URLs in build configuration
3. Configure cache headers

### Container Orchestration

For production-grade deployments:
- Kubernetes deployment
- Docker Swarm
- AWS ECS/EKS

## Security Hardening

### Production Checklist

- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting enabled
- [ ] Regular updates scheduled
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

### SSL/TLS Configuration

For Coolify:
- Auto-SSL enabled via Let's Encrypt
- Automatic renewal

For manual setup:
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Maintenance

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Rebuild container
docker build -t factory-monitor:latest .
docker stop factory-monitor
docker rm factory-monitor
docker run -d --name factory-monitor -p 80:80 factory-monitor:latest
```

### Backup Strategy

**What to backup:**
- Application source code (Git repository)
- Configuration files
- Environment variables

**Not needed:**
- Node modules (reinstallable)
- Build artifacts (regenerated)
- Container images (rebuildable)

### Rollback Procedure

```bash
# Roll back to previous Git commit
git log --oneline
git checkout <previous-commit-hash>

# Rebuild and redeploy
npm run build
docker build -t factory-monitor:latest .
docker restart factory-monitor
```

## Support

For deployment issues:
1. Check troubleshooting section above
2. Review application logs
3. Verify all prerequisites are met
4. Contact development team with error details

## Version History

- v1.0.0 - Initial production release
  - 10 machine simulation
  - Real-time monitoring
  - Full dashboard suite
  - Export capabilities
  - Docker deployment ready
