# Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Git (for version control)

## Environment Setup

### Development Environment
```bash
# Clone or navigate to project
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/pong-game

# Install dependencies
npm install

# Copy environment template (optional)
cp .env.example .env.local

# Start development server
npm run dev
```

### Production Build
```bash
# Create optimized production build
npm run build

# Test production build locally
npm run preview
```

## Deployment Options

### 1. Coolify Deployment (Recommended)

#### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Pong game v1.0.0"

# Push to your git provider (GitHub, GitLab, etc.)
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Coolify Configuration
1. Log into your Coolify instance
2. Create new application
3. Connect your git repository
4. Configure build settings:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run preview`
   - **Port**: 3000 (or set PORT environment variable)
   - **Health Check Path**: `/`

#### Step 3: Environment Variables (Optional)
```
PORT=3000
NODE_ENV=production
```

#### Step 4: Deploy
Click "Deploy" and Coolify will:
- Clone the repository
- Install dependencies
- Build the application
- Start the preview server
- Configure reverse proxy
- Enable HTTPS (if configured)

### 2. Docker Deployment

#### Dockerfile
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
RUN npm ci --only=production

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "preview"]
```

#### Build and Run
```bash
# Build Docker image
docker build -t pong-game:1.0.0 .

# Run container
docker run -d -p 3000:3000 --name pong-game pong-game:1.0.0

# With custom port
docker run -d -p 8080:8080 -e PORT=8080 --name pong-game pong-game:1.0.0
```

#### Docker Compose
```yaml
version: '3.8'
services:
  pong-game:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Static Hosting

#### Build Static Files
```bash
npm run build
# Output: dist/ folder with all static files
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /home/facilis/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/pong-game
vercel

# Production deployment
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod --dir=dist
```

#### Cloudflare Pages
1. Connect repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

#### AWS S3 + CloudFront
```bash
# Build application
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 4. Traditional Web Server

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name pong.example.com;

    root /var/www/pong-game/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
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
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### Apache Configuration (.htaccess)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Performance Optimization

### 1. CDN Configuration
- Distribute static assets via CDN
- Configure appropriate cache headers
- Enable HTTP/2 or HTTP/3
- Use modern image formats (WebP)

### 2. Compression
Vite automatically generates gzipped files. Ensure your server serves them:

```nginx
# Nginx
location ~* \.(js|css)$ {
    gzip_static on;
}
```

### 3. SSL/TLS
Always use HTTPS in production:
- Let's Encrypt (free, automated)
- Cloudflare SSL (free)
- AWS Certificate Manager (free for AWS resources)

## Monitoring & Logging

### Health Check Endpoint
The application responds to `GET /` with 200 OK when healthy.

### Application Logs
```bash
# View logs (Docker)
docker logs -f pong-game

# View logs (PM2)
pm2 logs pong-game
```

### Error Tracking (Optional Integration)
Add Sentry or similar:
```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Analytics (Optional Integration)
Add Google Analytics or Plausible:
```html
<!-- index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Rollback Strategy

### Version Tags
```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v1.0.0
npm ci
npm run build
```

### Docker Rollback
```bash
# Tag images with versions
docker tag pong-game:latest pong-game:1.0.0

# Rollback by running previous version
docker stop pong-game
docker run -d -p 3000:3000 --name pong-game pong-game:1.0.0
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSP (Content Security Policy) implemented
- [ ] Regular dependency updates
- [ ] Secrets not in repository
- [ ] Error messages sanitized
- [ ] Rate limiting (if applicable)
- [ ] CORS configured properly (if API used)

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] Game loads without errors
- [ ] All controls work (keyboard)
- [ ] AI opponent functions correctly
- [ ] Scoring works properly
- [ ] Pause/resume functions
- [ ] Settings persist across sessions
- [ ] Dark mode toggles correctly
- [ ] Sound effects play (when enabled)

### 2. Performance Tests
```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://your-domain.com --view

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### 3. Cross-Browser Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 4. Responsive Testing
Test on:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Port Already in Use
```bash
# Change port
PORT=3001 npm run preview
```

### Assets Not Loading
- Check build output in dist/
- Verify base URL in vite.config.js
- Check server configuration for static files

### Performance Issues
- Verify gzip compression enabled
- Check CDN configuration
- Review bundle size with analyzer
- Enable HTTP/2

## Maintenance

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies (carefully)
npm update

# Audit security vulnerabilities
npm audit
npm audit fix
```

### Backup Strategy
- Repository: Git with remote backup
- Database: N/A (no database)
- Configs: Version controlled

### Monitoring Checklist
- [ ] Server uptime monitoring
- [ ] Error rate tracking
- [ ] Response time monitoring
- [ ] User analytics (optional)
- [ ] Security scan reports

---

For questions or issues, refer to the main README or open an issue in the repository.
