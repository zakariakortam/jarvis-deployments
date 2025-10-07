#!/bin/bash

# Transit Operations Dashboard Deployment Script

set -e

echo "========================================="
echo "Transit Operations Dashboard Deployment"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose found"
echo ""

# Stop existing container if running
echo "Stopping existing container (if any)..."
docker-compose down 2>/dev/null || true
echo ""

# Build new image
echo "Building Docker image..."
docker-compose build
echo ""

# Start container
echo "Starting container..."
docker-compose up -d
echo ""

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 3

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✓ Container is running"
    echo ""
    echo "========================================="
    echo "Deployment successful!"
    echo "========================================="
    echo ""
    echo "Dashboard is now available at:"
    echo "  → http://localhost:8080"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop the dashboard:"
    echo "  docker-compose down"
    echo ""
else
    echo "✗ Container failed to start"
    echo ""
    echo "View logs with:"
    echo "  docker-compose logs"
    exit 1
fi
