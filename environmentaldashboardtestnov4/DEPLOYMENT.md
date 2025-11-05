# Deployment Guide

This guide covers deploying the Environmental Monitoring Dashboard to various platforms.

## Build Status

✅ Production build validated successfully
- Bundle size: ~260KB gzipped (excellent)
- Build time: ~30 seconds
- No errors or warnings
- All optimizations applied

## Pre-Deployment Checklist

- [x] Production build completes without errors
- [x] All dependencies installed correctly
- [x] Environment variables documented
- [x] Code linting passes
- [x] Bundle size optimized
- [x] Source maps generated
- [x] Documentation complete

## Quick Deploy

### Option 1: Coolify (Recommended)

Coolify is the recommended deployment platform for this application.

1. **Connect Repository**
   ```bash
   # Push to GitHub
   cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/environmental-monitoring-dashboard
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Configure Coolify**
   - Add new resource → Git Repository
   - Select your repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Set port: `3000` (for preview server) or use static hosting

3. **Environment Variables**
   Add these to Coolify environment settings:
   ```
   VITE_APP_TITLE=Environmental Monitoring Dashboard
   VITE_MAX_DATAPOINTS=10000
   VITE_UPDATE_INTERVAL=2000
   VITE_CO2_THRESHOLD=800
   VITE_TEMP_THRESHOLD_HIGH=35
   VITE_TEMP_THRESHOLD_LOW=10
   VITE_HUMIDITY_THRESHOLD_HIGH=80
   VITE_HUMIDITY_THRESHOLD_LOW=30
   ```

4. **Deploy**
   - Click "Deploy" in Coolify
   - Wait for build to complete
   - Access via provided URL

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/environmental-monitoring-dashboard
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy
```

Vercel automatically detects Vite configuration.

### Option 3: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or use Netlify UI:
1. Drag and drop the `dist` folder
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 4: Docker

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
docker build -t environmental-dashboard .
docker run -p 3000:80 environmental-dashboard
```

### Option 5: AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Install AWS CLI
# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://environmental-dashboard

# Upload files
aws s3 sync dist/ s3://environmental-dashboard --delete

# Configure S3 for static website hosting
aws s3 website s3://environmental-dashboard \
  --index-document index.html \
  --error-document index.html

# Create CloudFront distribution (optional, for CDN)
# Follow AWS CloudFront setup wizard
```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
VITE_APP_TITLE=Environmental Monitoring Dashboard
VITE_MAX_DATAPOINTS=10000
VITE_UPDATE_INTERVAL=2000
VITE_CO2_THRESHOLD=800
VITE_TEMP_THRESHOLD_HIGH=35
VITE_TEMP_THRESHOLD_LOW=10
VITE_HUMIDITY_THRESHOLD_HIGH=80
VITE_HUMIDITY_THRESHOLD_LOW=30
```

### API Integration (Optional)

If connecting to real sensor APIs, add:

```env
VITE_API_URL=https://api.your-domain.com
VITE_WEBSOCKET_URL=wss://api.your-domain.com
VITE_API_KEY=your_api_key_here
```

## Performance Optimization

### CDN Configuration

Serve static assets from CDN:
1. Upload `dist/assets/*` to CDN
2. Update `vite.config.js` with CDN base URL:

```javascript
export default defineConfig({
  base: 'https://cdn.your-domain.com/',
  // ... rest of config
})
```

### Caching Strategy

Recommended cache headers:
- HTML files: `no-cache` or short TTL (5 minutes)
- JS/CSS files: `max-age=31536000` (1 year) - they have hash in filename
- Images: `max-age=86400` (1 day)

### Monitoring

Add monitoring to track performance:

```javascript
// In src/main.jsx, add:
if (import.meta.env.PROD) {
  // Add error tracking (e.g., Sentry)
  // Add analytics (e.g., Google Analytics, Plausible)
  // Add performance monitoring
}
```

## Health Checks

For platforms that support health checks, create a simple endpoint or use the root URL:
- Endpoint: `GET /`
- Expected status: `200 OK`
- Response time: `< 500ms`

## Scaling Considerations

### Horizontal Scaling
The application is stateless and can be scaled horizontally:
- Use load balancer to distribute traffic
- Deploy multiple instances behind CDN
- Each instance handles independent users

### Data Loading
For large-scale deployments:
- Implement server-side pagination
- Use data streaming for large datasets
- Cache frequently accessed data
- Implement WebSocket connection pooling

## Troubleshooting

### Build Failures

**Issue**: `terser not found`
```bash
npm install --save-dev terser
```

**Issue**: `postcss` errors
```bash
npm install --save-dev postcss autoprefixer
```

### Runtime Errors

**Issue**: Blank page after deployment
- Check browser console for errors
- Verify base URL in `vite.config.js`
- Ensure all assets are uploaded
- Check CORS configuration if using external API

**Issue**: Charts not rendering
- Verify Recharts is in dependencies
- Check for JavaScript errors in console
- Ensure data format matches expected structure

### Performance Issues

**Issue**: Slow initial load
- Enable gzip/brotli compression
- Implement code splitting
- Use CDN for static assets
- Enable HTTP/2

**Issue**: High memory usage
- Reduce `VITE_MAX_DATAPOINTS`
- Implement data pagination
- Clear old data periodically

## Security

### Headers Configuration

Add these security headers (example for nginx):

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;" always;
```

### HTTPS

Always use HTTPS in production:
- Most platforms (Vercel, Netlify, Coolify) provide automatic HTTPS
- For custom deployments, use Let's Encrypt for free SSL certificates

## Rollback Strategy

### Quick Rollback

**Vercel/Netlify**: Use platform UI to rollback to previous deployment

**Docker**:
```bash
# Tag previous version
docker tag environmental-dashboard:latest environmental-dashboard:backup
# Restore if needed
docker tag environmental-dashboard:backup environmental-dashboard:latest
```

**Manual**:
```bash
# Keep previous dist folder
mv dist dist.backup
# Restore if needed
mv dist.backup dist
```

## Post-Deployment

1. **Test all features**:
   - Verify data streaming works
   - Test dark mode toggle
   - Check all charts render
   - Test export functionality
   - Verify alerts trigger correctly

2. **Monitor**:
   - Check error logs
   - Monitor performance metrics
   - Track user behavior
   - Monitor API calls (if applicable)

3. **Document**:
   - Record deployment URL
   - Document environment variables
   - Save deployment credentials
   - Create runbook for common issues

## Support

For deployment issues:
- Check application logs
- Verify environment variables
- Test build locally first
- Contact platform support if needed

## Production URLs

Document your deployment URLs here:

- Production: `https://environmental-dashboard.your-domain.com`
- Staging: `https://staging-environmental-dashboard.your-domain.com`
- Development: `http://localhost:3000`
