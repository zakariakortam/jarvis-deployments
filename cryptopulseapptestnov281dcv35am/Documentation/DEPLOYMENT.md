# Crypto Pulse - Deployment Guide

## Deployment Options

### Option 1: Docker Compose (Recommended)

The simplest way to deploy Crypto Pulse is using Docker Compose, which orchestrates both frontend and backend services.

**Prerequisites:**
- Docker Engine 20.10+
- Docker Compose 2.0+

**Steps:**

1. **Navigate to project directory:**
```bash
cd crypto-pulse
```

2. **Build and start services:**
```bash
docker-compose up --build -d
```

3. **Verify deployment:**
```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl http://localhost/api/health
```

4. **Access the application:**
- Frontend: http://localhost
- API: http://localhost/api
- WebSocket: ws://localhost/ws

**Managing the deployment:**
```bash
# Stop services
docker-compose stop

# Restart services
docker-compose restart

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale backend (if needed)
docker-compose up -d --scale backend=2

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

---

### Option 2: Coolify Platform

Coolify is a self-hosted platform for deploying applications with Git integration.

**Prerequisites:**
- Coolify instance running
- Git repository with your code

**Steps:**

1. **Push code to Git repository:**
```bash
git init
git add .
git commit -m "Initial commit: Crypto Pulse"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **In Coolify Dashboard:**
   - Create new project
   - Select "Docker Compose" as deployment type
   - Connect your Git repository
   - Set repository URL and branch (main)
   - Coolify will detect `docker-compose.yml`

3. **Configure Environment Variables (if needed):**
   - Backend:
     - `PORT=8000`
     - `NODE_ENV=production`
     - `CORS_ORIGIN=*`

4. **Deploy:**
   - Click "Deploy" button
   - Coolify will build and start services
   - Monitor build logs in real-time

5. **Access Application:**
   - Coolify provides a URL (e.g., `https://crypto-pulse.your-domain.com`)
   - Custom domain can be configured in settings

**Automatic Deployments:**
- Coolify can auto-deploy on git push
- Configure webhook in repository settings
- Enable "Deploy on Push" in Coolify

---

### Option 3: Manual Docker Deployment

For custom Docker setups without docker-compose.

**Build Images:**
```bash
# Build backend image
cd backend
docker build -t crypto-pulse-backend:latest .

# Build frontend image
cd ../frontend
docker build -t crypto-pulse-frontend:latest .
```

**Create Docker Network:**
```bash
docker network create crypto-pulse-network
```

**Run Backend Container:**
```bash
docker run -d \
  --name crypto-pulse-backend \
  --network crypto-pulse-network \
  -e NODE_ENV=production \
  -e PORT=8000 \
  -e CORS_ORIGIN=* \
  --restart unless-stopped \
  crypto-pulse-backend:latest
```

**Run Frontend Container:**
```bash
docker run -d \
  --name crypto-pulse-frontend \
  --network crypto-pulse-network \
  -p 80:80 \
  --restart unless-stopped \
  crypto-pulse-frontend:latest
```

**Verify Deployment:**
```bash
# Check containers
docker ps

# Check backend logs
docker logs crypto-pulse-backend

# Check frontend logs
docker logs crypto-pulse-frontend

# Test health endpoint
curl http://localhost/api/health
```

---

### Option 4: Kubernetes Deployment

For production-grade, scalable deployments.

**Prerequisites:**
- Kubernetes cluster (v1.20+)
- kubectl configured
- Docker images pushed to registry

**Create Kubernetes Manifests:**

**backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crypto-pulse-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: crypto-pulse-backend
  template:
    metadata:
      labels:
        app: crypto-pulse-backend
    spec:
      containers:
      - name: backend
        image: your-registry/crypto-pulse-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8000"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: crypto-pulse-backend
spec:
  selector:
    app: crypto-pulse-backend
  ports:
  - port: 8000
    targetPort: 8000
```

**frontend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crypto-pulse-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: crypto-pulse-frontend
  template:
    metadata:
      labels:
        app: crypto-pulse-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/crypto-pulse-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: crypto-pulse-frontend
spec:
  selector:
    app: crypto-pulse-frontend
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
```

**Deploy to Kubernetes:**
```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Check status
kubectl get pods
kubectl get services

# Get external IP
kubectl get service crypto-pulse-frontend
```

---

## Production Checklist

Before deploying to production, ensure:

### Security
- [ ] CORS_ORIGIN set to specific domain (not *)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured in nginx
- [ ] Rate limiting enabled
- [ ] WebSocket authentication implemented (if needed)
- [ ] Secrets managed via environment variables or vault

### Performance
- [ ] Frontend assets served via CDN
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] Database connection pooling (if using database)
- [ ] Backend scaled to multiple instances
- [ ] Load balancer configured

### Monitoring
- [ ] Application logs centralized (e.g., ELK stack)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Uptime monitoring enabled (e.g., UptimeRobot)
- [ ] Performance monitoring (e.g., New Relic, DataDog)
- [ ] Alerts configured for critical issues

### Backup & Recovery
- [ ] Database backups scheduled (if applicable)
- [ ] Deployment rollback plan documented
- [ ] Disaster recovery plan established
- [ ] Configuration backed up

---

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=8000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Logging (optional)
LOG_LEVEL=info
```

### Frontend (.env)
```env
# Backend API URL (only for local development)
# In production, nginx proxy handles routing
VITE_API_URL=http://localhost:8000

# WebSocket URL (only for local development)
VITE_WS_URL=ws://localhost:8000/ws
```

**Note:** In Docker deployment, frontend uses nginx proxy (`/api` and `/ws`), so environment variables are not needed.

---

## Troubleshooting

### Issue: Frontend shows blank page

**Cause:** Asset paths not configured correctly

**Solution:**
1. Verify `base: './'` in `vite.config.js`
2. Rebuild frontend: `npm run build`
3. Check dist/index.html for relative paths (`./assets/`)

---

### Issue: API calls return 502 Bad Gateway

**Cause:** Backend service not reachable

**Solution:**
1. Check backend health: `docker logs crypto-pulse-backend`
2. Verify backend is running: `docker ps`
3. Test direct backend access: `curl http://backend:8000/health` (from frontend container)
4. Check nginx proxy configuration in `frontend/nginx.conf`

---

### Issue: WebSocket not connecting

**Cause:** WebSocket proxy not configured

**Solution:**
1. Verify `/ws` location in `frontend/nginx.conf`
2. Check WebSocket upgrade headers
3. Test backend WebSocket: `wscat -c ws://localhost:8000/ws`
4. Check browser console for connection errors

---

### Issue: Docker build fails

**Cause:** Dependencies installation error

**Solution:**
1. Check internet connectivity
2. Clear Docker cache: `docker builder prune`
3. Rebuild with no cache: `docker-compose build --no-cache`
4. Verify package.json has correct dependencies

---

## Performance Tuning

### Frontend Optimization

**Nginx Configuration:**
```nginx
# Increase worker processes
worker_processes auto;

# Increase worker connections
events {
    worker_connections 4096;
}

# Enable HTTP/2
listen 443 ssl http2;

# Optimize buffer sizes
client_body_buffer_size 128k;
client_max_body_size 10m;
```

**Vite Configuration:**
```javascript
// Add to vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        charts: ['recharts'],
        animations: ['framer-motion']
      }
    }
  }
}
```

### Backend Optimization

**Cluster Mode (for multi-core servers):**
```javascript
// server-cluster.js
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  import('./server.js');
}
```

**Run with cluster:**
```bash
node server-cluster.js
```

---

## Scaling Strategy

### Horizontal Scaling

**Docker Compose:**
```bash
docker-compose up -d --scale backend=3
```

**Kubernetes:**
```bash
kubectl scale deployment crypto-pulse-backend --replicas=5
```

### Vertical Scaling

**Increase container resources:**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Rollback Procedure

### Docker Compose Rollback

1. **Tag working version:**
```bash
docker tag crypto-pulse-backend:latest crypto-pulse-backend:stable
docker tag crypto-pulse-frontend:latest crypto-pulse-frontend:stable
```

2. **If deployment fails, revert:**
```bash
docker-compose down
docker tag crypto-pulse-backend:stable crypto-pulse-backend:latest
docker tag crypto-pulse-frontend:stable crypto-pulse-frontend:latest
docker-compose up -d
```

### Kubernetes Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/crypto-pulse-backend

# Rollback to specific revision
kubectl rollout undo deployment/crypto-pulse-backend --to-revision=2

# Check rollout status
kubectl rollout status deployment/crypto-pulse-backend
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check uptime status
- Review performance metrics

**Weekly:**
- Analyze traffic patterns
- Review security logs
- Update dependencies (if needed)

**Monthly:**
- Database maintenance (if applicable)
- Security audit
- Performance optimization review
- Backup verification

### Updates

**Update Dependencies:**
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

**Rebuild and Deploy:**
```bash
docker-compose build
docker-compose up -d
```

---

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify health endpoints
3. Review nginx error logs: `docker exec crypto-pulse-frontend cat /var/log/nginx/error.log`
4. Test services individually

For production support, ensure monitoring and alerting are configured to catch issues proactively.
