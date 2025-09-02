#!/bin/bash

TUNNEL_NAME="advanced-server-platform"

echo "🌐 Setting up DNS records for brainsait.com"

# Add DNS records
echo "📝 Adding DNS records..."

cloudflared tunnel route dns $TUNNEL_NAME brainsait.com
cloudflared tunnel route dns $TUNNEL_NAME app.brainsait.com
cloudflared tunnel route dns $TUNNEL_NAME docs.brainsait.com
cloudflared tunnel route dns $TUNNEL_NAME grafana.brainsait.com
cloudflared tunnel route dns $TUNNEL_NAME prometheus.brainsait.com
cloudflared tunnel route dns $TUNNEL_NAME frontend.brainsait.com

echo ""
echo "✅ DNS records configured for:"
echo "   • brainsait.com → Main Application"
echo "   • app.brainsait.com → Main Application"
echo "   • docs.brainsait.com → API Documentation"
echo "   • grafana.brainsait.com → Grafana Dashboard"
echo "   • prometheus.brainsait.com → Prometheus Metrics"
echo "   • frontend.brainsait.com → Frontend Application"
echo ""
echo "🚀 Ready to start tunnel with: ./manage-tunnel.sh start"
