# BOF SPC Monitor - Deployment Guide

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optional, for containerized deployment)
- Coolify account (for managed deployment)

## 🚀 Deployment Options

### Option 1: Coolify Deployment (Recommended)

1. **Login to Coolify**
   ```bash
   https://your-coolify-instance.com
   ```

2. **Create New Project**
   - Click "New Project"
   - Name: "BOF SPC Monitor"
   - Type: "Docker" or "Node.js"

3. **Configure Repository**
   - Repository URL: Your Git repository
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

4. **Set Environment Variables**
   ```env
   PORT=3000
   NODE_ENV=production
   VITE_API_URL=https://api.yourdomain.com
   VITE_WS_URL=wss://api.yourdomain.com
   VITE_APP_NAME=BOF SPC Monitor
   VITE_ENABLE_OFFLINE_MODE=true
   VITE_ENABLE_REALTIME=true
   ```

5. **Configure Health Check**
   - Path: `/`
   - Port: `3000`
   - Interval: `30s`
   - Timeout: `10s`

6. **Deploy**
   - Click "Deploy"
   - Monitor build logs
   - Access your application at the provided URL

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as builder

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   FROM node:18-alpine
   WORKDIR /app

   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/package*.json ./

   RUN npm ci --only=production && npm install -g vite

   EXPOSE 3000

   CMD ["npm", "run", "preview"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t bof-spc-monitor:latest .
   ```

3. **Run Container**
   ```bash
   docker run -d \
     --name bof-spc-monitor \
     -p 3000:3000 \
     -e PORT=3000 \
     -e NODE_ENV=production \
     --restart unless-stopped \
     bof-spc-monitor:latest
   ```

4. **Docker Compose (Optional)**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - PORT=3000
         - NODE_ENV=production
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "wget", "--spider", "http://localhost:3000"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

### Option 3: Manual VPS Deployment

1. **SSH to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd bof-spc-monitor
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

7. **Create PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'bof-spc-monitor',
       script: 'npm',
       args: 'run preview',
       env: {
         PORT: 3000,
         NODE_ENV: 'production'
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G'
     }]
   }
   ```

8. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔧 Nginx Configuration (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

Create a health check endpoint:

```javascript
// health-check.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
})
```

### Monitoring with PM2

```bash
# View logs
pm2 logs bof-spc-monitor

# Monitor resources
pm2 monit

# Restart application
pm2 restart bof-spc-monitor

# Stop application
pm2 stop bof-spc-monitor
```

## 🔄 CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

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

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/bof-spc-monitor
            git pull origin main
            npm install
            npm run build
            pm2 restart bof-spc-monitor
```

## ✅ Post-Deployment Checklist

- [ ] Application is accessible at the correct URL
- [ ] HTTPS is working correctly
- [ ] All environment variables are set
- [ ] Health check endpoint responds correctly
- [ ] Logs are being generated and accessible
- [ ] Monitoring is set up (if applicable)
- [ ] Backup strategy is in place
- [ ] Documentation is updated
- [ ] Team has access credentials
- [ ] Performance metrics are being tracked

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs bof-spc-monitor

# Check Node.js version
node --version

# Verify environment variables
pm2 env 0
```

### High Memory Usage

```bash
# Increase memory limit
pm2 restart bof-spc-monitor --max-memory-restart 2G
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📞 Support

For deployment issues, contact:
- DevOps Team: devops@yourcompany.com
- Documentation: https://docs.yourcompany.com

---

**Last Updated**: 2025-01-02
