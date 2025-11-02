#!/bin/bash

# BOF SPC Monitor - Quick Setup Script
# This script will install dependencies and prepare the application for first run

set -e  # Exit on any error

echo "========================================="
echo "  BOF SPC Monitor - Setup Script v1.0.0"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js >= 18.0.0 from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

echo ""
echo "Running tests..."
npm test -- --run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed, but you can still run the app${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Review and edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Build for production:"
echo "   npm run build"
echo "   npm run preview"
echo ""
echo "5. Deploy to production (see DEPLOYMENT.md):"
echo "   - Coolify deployment (recommended)"
echo "   - Docker deployment"
echo "   - Manual VPS deployment"
echo ""
echo "========================================="
echo "📚 Documentation:"
echo "   - README.md - Comprehensive guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo "   - DELIVERY_SUMMARY.md - What you got"
echo "========================================="
