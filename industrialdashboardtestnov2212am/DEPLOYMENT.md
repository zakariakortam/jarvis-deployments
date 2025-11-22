# 🚀 Deployment Guide - Industrial Dashboard

Complete deployment instructions for various platforms.

## 📋 Pre-Deployment Checklist

Before deploying, verify:

```bash
# 1. Install dependencies
npm install

# 2. Run production build test
npm run build

# 3. Check for build errors
# Build should complete with 0 errors

# 4. Verify deployment files exist
ls -la Dockerfile nginx.conf vite.config.js

# 5. Test production build locally
npm run preview
```

## 🐳 Docker Deployment

### Local Docker Testing

```bash
# Build image
docker build -t industrial-dashboard:latest .

# Run container
docker run -d -p 8080:80 --name dashboard industrial-dashboard:latest

# Test
curl http://localhost:8080

# View logs
docker logs dashboard

# Stop container
docker stop dashboard
docker rm dashboard
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Coolify Deployment

### Prerequisites
- Coolify instance running
- Git repository with code
- Domain name (optional)

### Deployment Steps

1. **Push Code to Git Repository**
```bash
git init
git add .
git commit -m "Initial commit - Industrial Dashboard"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Create Application in Coolify**
- Log in to Coolify dashboard
- Click "New Application"
- Select "Public Repository" or "Private Repository"
- Enter repository URL
- Branch: `main`

3. **Configuration**
- Build Pack: Docker (auto-detected)
- Port: 80
- Domains: Add your domain or use Coolify subdomain

4. **Environment Variables** (if needed)
No environment variables required for basic deployment.

5. **Deploy**
- Click "Deploy"
- Coolify will:
  - Clone repository
  - Build Docker image
  - Start container
  - Configure reverse proxy

6. **Verify Deployment**
- Access provided URL
- Check dashboard loads correctly
- Verify real-time data updates working

### Troubleshooting Coolify Deployment

**Blank Page After Deployment**
```bash
# Verify vite.config.js has base: './'
cat vite.config.js | grep "base:"

# Should show:
# base: './',
```

**Build Failures**
```bash
# Check Coolify logs in dashboard
# Common issues:
# - Missing Dockerfile → Ensure Dockerfile is in root
# - Node version mismatch → Use Node 18+ in Dockerfile
# - Build errors → Run npm run build locally first
```

**Container Won't Start**
```bash
# Check nginx.conf syntax
# Verify EXPOSE 80 in Dockerfile
# Review Coolify container logs
```

## 🌐 Vercel Deployment

**Note**: Vercel is optimized for Next.js. For Vite apps, use Static deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Configure `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📦 Netlify Deployment

### Via Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy

### Via Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔵 DigitalOcean App Platform

1. **Create App**
   - Select GitHub repository
   - Or upload code directly

2. **Configure Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - HTTP Port: 80

3. **Deploy**
   - Click "Create Resources"
   - App Platform will build and deploy

## 🖥️ VPS Deployment (Ubuntu)

### Manual Setup

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Nginx
sudo apt update
sudo apt install nginx

# 3. Clone repository
git clone <your-repo-url>
cd industrial-dashboard

# 4. Install dependencies and build
npm install
npm run build

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/dashboard

# Paste:
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/industrial-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 6. Enable site
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Using PM2 (for development server)

```bash
# Install PM2
sudo npm install -g pm2

# Start app
pm2 start "npm run preview" --name industrial-dashboard

# Save PM2 config
pm2 save
pm2 startup
```

## 🔒 SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## 🎯 Environment-Specific Configuration

### Production Environment Variables

Create `.env.production`:
```env
VITE_APP_NAME=Industrial Dashboard
VITE_UPDATE_INTERVAL=1000
```

### Staging Environment

Create `.env.staging`:
```env
VITE_APP_NAME=Industrial Dashboard (Staging)
VITE_UPDATE_INTERVAL=2000
```

## 📊 Monitoring & Logging

### Docker Logs
```bash
# View logs
docker logs -f <container-id>

# Export logs
docker logs <container-id> > dashboard.log 2>&1
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/dashboard
```

## ⚡ Performance Optimization

### Enable Gzip Compression

Already configured in `nginx.conf`. Verify:
```bash
curl -H "Accept-Encoding: gzip" -I http://your-domain.com
# Should show: Content-Encoding: gzip
```

### CDN Integration

For global distribution:
1. Cloudflare - Free tier with auto-optimization
2. AWS CloudFront
3. DigitalOcean Spaces CDN

### Caching Strategy

Static assets cached for 1 year (configured in nginx.conf):
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🆘 Troubleshooting

### Common Issues

**1. Blank Page**
- Check browser console for errors
- Verify `base: './'` in vite.config.js
- Check nginx.conf MIME types

**2. Data Not Updating**
- Verify JavaScript is loading
- Check browser console for errors
- Test with browser DevTools Network tab

**3. High Memory Usage**
- Normal for 100+ data points
- Monitor with: `docker stats`
- Consider reducing update frequency

**4. Slow Initial Load**
- Enable gzip compression
- Use CDN for static assets
- Optimize images (if added)

## 📈 Scaling Considerations

For production environments with real data:

1. **Backend Integration**
   - Replace mock data with API calls
   - Implement WebSocket for real-time updates
   - Add authentication/authorization

2. **Database**
   - Store historical data
   - Implement data aggregation
   - Use time-series database (InfluxDB, TimescaleDB)

3. **Load Balancing**
   - Multiple instances behind load balancer
   - Session persistence if stateful

4. **Caching**
   - Redis for real-time data
   - CDN for static assets

---

**Deployment complete!** Your industrial dashboard is now live and monitoring equipment in real-time.
