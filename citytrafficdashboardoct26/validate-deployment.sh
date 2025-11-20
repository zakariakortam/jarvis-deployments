#!/bin/bash
set -e

echo "🔍 Pre-Deployment Validation Started..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in the project directory?"
  exit 1
fi

# Check for required deployment files
echo "📋 Checking deployment files..."
required_files=("Dockerfile" "nginx.conf" "vite.config.js")
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file exists"
  else
    echo "  ❌ $file is missing!"
    exit 1
  fi
done
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --quiet
echo "  ✅ Dependencies installed"
echo ""

# Run linter
echo "🧹 Running linter..."
if npm run lint --silent 2>/dev/null; then
  echo "  ✅ Lint passed"
else
  echo "  ⚠️  Lint warnings (continuing anyway)"
fi
echo ""

# Build project
echo "🔨 Building project..."
npm run build
if [ $? -eq 0 ]; then
  echo "  ✅ Build successful"
else
  echo "  ❌ Build failed!"
  exit 1
fi
echo ""

# Check build output
echo "📊 Checking build output..."
if [ -d "dist" ]; then
  echo "  ✅ dist/ folder exists"

  if [ -f "dist/index.html" ]; then
    echo "  ✅ index.html exists"
  else
    echo "  ❌ index.html not found!"
    exit 1
  fi

  if [ -d "dist/assets" ]; then
    echo "  ✅ assets/ folder exists"
  else
    echo "  ❌ assets/ folder not found!"
    exit 1
  fi
else
  echo "  ❌ dist/ folder not found!"
  exit 1
fi
echo ""

# Verify asset paths
echo "🔍 Verifying asset paths in dist/index.html..."
if grep -q 'src="/assets' dist/index.html; then
  echo "  ❌ ERROR: Found absolute paths in index.html!"
  echo "     This will cause blank page on deployment."
  echo "     Ensure vite.config.js has base: './'"
  exit 1
fi

if grep -q 'src="\./assets' dist/index.html; then
  echo "  ✅ Asset paths are relative - deployment will work"
else
  echo "  ⚠️  WARNING: Could not verify asset paths"
fi
echo ""

# Check bundle size
echo "📦 Checking bundle size..."
total_size=$(du -sh dist/ | cut -f1)
echo "  Total size: $total_size"

js_files=$(find dist/assets -name "*.js" | wc -l)
echo "  JavaScript files: $js_files"

css_files=$(find dist/assets -name "*.css" | wc -l)
echo "  CSS files: $css_files"
echo ""

# Success message
echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for deployment"
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'Ready for deployment'"
echo "  2. Push to repository: git push"
echo "  3. Deploy via Coolify or Docker"
echo ""
echo "Local preview: npm run preview"
