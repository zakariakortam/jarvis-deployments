#!/bin/bash

# Industrial Dashboard - Pre-Deployment Validation Script
# Run this script before deploying to ensure everything is ready

set -e

echo "🔍 Industrial Dashboard - Pre-Deployment Validation"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print check result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((CHECKS_FAILED++))
    fi
}

echo "📦 Checking Required Files..."
echo "------------------------------"

# Check for deployment files
[ -f "Dockerfile" ] && check_result 0 "Dockerfile exists" || check_result 1 "Dockerfile missing"
[ -f "nginx.conf" ] && check_result 0 "nginx.conf exists" || check_result 1 "nginx.conf missing"
[ -f "vite.config.js" ] && check_result 0 "vite.config.js exists" || check_result 1 "vite.config.js missing"
[ -f "package.json" ] && check_result 0 "package.json exists" || check_result 1 "package.json missing"

echo ""
echo "🔧 Checking Vite Configuration..."
echo "----------------------------------"

# Check for relative paths in vite.config.js
if grep -q "base: '\\./'," vite.config.js; then
    check_result 0 "Relative paths configured (base: './')"
else
    check_result 1 "Base path not set to './' - may cause deployment issues"
fi

echo ""
echo "📦 Installing Dependencies..."
echo "-----------------------------"

if npm install > /dev/null 2>&1; then
    check_result 0 "Dependencies installed successfully"
else
    check_result 1 "Failed to install dependencies"
    exit 1
fi

echo ""
echo "🏗️  Running Production Build..."
echo "--------------------------------"

if npm run build > /dev/null 2>&1; then
    check_result 0 "Production build successful"
else
    check_result 1 "Production build failed"
    exit 1
fi

echo ""
echo "📂 Checking Build Output..."
echo "---------------------------"

# Check dist directory
[ -d "dist" ] && check_result 0 "dist/ directory created" || check_result 1 "dist/ directory missing"
[ -f "dist/index.html" ] && check_result 0 "index.html generated" || check_result 1 "index.html missing"
[ -d "dist/assets" ] && check_result 0 "assets/ directory created" || check_result 1 "assets/ directory missing"

# Count JS and CSS files
JS_COUNT=$(find dist/assets -name "*.js" 2>/dev/null | wc -l)
CSS_COUNT=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)

if [ "$JS_COUNT" -gt 0 ]; then
    check_result 0 "JavaScript files generated ($JS_COUNT files)"
else
    check_result 1 "No JavaScript files found"
fi

if [ "$CSS_COUNT" -gt 0 ]; then
    check_result 0 "CSS files generated ($CSS_COUNT files)"
else
    check_result 1 "No CSS files found"
fi

echo ""
echo "🔍 Verifying Asset Paths..."
echo "---------------------------"

# Check for relative paths in index.html
if grep -q 'src="\./assets' dist/index.html; then
    check_result 0 "Asset paths are relative (./assets/...)"
else
    if grep -q 'src="/assets' dist/index.html; then
        check_result 1 "Asset paths are absolute (/assets/...) - will cause issues"
    else
        check_result 1 "Could not verify asset paths"
    fi
fi

echo ""
echo "📊 Bundle Size Analysis..."
echo "--------------------------"

# Calculate bundle sizes
TOTAL_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
echo "Total bundle size: $TOTAL_SIZE"

# Check if dist folder is reasonable size (should be under 10MB)
DIST_SIZE_KB=$(du -sk dist 2>/dev/null | cut -f1)
if [ "$DIST_SIZE_KB" -lt 10240 ]; then
    check_result 0 "Bundle size is optimal (< 10MB)"
else
    check_result 1 "Bundle size is large (> 10MB) - may need optimization"
fi

echo ""
echo "📝 Checking Documentation..."
echo "-----------------------------"

[ -f "README.md" ] && check_result 0 "README.md exists" || check_result 1 "README.md missing"
[ -f "DEPLOYMENT.md" ] && check_result 0 "DEPLOYMENT.md exists" || check_result 1 "DEPLOYMENT.md missing"
[ -f ".env.example" ] && check_result 0 ".env.example exists" || check_result 1 ".env.example missing"

echo ""
echo "🐳 Validating Docker Configuration..."
echo "--------------------------------------"

# Check Dockerfile syntax
if grep -q "FROM node:18-alpine AS builder" Dockerfile; then
    check_result 0 "Dockerfile uses multi-stage build"
else
    check_result 1 "Dockerfile may have issues"
fi

if grep -q "FROM nginx:alpine" Dockerfile; then
    check_result 0 "Dockerfile uses Nginx for serving"
else
    check_result 1 "Nginx not configured in Dockerfile"
fi

# Check nginx.conf
if grep -q "application/javascript js mjs;" nginx.conf; then
    check_result 0 "nginx.conf has correct MIME types"
else
    check_result 1 "nginx.conf may have MIME type issues"
fi

echo ""
echo "=================================================="
echo "📊 Validation Summary"
echo "=================================================="
echo ""
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ "$CHECKS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🚀 Your application is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push code to Git repository"
    echo "2. Deploy to Coolify, Vercel, or Netlify"
    echo "3. Or run: docker build -t industrial-dashboard ."
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "See DEPLOYMENT.md for troubleshooting guide."
    echo ""
    exit 1
fi
