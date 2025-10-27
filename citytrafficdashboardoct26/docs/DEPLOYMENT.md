# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the City Traffic Management Dashboard to various hosting platforms and environments.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git (for repository-based deployments)
- Production environment variables configured

## Environment Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Required Variables:**
```bash
# Application Configuration
VITE_APP_NAME=City Traffic Dashboard
VITE_APP_VERSION=1.0.0

# Map Configuration
VITE_MAP_CENTER_LAT=40.7589
VITE_MAP_CENTER_LNG=-73.9851
VITE_MAP_ZOOM=12

# Simulation Configuration
VITE_SENSOR_COUNT=300
VITE_UPDATE_INTERVAL=2000

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=false
```

**Optional Variables:**
```bash
# Analytics
VITE_ANALYTICS_ID=your-analytics-id
VITE_ERROR_TRACKING_DSN=your-sentry-dsn

# API Configuration (if connecting to real backend)
VITE_API_URL=https://api.yourdomain.com
VITE_API_KEY=your-api-key
```

## Build Process

### Production Build

```bash
# Install dependencies
npm install

# Run production build
npm run build
```

This creates an optimized production build in the `/dist` directory with:
- Minified JavaScript and CSS
- Gzip compressed assets
- Source maps for debugging
- Optimized images and assets

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── vendor-[hash].js     # Vendor dependencies
│   ├── ui-[hash].js         # UI components
│   ├── maps-[hash].js       # Map components
│   ├── charts-[hash].js     # Chart components
│   └── index-[hash].css     # Compiled styles
├── index.html               # HTML entry point
└── stats.html              # Bundle analyzer report
```

### Preview Build Locally

```bash
npm run preview
```

Access at `http://localhost:3000`

## Deployment Options

### Option 1: Coolify (Recommended)

Coolify provides one-command deployment with auto-restart and health checks.

**Setup:**

1. **Connect Repository:**
   ```bash
   git remote add coolify your-coolify-git-url
   ```

2. **Configure Environment:**
   - Set environment variables in Coolify dashboard
   - Enable auto-deployment on push

3. **Deploy:**
   ```bash
   git push coolify main
   ```

**Coolify Configuration:**

```yaml
# coolify.yaml
version: '1.0'
name: city-traffic-dashboard
type: static
build:
  command: npm run build
  output: dist
health_check:
  path: /
  port: 3000
  interval: 30s
```

**Features:**
- ✅ Automatic SSL/TLS certificates
- ✅ Auto-restart on failure
- ✅ Rollback capability
- ✅ Environment variable management
- ✅ CI/CD pipeline integration

### Option 2: Vercel

Perfect for static React applications with global CDN.

**Deploy with Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Deploy with Git Integration:**

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

**Vercel Configuration (vercel.json):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Option 3: Netlify

Easy deployment with continuous deployment from Git.

**Deploy with Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Netlify Configuration (netlify.toml):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
```

### Option 4: AWS S3 + CloudFront

Enterprise-grade hosting with global CDN distribution.

**Setup Steps:**

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://city-traffic-dashboard
   ```

2. **Build Application:**
   ```bash
   npm run build
   ```

3. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://city-traffic-dashboard --delete
   ```

4. **Configure Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::city-traffic-dashboard/*"
       }
     ]
   }
   ```

5. **Create CloudFront Distribution:**
   - Origin: S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Compress Objects: Yes
   - Default Root Object: index.html

6. **Configure Error Pages:**
   - 403 Error: /index.html
   - 404 Error: /index.html

### Option 5: Docker Deployment

Containerize for deployment to any Docker-compatible platform.

**Dockerfile:**

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

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and Run:**

```bash
# Build image
docker build -t city-traffic-dashboard .

# Run container
docker run -d -p 80:80 --name traffic-dashboard city-traffic-dashboard

# Or use docker-compose
docker-compose up -d
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_APP_NAME: ${{ secrets.VITE_APP_NAME }}
          VITE_MAP_CENTER_LAT: ${{ secrets.VITE_MAP_CENTER_LAT }}
          VITE_MAP_CENTER_LNG: ${{ secrets.VITE_MAP_CENTER_LNG }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Health Checks

### Endpoint Monitoring

**Health Check Endpoint:**
- URL: `https://your-domain.com/`
- Expected Status: 200
- Response Time: < 2s

### Monitoring Setup

**Uptime Monitoring:**
- Use UptimeRobot, Pingdom, or StatusCake
- Check interval: Every 5 minutes
- Alert on downtime > 2 minutes

**Performance Monitoring:**
- Google Lighthouse CI
- WebPageTest
- Chrome User Experience Report

## Security Considerations

### HTTPS Configuration

**Always use HTTPS in production:**
- Most platforms provide automatic SSL
- For custom domains, use Let's Encrypt
- Configure HSTS header

### Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Content Security Policy

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline' https://unpkg.com; 
  img-src 'self' data: https:; 
  font-src 'self'; 
  connect-src 'self';
```

## Performance Optimization

### CDN Configuration

- Enable caching for static assets
- Set appropriate cache headers
- Use HTTP/2 or HTTP/3
- Enable compression (Gzip/Brotli)

### Cache Headers

```nginx
# HTML - No cache
location ~ \.html$ {
    add_header Cache-Control "no-cache";
}

# JS/CSS - Cache 1 year
location ~* \.(js|css)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Rollback Procedures

### Vercel Rollback

```bash
vercel rollback [deployment-url]
```

### AWS S3 Rollback

```bash
# Enable versioning on S3 bucket
aws s3api put-bucket-versioning \
  --bucket city-traffic-dashboard \
  --versioning-configuration Status=Enabled

# Restore previous version
aws s3api list-object-versions \
  --bucket city-traffic-dashboard
  
aws s3api copy-object \
  --copy-source city-traffic-dashboard/index.html?versionId=VERSION_ID \
  --bucket city-traffic-dashboard \
  --key index.html
```

### Docker Rollback

```bash
# Tag current image as backup
docker tag city-traffic-dashboard:latest city-traffic-dashboard:backup

# Pull previous image
docker pull city-traffic-dashboard:previous

# Update container
docker stop traffic-dashboard
docker rm traffic-dashboard
docker run -d -p 80:80 --name traffic-dashboard city-traffic-dashboard:previous
```

## Troubleshooting

### Build Failures

**Issue: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Out of memory"**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Deployment Issues

**Issue: White screen after deployment**
- Check browser console for errors
- Verify all assets loaded correctly
- Check base path configuration

**Issue: 404 on page refresh**
- Configure server to redirect all routes to index.html
- Check routing configuration

### Performance Issues

**Issue: Slow initial load**
- Analyze bundle with `npm run analyze`
- Implement code splitting
- Optimize images and assets

**Issue: High memory usage**
- Check for memory leaks with Chrome DevTools
- Optimize state management
- Implement virtual scrolling

## Support

For deployment assistance:
- Check documentation: `/docs`
- Review build logs
- Consult platform-specific guides
- Contact development team

---

**Remember:** Always test deployments in a staging environment before pushing to production.
