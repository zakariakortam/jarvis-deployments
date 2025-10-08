#!/bin/bash

# Industrial Dashboard Deployment Script
# Deploys the dashboard to NGINX Docker container

set -e

echo "==================================="
echo "Industrial Dashboard Deployment"
echo "==================================="

# Configuration
PROJECT_NAME="industrial-dashboard"
NGINX_IMAGE="nginx:alpine"
CONTAINER_NAME="industrial-dashboard-nginx"
HOST_PORT="8080"
CONTAINER_PORT="80"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Project directory: $PROJECT_DIR"

# Check if container is already running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Build and deploy
echo "Deploying dashboard to NGINX container..."

docker run -d \
    --name $CONTAINER_NAME \
    -p $HOST_PORT:$CONTAINER_PORT \
    -v "$PROJECT_DIR:/usr/share/nginx/html:ro" \
    -v "$PROJECT_DIR/config/deployment.conf:/etc/nginx/conf.d/default.conf:ro" \
    --restart unless-stopped \
    $NGINX_IMAGE

echo ""
echo "✓ Deployment successful!"
echo ""
echo "Dashboard URL: http://localhost:$HOST_PORT"
echo "Container name: $CONTAINER_NAME"
echo ""
echo "Useful commands:"
echo "  View logs:     docker logs -f $CONTAINER_NAME"
echo "  Stop:          docker stop $CONTAINER_NAME"
echo "  Start:         docker start $CONTAINER_NAME"
echo "  Remove:        docker rm -f $CONTAINER_NAME"
echo ""
