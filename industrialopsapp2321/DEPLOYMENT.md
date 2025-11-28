# Deployment Guide

## Pre-Deployment Checklist

Before deploying, ensure:

1. All dependencies are correctly specified in package.json
2. Build completes without errors: `npm run build`
3. Environment variables are documented in .env.example
4. Dockerfile and nginx.conf are present and configured
5. vite.config.js has `base: './'` for relative paths

## Local Testing

### Test Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/

# Test locally
npm run preview
```

Visit `http://localhost:4173` to verify the production build works correctly.

## Docker Deployment

### Build Image

```bash
docker build -t industrial-ops-platform:latest .
```

### Run Container

```bash
docker run -d \
  -p 80:80 \
  --name industrial-ops \
  industrial-ops-platform:latest
```

### Verify Deployment

```bash
docker ps
docker logs industrial-ops
curl http://localhost
```

## Coolify Deployment

### Setup

1. Connect your git repository to Coolify
2. Set deployment method to "Dockerfile"
3. Configure environment variables in Coolify UI

### Environment Variables

Add these in Coolify's Environment Variables section:

```
VITE_API_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com
VITE_REFRESH_INTERVAL=2000
```

### Deploy

1. Push code to connected branch
2. Coolify will automatically:
   - Build Docker image
   - Run container
   - Configure reverse proxy
   - Enable SSL/TLS

### Health Checks

Coolify manages healthchecks externally. The application does NOT include internal healthcheck commands in the Dockerfile.

## Nginx Configuration

The included nginx.conf provides:

- Proper MIME types for JavaScript modules
- SPA routing (all routes serve index.html)
- Gzip compression
- Static asset caching
- Security headers

### Key Settings

```nginx
# JavaScript module support
types {
    application/javascript js mjs;
}

# SPA routing
location / {
    try_files $uri $uri/ /index.html;
}

# Asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Common Issues

### Blank Page After Deployment

**Symptom**: App works locally but shows blank page in production

**Cause**: Absolute paths in built files

**Solution**: Ensure vite.config.js has `base: './'`

```javascript
export default defineConfig({
  base: './',  // Critical for deployment
  // ...
})
```

### MIME Type Errors

**Symptom**: Console error: "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of ''"

**Cause**: Missing or incorrect nginx.conf

**Solution**: Verify nginx.conf includes:

```nginx
types {
    application/javascript js mjs;
}
```

### Environment Variables Not Working

**Symptom**: API calls fail, undefined values

**Solution**:
1. Prefix frontend variables with `VITE_`
2. Add variables in deployment platform UI
3. Rebuild after adding variables

## Performance Optimization

### Bundle Analysis

```bash
npm run build
# Check dist/ folder size
du -sh dist/
```

### Optimization Tips

1. **Code Splitting**: Already configured in vite.config.js
2. **Lazy Loading**: Components load on-demand
3. **Asset Optimization**: Images and icons optimized
4. **Gzip Compression**: Enabled in nginx.conf

## Monitoring

### Application Logs

```bash
# Docker logs
docker logs -f industrial-ops

# Nginx access logs
docker exec industrial-ops tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec industrial-ops tail -f /var/log/nginx/error.log
```

### Health Monitoring

Monitor these endpoints:
- `GET /` - Should return HTML
- Check browser console for errors
- Monitor network tab for failed requests

## Scaling

### Horizontal Scaling

Run multiple containers behind a load balancer:

```bash
# Run 3 instances
docker run -d -p 8001:80 industrial-ops-platform
docker run -d -p 8002:80 industrial-ops-platform
docker run -d -p 8003:80 industrial-ops-platform
```

Configure load balancer (nginx, HAProxy, or cloud LB) to distribute traffic.

### Vertical Scaling

Adjust container resources:

```bash
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  -p 80:80 \
  industrial-ops-platform
```

## Backup and Recovery

### Backup Considerations

This is a frontend-only application with no persistent data. Backups needed:

1. **Source Code**: Keep in version control (Git)
2. **Configuration**: Backup .env files securely
3. **Docker Images**: Tag and push to registry

### Disaster Recovery

```bash
# Pull image from registry
docker pull your-registry/industrial-ops-platform:latest

# Run container
docker run -d -p 80:80 your-registry/industrial-ops-platform:latest
```

## Security

### HTTPS

Always use HTTPS in production:
- Let's Encrypt certificates (automatic with Coolify)
- Cloudflare proxy
- Cloud provider SSL/TLS

### Security Headers

Included in nginx.conf:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade

### Content Security Policy

Add CSP headers in nginx.conf if needed:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## Updates and Maintenance

### Rolling Updates

1. Build new image with version tag:
```bash
docker build -t industrial-ops-platform:v1.1.0 .
```

2. Stop old container:
```bash
docker stop industrial-ops
docker rm industrial-ops
```

3. Start new container:
```bash
docker run -d -p 80:80 --name industrial-ops industrial-ops-platform:v1.1.0
```

### Zero-Downtime Deployment

1. Run new version on different port
2. Update load balancer to point to new port
3. Shut down old version

## Troubleshooting

### Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
```

### Container Won't Start

```bash
# Check logs
docker logs industrial-ops

# Common issues:
# - Port already in use: Change -p 80:80 to -p 8080:80
# - Build failed: Rebuild image
# - Config error: Check nginx.conf syntax
```

### Performance Issues

1. Check container resources: `docker stats`
2. Monitor network: Browser DevTools > Network
3. Analyze bundle size: Check dist/ folder
4. Enable gzip compression (already configured)

## Support

For deployment issues:
1. Check logs first
2. Verify configuration files
3. Test locally with `npm run preview`
4. Consult this guide's common issues section
