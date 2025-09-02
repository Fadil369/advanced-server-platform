#!/bin/bash

TUNNEL_NAME="advanced-server-platform"

case "$1" in
    start)
        echo "🚀 Starting Cloudflare tunnel..."
        cloudflared tunnel --config cloudflare-tunnel.yml run &
        echo "✅ Tunnel started in background"
        ;;
    stop)
        echo "🛑 Stopping Cloudflare tunnel..."
        pkill -f cloudflared
        echo "✅ Tunnel stopped"
        ;;
    status)
        if pgrep -f cloudflared > /dev/null; then
            echo "✅ Tunnel is running"
        else
            echo "❌ Tunnel is not running"
        fi
        ;;
    logs)
        echo "📋 Tunnel logs:"
        journalctl -u cloudflared -f
        ;;
    install-service)
        echo "📦 Installing tunnel as system service..."
        sudo cloudflared service install --config $PWD/cloudflare-tunnel.yml
        sudo systemctl enable cloudflared
        echo "✅ Service installed and enabled"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs|install-service}"
        echo ""
        echo "Commands:"
        echo "  start           - Start tunnel in background"
        echo "  stop            - Stop running tunnel"
        echo "  status          - Check tunnel status"
        echo "  logs            - View tunnel logs"
        echo "  install-service - Install as system service"
        exit 1
        ;;
esac
