#!/bin/bash

echo "🧠 Deploying BrainSait - GP Theme Replica with Advanced Integration"

# Activate virtual environment
source /home/ubuntu/venv/bin/activate

# Kill existing processes
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "python3 -m http.server" 2>/dev/null || true

# Start Advanced Server Platform
echo "🚀 Starting Advanced Server Platform..."
cd /home/ubuntu
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test content fetcher
echo "🔄 Testing content synchronization..."
curl -X POST http://localhost:8000/api/tools/fetch_content/execute \
  -H "Content-Type: application/json" \
  -d '{"path": ""}' > /dev/null 2>&1

# Start BrainSait Website
echo "🌐 Starting BrainSait Website..."
cd /home/ubuntu/brainsait-website/public
python3 -m http.server 3000 &
WEBSITE_PID=$!

echo ""
echo "✅ BrainSait Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧠 BrainSait Website: http://localhost:3000"
echo "🚀 Advanced Server Platform: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Features Available:"
echo "  • Exact GP theme replica with BrainSait branding"
echo "  • Real-time content sync from gp.thefadil.site"
echo "  • AI Agent management and execution"
echo "  • Comprehensive tool registry (8+ tools)"
echo "  • Live metrics and monitoring"
echo "  • MCP protocol integration"
echo ""
echo "Process IDs: Server=$SERVER_PID, Website=$WEBSITE_PID"

# Keep running
wait
