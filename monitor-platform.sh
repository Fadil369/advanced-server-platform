#!/bin/bash

# Advanced Server Platform Monitoring & Auto-Healing Script
# Monitors all services and automatically fixes issues

LOG_FILE="/home/ubuntu/logs/platform-monitor.log"
HEALTH_URL="https://app.brainsait.com/health"
TUNNEL_SERVICE="cloudflared"

# Create logs directory if it doesn't exist
mkdir -p /home/ubuntu/logs

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_tunnel() {
    if ! systemctl is-active --quiet $TUNNEL_SERVICE; then
        log "❌ Cloudflared tunnel is down - restarting..."
        sudo systemctl restart $TUNNEL_SERVICE
        sleep 5
        if systemctl is-active --quiet $TUNNEL_SERVICE; then
            log "✅ Cloudflared tunnel restarted successfully"
        else
            log "🚨 Failed to restart cloudflared tunnel"
        fi
    else
        log "✅ Cloudflared tunnel is running"
    fi
}

check_docker_services() {
    local services=("app" "postgres" "redis" "grafana" "prometheus" "nginx" "frontend")
    
    for service in "${services[@]}"; do
        if ! docker compose ps --services --filter "status=running" | grep -q "^${service}$"; then
            log "❌ Docker service $service is down - restarting..."
            docker compose restart $service
            sleep 3
            if docker compose ps --services --filter "status=running" | grep -q "^${service}$"; then
                log "✅ Docker service $service restarted successfully"
            else
                log "🚨 Failed to restart docker service $service"
            fi
        else
            log "✅ Docker service $service is running"
        fi
    done
}

check_app_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 10)
    
    if [ "$response" != "200" ]; then
        log "❌ App health check failed (HTTP $response) - restarting app..."
        docker compose restart app
        sleep 10
        
        local retry_response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 10)
        if [ "$retry_response" = "200" ]; then
            log "✅ App health check passed after restart"
        else
            log "🚨 App health check still failing after restart"
        fi
    else
        log "✅ App health check passed"
    fi
}

check_mcp_servers() {
    local mcp_status=$(curl -s "$HEALTH_URL" | jq -r '.services.mcp_servers | to_entries[] | select(.value == "unhealthy") | .key' 2>/dev/null)
    
    if [ -n "$mcp_status" ]; then
        log "❌ Unhealthy MCP servers detected: $mcp_status"
        # Restart MCP containers
        docker compose restart mcp-filesystem mcp-aws mcp-code-analysis mcp-monitoring
        log "🔄 Restarted all MCP servers"
    else
        log "✅ All MCP servers are healthy"
    fi
}

check_system_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    log "📊 System Resources - CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
    
    # Alert if resources are high
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log "⚠️  High CPU usage detected: ${cpu_usage}%"
    fi
    
    if (( $(echo "$memory_usage > 85" | bc -l) )); then
        log "⚠️  High memory usage detected: ${memory_usage}%"
    fi
    
    if [ "$disk_usage" -gt 90 ]; then
        log "⚠️  High disk usage detected: ${disk_usage}%"
        # Clean up old logs
        find /home/ubuntu/logs -name "*.log" -mtime +7 -delete
        log "🧹 Cleaned up old log files"
    fi
}

generate_status_report() {
    log "📋 Generating status report..."
    
    local report_file="/home/ubuntu/logs/status-report-$(date +%Y%m%d-%H%M%S).json"
    
    curl -s https://app.brainsait.com/api/status > "$report_file"
    
    if [ $? -eq 0 ]; then
        log "✅ Status report saved to $report_file"
    else
        log "❌ Failed to generate status report"
    fi
}

main() {
    log "🚀 Starting Advanced Server Platform monitoring cycle..."
    
    check_tunnel
    check_docker_services
    check_app_health
    check_mcp_servers
    check_system_resources
    
    # Generate detailed report every hour
    local current_minute=$(date +%M)
    if [ "$current_minute" = "00" ]; then
        generate_status_report
    fi
    
    log "✅ Monitoring cycle completed successfully"
    echo "---"
}

# Run monitoring
main
