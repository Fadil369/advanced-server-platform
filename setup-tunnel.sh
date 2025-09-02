#!/bin/bash

echo "🚀 Setting up Cloudflare Tunnel for brainsait.com"

# Check if user is logged in
if ! cloudflared tunnel list &>/dev/null; then
    echo "❌ Please login to Cloudflare first:"
    echo "   cloudflared tunnel login"
    exit 1
fi

# Create tunnel
TUNNEL_NAME="advanced-server-platform"
echo "📡 Creating tunnel: $TUNNEL_NAME"

if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "✅ Tunnel '$TUNNEL_NAME' already exists"
else
    cloudflared tunnel create $TUNNEL_NAME
    echo "✅ Tunnel '$TUNNEL_NAME' created"
fi

# Get tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "🔑 Tunnel ID: $TUNNEL_ID"

# Update config with actual tunnel ID
sed -i "s/tunnel: advanced-server-platform/tunnel: $TUNNEL_ID/" cloudflare-tunnel.yml

echo "📝 Configuration file updated"
echo ""
echo "🌐 Next steps:"
echo "1. Add DNS records for brainsait.com:"
echo "   cloudflared tunnel route dns $TUNNEL_NAME brainsait.com"
echo "   cloudflared tunnel route dns $TUNNEL_NAME app.brainsait.com"
echo "   cloudflared tunnel route dns $TUNNEL_NAME docs.brainsait.com"
echo "   cloudflared tunnel route dns $TUNNEL_NAME grafana.brainsait.com"
echo "   cloudflared tunnel route dns $TUNNEL_NAME prometheus.brainsait.com"
echo "   cloudflared tunnel route dns $TUNNEL_NAME frontend.brainsait.com"
echo ""
echo "2. Start the tunnel:"
echo "   cloudflared tunnel --config cloudflare-tunnel.yml run"
echo ""
echo "3. Or run as service:"
echo "   sudo cloudflared service install --config $PWD/cloudflare-tunnel.yml"
echo "   sudo systemctl start cloudflared"
