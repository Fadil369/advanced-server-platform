#!/bin/bash

echo "🚀 Deploying BrainSait to Cloudflare Pages"

# Navigate to brainsait website directory
cd /home/ubuntu/brainsait-website

# Create a simple deployment using Cloudflare Pages
echo "📦 Preparing deployment package..."

# Create a deployment directory
mkdir -p /tmp/brainsait-deploy
cp -r public/* /tmp/brainsait-deploy/

# Add a simple _redirects file for SPA routing
echo "/* /index.html 200" > /tmp/brainsait-deploy/_redirects

echo "✅ Deployment package ready at /tmp/brainsait-deploy"
echo ""
echo "🌐 To deploy to Cloudflare Pages:"
echo "1. Go to https://dash.cloudflare.com/pages"
echo "2. Create a new project"
echo "3. Connect your GitHub repository: Fadil369/advanced-server-platform"
echo "4. Set build settings:"
echo "   - Build command: (leave empty)"
echo "   - Build output directory: brainsait-website/public"
echo "   - Root directory: /"
echo ""
echo "🔧 Or use Wrangler CLI:"
echo "   wrangler pages deploy /tmp/brainsait-deploy --project-name brainsait-com"
echo ""
echo "📋 Files ready for deployment:"
ls -la /tmp/brainsait-deploy/
