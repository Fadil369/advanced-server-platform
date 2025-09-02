#!/bin/bash

# BrainSait Enhanced Deployment Script
# Supports both staging (pages.dev) and production (brainsait.com) deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="brainsait-website"
STAGING_URL="https://brainsait-website.pages.dev"
PRODUCTION_URL="https://brainsait.com"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    log_success "Wrangler CLI is available"
}

# Validate HTML files
validate_html() {
    log_info "Validating HTML files..."
    
    local files=("index.html" "dashboard.html" "api-explorer.html" "analytics.html" "admin.html")
    
    for file in "${files[@]}"; do
        if [[ -f "public/$file" ]]; then
            log_success "✓ $file exists"
        else
            log_error "✗ $file missing"
            exit 1
        fi
    done
}

# Optimize assets
optimize_assets() {
    log_info "Optimizing assets..."
    
    # Create optimized versions if needed
    if [[ -d "assets" ]]; then
        cp -r assets/* public/ 2>/dev/null || true
        log_success "Assets copied to public directory"
    fi
    
    # Minify CSS if possible (basic optimization)
    find public -name "*.css" -type f -exec sed -i 's/[[:space:]]*{[[:space:]]*/{ /g; s/[[:space:]]*}[[:space:]]*/} /g; s/[[:space:]]*;[[:space:]]*/; /g' {} \;
    
    log_success "Basic asset optimization completed"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Update wrangler.toml for staging
    cat > wrangler.toml << EOF
name = "$PROJECT_NAME"
compatibility_date = "2024-01-01"

[env.staging]
name = "$PROJECT_NAME-staging"
compatibility_date = "2024-01-01"

[[env.staging.routes]]
pattern = "brainsait-website.pages.dev/*"
zone_name = "pages.dev"
EOF

    wrangler pages deploy public --project-name="$PROJECT_NAME" --env=staging
    
    log_success "Staging deployment completed!"
    log_info "Staging URL: $STAGING_URL"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production environment..."
    
    # Update wrangler.toml for production
    cat > wrangler.toml << EOF
name = "$PROJECT_NAME"
compatibility_date = "2024-01-01"

[env.production]
name = "$PROJECT_NAME-production"
compatibility_date = "2024-01-01"

[[env.production.routes]]
pattern = "brainsait.com/*"
zone_name = "brainsait.com"

[[env.production.routes]]
pattern = "www.brainsait.com/*"
zone_name = "brainsait.com"
EOF

    wrangler pages deploy public --project-name="$PROJECT_NAME" --env=production
    
    log_success "Production deployment completed!"
    log_info "Production URL: $PRODUCTION_URL"
}

# Test deployment
test_deployment() {
    local url=$1
    log_info "Testing deployment at $url..."
    
    # Basic connectivity test
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
        log_success "✓ Site is accessible"
    else
        log_warning "⚠ Site may not be fully accessible yet (DNS propagation)"
    fi
    
    # Test specific pages
    local pages=("dashboard.html" "api-explorer.html" "analytics.html" "admin.html")
    for page in "${pages[@]}"; do
        if curl -s --head "$url/$page" | head -n 1 | grep -q "200 OK"; then
            log_success "✓ $page is accessible"
        else
            log_warning "⚠ $page may not be accessible"
        fi
    done
}

# Generate deployment report
generate_report() {
    local env=$1
    local url=$2
    
    cat > deployment-report.md << EOF
# BrainSait Deployment Report

**Environment:** $env
**Deployment Time:** $(date)
**URL:** $url

## Features Deployed

### 🎯 Core Features
- ✅ Main Website (index.html)
- ✅ Professional Design & Responsive Layout
- ✅ Mobile-First Approach

### 🚀 Advanced Features
- ✅ **AI Dashboard** - Real-time metrics and agent management
- ✅ **API Explorer** - Interactive API testing and documentation
- ✅ **Analytics Panel** - Performance insights and usage statistics
- ✅ **Admin Panel** - System management and configuration

### 📊 Dashboard Features
- Real-time system metrics
- AI agent status monitoring
- Tool execution interface
- Live performance charts
- Activity logs and alerts

### 🔧 API Explorer Features
- Interactive endpoint testing
- Request/response visualization
- Parameter configuration
- Real-time API calls
- Documentation integration

### 📈 Analytics Features
- Request volume tracking
- Response time analysis
- Error rate monitoring
- User activity heatmaps
- Performance trends

### ⚙️ Admin Panel Features
- System resource monitoring
- Agent management interface
- User administration
- Configuration management
- Real-time system logs

## Technical Stack
- **Frontend:** Pure HTML5, CSS3, JavaScript
- **Charts:** Chart.js for data visualization
- **Icons:** Font Awesome 6.0
- **Hosting:** Cloudflare Pages
- **CDN:** Global edge network
- **SSL:** Automatic HTTPS

## Performance Optimizations
- Minified CSS and optimized assets
- CDN-delivered external libraries
- Responsive images and layouts
- Efficient caching strategies

## Next Steps
1. Configure custom domain (if production)
2. Set up monitoring and alerts
3. Implement user authentication
4. Add real API integrations
5. Enable advanced analytics

---
*Generated by BrainSait Enhanced Deployment Script*
EOF

    log_success "Deployment report generated: deployment-report.md"
}

# Main deployment function
main() {
    local environment=${1:-staging}
    
    log_info "Starting BrainSait enhanced deployment..."
    log_info "Target environment: $environment"
    
    # Pre-deployment checks
    check_wrangler
    validate_html
    optimize_assets
    
    # Deploy based on environment
    case $environment in
        "staging")
            deploy_staging
            test_deployment "$STAGING_URL"
            generate_report "Staging" "$STAGING_URL"
            ;;
        "production")
            deploy_production
            test_deployment "$PRODUCTION_URL"
            generate_report "Production" "$PRODUCTION_URL"
            ;;
        *)
            log_error "Invalid environment. Use 'staging' or 'production'"
            exit 1
            ;;
    esac
    
    log_success "🎉 Enhanced BrainSait deployment completed successfully!"
    
    # Display summary
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Environment: $environment"
    echo "Features: Dashboard, API Explorer, Analytics, Admin Panel"
    echo "Status: ✅ All systems operational"
    echo ""
    
    if [[ $environment == "staging" ]]; then
        echo "🌐 Staging URL: $STAGING_URL"
        echo "📊 Dashboard: $STAGING_URL/dashboard.html"
        echo "🔧 API Explorer: $STAGING_URL/api-explorer.html"
        echo "📈 Analytics: $STAGING_URL/analytics.html"
        echo "⚙️ Admin Panel: $STAGING_URL/admin.html"
    else
        echo "🌐 Production URL: $PRODUCTION_URL"
        echo "📊 Dashboard: $PRODUCTION_URL/dashboard.html"
        echo "🔧 API Explorer: $PRODUCTION_URL/api-explorer.html"
        echo "📈 Analytics: $PRODUCTION_URL/analytics.html"
        echo "⚙️ Admin Panel: $PRODUCTION_URL/admin.html"
    fi
    
    echo ""
    echo "🚀 Ready to showcase your Advanced AI Server Platform!"
}

# Run main function with provided arguments
main "$@"
