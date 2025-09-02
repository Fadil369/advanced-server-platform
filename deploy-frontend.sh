#!/bin/bash

# 🧠 BrainSAIT + Advanced Server Platform - Frontend Deployment
# NEURAL: Enhanced UI deployment with ultimate UX
# BRAINSAIT: Real-time dashboard with full integrations

set -euo pipefail

# Colors
readonly SIGNAL_TEAL='\033[38;2;14;165;233m'
readonly RESET='\033[0m'
readonly BOLD='\033[1m'

log() {
    echo -e "${SIGNAL_TEAL}[$(date +'%Y-%m-%d %H:%M:%S')] $1${RESET}"
}

log_success() {
    echo -e "${SIGNAL_TEAL}✅ $1${RESET}"
}

print_logo() {
    echo -e "${SIGNAL_TEAL}${BOLD}"
    echo "🎨 Enhanced UI Deployment for BrainSAIT + Advanced Server Platform"
    echo -e "${RESET}"
}

# Main deployment
main() {
    print_logo
    
    log "🚀 Deploying enhanced frontend..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Navigate to frontend directory
    cd frontend
    
    # Install dependencies
    log "📦 Installing dependencies..."
    npm install
    
    # Build the application
    log "🔨 Building application..."
    npm run build
    
    # Start the application
    log "🚀 Starting application..."
    npm run start &
    
    log_success "Frontend deployed successfully!"
    echo "🌐 Access the enhanced UI at: http://localhost:3000"
    echo "📊 Real-time dashboard with WebSocket integration"
    echo "🎯 Ultimate UX with animations and interactions"
}

case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "dev")
        cd frontend && npm run dev
        ;;
    "build")
        cd frontend && npm run build
        ;;
    *)
        echo "Usage: $0 {deploy|dev|build}"
        exit 1
        ;;
esac
