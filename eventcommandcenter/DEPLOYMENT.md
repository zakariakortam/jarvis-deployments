# Deployment Guide - Event Command Center

## Pre-Deployment Checklist

Before deploying, ensure:

- [x] Production build completes successfully
- [x] All dependencies are listed in package.json
- [x] Environment variables are documented
- [x] Dockerfile and nginx.conf are present
- [x] Security headers are configured
- [x] Static assets use relative paths

## Local Validation

### Build Test
```bash
cd /path/to/event-command-center
npm install
npm run build
```

Expected output:
- `dist/` folder created
- No build errors
- Bundle sizes within acceptable limits

### Preview Test
```bash
npm run preview
```
- Open http://localhost:4173
- Verify all features work
- Check browser console for errors
- Test dark/light theme toggle
- Verify real-time data updates

## Docker Deployment

### Build Image
```bash
docker build -t event-command-center:latest .
```

### Run Locally
```bash
docker run -d -p 8080:80 --name event-center event-command-center:latest
```

Test: http://localhost:8080

### Push to Registry
```bash
# Tag for registry
docker tag event-command-center:latest registry.example.com/event-command-center:latest

# Push
docker push registry.example.com/event-command-center:latest
```

## Coolify Deployment

### Method 1: Git Repository

1. **Prepare Repository**
   - Push code to Git (GitHub, GitLab, Bitbucket)
   - Ensure Dockerfile is in root
   - Add .gitignore for node_modules

2. **Create Application in Coolify**
   - New Application → Public Repository
   - Enter repository URL
   - Branch: main or master
   - Build Pack: Dockerfile

3. **Configure Environment Variables**
   ```
   VITE_APP_NAME=Event Command Center
   VITE_MOCK_DATA_ENABLED=true
   VITE_DATA_UPDATE_INTERVAL=2000
   ```

4. **Deploy**
   - Click "Deploy"
   - Monitor build logs
   - Wait for "Running" status

### Method 2: Docker Image

1. **Push Image to Registry**
   ```bash
   docker push your-registry.com/event-command-center:latest
   ```

2. **Create Application in Coolify**
   - New Application → Docker Image
   - Image: your-registry.com/event-command-center:latest
   - Port: 80

3. **Deploy**
   - Click "Deploy"

## Environment Variables

### Required Variables
None - application works with defaults

### Optional Variables
```env
# Application Identity
VITE_APP_NAME=Event Command Center
VITE_APP_VERSION=1.0.0

# API Configuration (if using real backend)
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# Mock Data (for demo)
VITE_MOCK_DATA_ENABLED=true
VITE_DATA_UPDATE_INTERVAL=2000
```

## Domain Configuration

### Coolify Custom Domain

1. Go to Application Settings
2. Add Domain: `events.yourdomain.com`
3. Enable SSL (Let's Encrypt)
4. Wait for DNS propagation
5. Test: https://events.yourdomain.com

### DNS Records

Point your domain to Coolify server:

```
Type: A
Name: events (or @ for root)
Value: [Coolify Server IP]
TTL: 3600
```

For SSL:
```
Type: CNAME
Name: _acme-challenge.events
Value: [provided by Coolify]
```

## Nginx Configuration

The included `nginx.conf` handles:

- Proper MIME types for JavaScript modules
- SPA routing (all routes → index.html)
- Gzip compression
- Static asset caching
- Security headers

**Important**: Do not modify nginx.conf unless necessary. The configuration prevents the common "blank page" issue with MIME type errors.

## Troubleshooting

### Blank Page After Deployment

**Symptom**: App works locally but shows blank page in production

**Cause**: Incorrect asset paths or MIME type issues

**Solution**:
1. Verify `base: './'` in vite.config.js
2. Check nginx.conf is copied to container
3. Inspect browser console for errors
4. Check Network tab for failed asset loads

### Environment Variables Not Working

**Symptom**: Variables work locally but not in deployment

**Solution**:
1. Ensure variables start with `VITE_`
2. Rebuild after adding variables
3. Check Coolify environment settings
4. Verify build logs show variables

### Port Conflicts

**Symptom**: Port already in use

**Solution**:
```bash
# List processes on port 80
sudo lsof -i :80

# Kill process if needed
sudo kill -9 [PID]

# Or use different port
docker run -p 8080:80 event-command-center
```

### Build Failures

**Symptom**: Docker build fails

**Common Issues**:
1. Missing dependencies → Run `npm install` locally first
2. Node version mismatch → Use Node 18+
3. Memory issues → Increase Docker memory limit

**Debug**:
```bash
# Build with verbose output
docker build --progress=plain -t event-command-center .

# Check build stages
docker build --target builder -t event-center-builder .
```

### Real-time Updates Not Working

**Symptom**: Dashboard shows "Disconnected"

**Solution**:
1. This is expected for mock data mode
2. Check VITE_MOCK_DATA_ENABLED=true
3. Verify update interval in settings
4. For real WebSocket, configure VITE_WS_URL

## Performance Optimization

### CDN Configuration

For production at scale:
1. Use CDN for static assets
2. Enable HTTP/2
3. Configure browser caching
4. Enable Brotli compression

### Load Balancing

For high traffic:
1. Deploy multiple instances
2. Use load balancer (nginx, HAProxy)
3. Configure health checks
4. Enable session persistence if needed

### Monitoring

Recommended tools:
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog
- **Errors**: Sentry
- **Analytics**: Plausible, Google Analytics

## Security Considerations

### Headers
All security headers are configured in nginx.conf:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: configured
- Referrer-Policy: no-referrer-when-downgrade

### HTTPS
Always use HTTPS in production:
- Coolify auto-configures Let's Encrypt
- Certificates auto-renew
- HTTP → HTTPS redirect enabled

### Authentication
For production:
1. Implement backend authentication
2. Use JWT tokens or OAuth2
3. Configure CORS appropriately
4. Add rate limiting

## Backup and Rollback

### Backup Strategy
- Store Docker images with version tags
- Keep git history of all deployments
- Backup environment variables
- Document configuration changes

### Rollback Procedure
```bash
# In Coolify
1. Go to Deployment History
2. Select previous successful deployment
3. Click "Redeploy"

# Docker command line
docker pull registry.example.com/event-command-center:previous-tag
docker stop event-center
docker rm event-center
docker run -d -p 80:80 --name event-center \
  registry.example.com/event-command-center:previous-tag
```

## Scaling

### Horizontal Scaling
```bash
# Run multiple instances
docker-compose up --scale app=3
```

### Vertical Scaling
```yaml
# docker-compose.yml
services:
  app:
    image: event-command-center
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Health Checks

**Important**: Do NOT add HEALTHCHECK to Dockerfile. Coolify manages health checks externally.

Internal health checks cause false negatives and deployment failures because:
- Container network isolation
- Nginx startup timing
- Coolify's external monitoring is more reliable

## Support

For deployment issues:
1. Check Coolify logs
2. Inspect Docker container logs: `docker logs event-center`
3. Review nginx access/error logs
4. Check browser console for client-side errors

---

Deployment tested on:
- Coolify 4.x
- Docker 24+
- Ubuntu 22.04 LTS
- Node 18 LTS
