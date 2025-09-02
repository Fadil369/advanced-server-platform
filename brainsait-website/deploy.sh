#!/bin/bash

# BrainSait Website Deployment Script
# Deploys to Cloudflare Pages with GitHub integration

echo "🚀 BrainSait Website Deployment"
echo "================================"

# Check if we're in the right directory
if [ ! -f "public/index.html" ]; then
    echo "❌ Error: Must be run from brainsait-website directory"
    exit 1
fi

# Build step (if needed)
echo "📦 Building website..."
npm run build

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."

# Option 1: Direct deployment (if wrangler is configured)
if command -v wrangler &> /dev/null; then
    echo "Using Wrangler CLI for deployment..."
    wrangler pages deploy public --project-name brainsait-website --compatibility-date 2024-09-02
else
    echo "⚠️  Wrangler CLI not found. Please install with: npm install -g wrangler"
    echo "📋 Manual deployment steps:"
    echo "1. Go to Cloudflare Dashboard > Pages"
    echo "2. Create new project: brainsait-website"
    echo "3. Connect to GitHub repository: Fadil369/brainsait-website"
    echo "4. Set build settings:"
    echo "   - Build command: npm run build"
    echo "   - Build output directory: public"
    echo "   - Root directory: /"
    echo "5. Add custom domain: brainsait.com"
    echo "6. Configure DNS to point to Cloudflare Pages"
fi

# Git operations
echo "📝 Committing changes..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub (if repository exists)
if git remote get-url origin &> /dev/null; then
    echo "📤 Pushing to GitHub..."
    git push origin main
else
    echo "⚠️  GitHub repository not configured"
    echo "📋 Manual GitHub setup:"
    echo "1. Create repository: https://github.com/new"
    echo "2. Repository name: brainsait-website"
    echo "3. Run: git remote add origin https://github.com/Fadil369/brainsait-website.git"
    echo "4. Run: git push -u origin main"
fi

echo ""
echo "✅ Deployment process completed!"
echo "🌐 Website will be available at: https://brainsait.com"
echo "📊 Dashboard integration: https://app.brainsait.com/dashboard"
echo "📚 API Documentation: https://docs.brainsait.com/docs"
