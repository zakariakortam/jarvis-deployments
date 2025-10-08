#!/bin/bash

# Warehouse Management System - NGINX Deployment Script

echo "==================================="
echo "Warehouse Management System Deploy"
echo "==================================="
echo ""

# Configuration
PROJECT_NAME="warehouse-management-system"
NGINX_PORT=8080
CONTAINER_NAME="wms-nginx"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${YELLOW}Step 1: Stopping existing container (if any)...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
echo -e "${GREEN}✓ Container cleanup complete${NC}"
echo ""

echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
cat > Dockerfile << 'EOF'
FROM nginx:alpine

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

docker build -t $PROJECT_NAME . || {
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

echo -e "${YELLOW}Step 3: Starting container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $NGINX_PORT:80 \
    $PROJECT_NAME || {
    echo -e "${RED}Error: Failed to start container${NC}"
    exit 1
}
echo -e "${GREEN}✓ Container started successfully${NC}"
echo ""

echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$NGINX_PORT | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running${NC}"
else
    echo -e "${RED}✗ Application health check failed${NC}"
    exit 1
fi
echo ""

echo "==================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "==================================="
echo ""
echo "Access the application at:"
echo -e "${GREEN}http://localhost:$NGINX_PORT${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs $CONTAINER_NAME"
echo "  Stop:         docker stop $CONTAINER_NAME"
echo "  Restart:      docker restart $CONTAINER_NAME"
echo "  Remove:       docker rm -f $CONTAINER_NAME"
echo ""
