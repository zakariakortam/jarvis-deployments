# 🚀 Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- A hosting platform (Vercel, Netlify, Coolify, or custom server)

## Quick Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/satellite-mission-dashboard
vercel
```

3. **Follow prompts** to link your project

4. **Production deployment**
```bash
vercel --prod
```

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build and deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Deploy to Coolify

1. **Create Dockerfile** (already included below)
2. **Push to Git repository**
3. **Connect repository in Coolify**
4. **Configure build settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
   - Port: 3000

### Option 4: Custom Server with Docker

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

2. **Build and run**:
```bash
docker build -t satellite-dashboard .
docker run -p 3000:3000 satellite-dashboard
```

## Environment Variables

Create a `.env` file or configure environment variables in your hosting platform:

```bash
VITE_SATELLITE_COUNT=10000
VITE_TELEMETRY_UPDATE_INTERVAL=2000
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_DEBUG_MODE=false
```

## Build Configuration

### Standard Build
```bash
npm run build
```

Output: `dist/` directory

### Preview Build Locally
```bash
npm run preview
```

Serves on: `http://localhost:4173`

## Performance Optimization

### 1. Enable Compression

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/satellite-dashboard/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. CDN Configuration

Enable CDN for static assets:
- Cloudflare: Enable Auto Minify for JS, CSS, HTML
- Set Browser Cache TTL to 1 year for `/assets/*`
- Enable Brotli compression

### 3. Bundle Analysis

Analyze bundle size:
```bash
npm run build
# Check dist/ folder sizes
du -sh dist/assets/*
```

## Security Headers

Add these headers in your web server:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;";
```

## Monitoring

### Performance Monitoring

1. **Enable monitoring** in `.env`:
```bash
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

2. **Integrate with monitoring service**:
   - Google Analytics
   - Sentry for error tracking
   - LogRocket for session replay

### Health Check Endpoint

The app serves on `/` and returns 200 OK when healthy.

For custom health checks, create `public/health.json`:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Scaling Considerations

### For 10,000+ Satellites

1. **Server Resources**:
   - Minimum: 2GB RAM, 2 CPU cores
   - Recommended: 4GB RAM, 4 CPU cores

2. **Browser Requirements**:
   - Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
   - 4GB RAM for smooth operation
   - Hardware acceleration enabled

3. **Optimization**:
   - Reduce `VITE_SATELLITE_COUNT` for slower devices
   - Increase `VITE_TELEMETRY_UPDATE_INTERVAL` to reduce CPU usage
   - Disable 3D orbit view on mobile devices

## Troubleshooting

### Build Fails

**Issue**: Out of memory during build
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Issue**: Module not found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**Issue**: White screen on load
- Check browser console for errors
- Verify all assets are served correctly
- Check Content-Security-Policy headers

**Issue**: Slow performance
- Reduce satellite count in environment variables
- Check browser hardware acceleration
- Verify server resources

### WebGL Issues

**Issue**: Orbit view not rendering
- Update graphics drivers
- Try different browser
- Check WebGL support: https://get.webgl.org/

## Rollback Procedure

If deployment fails:

1. **Revert to previous version**:
```bash
# If using Vercel
vercel rollback

# If using Docker
docker run -p 3000:3000 satellite-dashboard:previous-tag
```

2. **Check logs**:
```bash
# Docker logs
docker logs satellite-dashboard

# Vercel logs
vercel logs
```

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Backup Strategy

### Backup Configuration

No database to backup - all data is generated client-side.

Backup only:
- Source code (in Git repository)
- Environment variables
- Server configuration files

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] All tabs function correctly
- [ ] 3D orbit view renders
- [ ] Telemetry charts update in real-time
- [ ] Search and filters work
- [ ] Dark mode toggles correctly
- [ ] CSV export functions
- [ ] Mobile layout displays properly
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable (Lighthouse > 90)

## Support

For deployment issues:
1. Check logs for errors
2. Review this guide
3. Open GitHub issue with:
   - Deployment platform
   - Error messages
   - Browser console logs

---

**Deployment completed successfully!** 🎉
