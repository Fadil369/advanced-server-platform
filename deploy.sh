#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="advanced-server"
ENVIRONMENT=${1:-development}
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}🚀 Deploying Advanced Server Platform - Environment: $ENVIRONMENT${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed.${NC}" >&2; exit 1; }
    docker compose version >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose is required but not installed.${NC}" >&2; exit 1; }
    command -v terraform >/dev/null 2>&1 || { echo -e "${RED}❌ Terraform is required but not installed.${NC}" >&2; exit 1; }
    command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI is required but not installed.${NC}" >&2; exit 1; }
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Function to setup environment
setup_environment() {
    echo -e "${YELLOW}🔧 Setting up environment...${NC}"
    
    # Create necessary directories
    mkdir -p data logs config monitoring/grafana mcp-servers nginx/ssl
    
    # Generate SSL certificates for development
    if [ "$ENVIRONMENT" = "development" ]; then
        if [ ! -f nginx/ssl/server.crt ]; then
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/server.key \
                -out nginx/ssl/server.crt \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        fi
    fi
    
    # Create environment file
    cat > .env << EOF
ENVIRONMENT=$ENVIRONMENT
AWS_REGION=$AWS_REGION
DATABASE_URL=postgresql://admin:password@postgres:5432/serverdb
REDIS_URL=redis://redis:6379
SECRET_KEY=$(openssl rand -hex 32)
EOF
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${YELLOW}🏗️ Deploying AWS infrastructure...${NC}"
        
        cd infrastructure/terraform
        
        terraform init
        terraform workspace select $ENVIRONMENT || terraform workspace new $ENVIRONMENT
        terraform plan -var="environment=$ENVIRONMENT"
        terraform apply -auto-approve -var="environment=$ENVIRONMENT"
        
        cd ../..
        
        echo -e "${GREEN}✅ Infrastructure deployed${NC}"
    else
        echo -e "${YELLOW}📝 Skipping infrastructure deployment for $ENVIRONMENT environment${NC}"
    fi
}

# Function to build and start services
start_services() {
    echo -e "${YELLOW}🐳 Building and starting services...${NC}"
    
    # Build MCP servers
    for mcp_server in filesystem aws code-analysis monitoring; do
        if [ -d "mcp-servers/$mcp_server" ]; then
            echo -e "${YELLOW}Building MCP server: $mcp_server${NC}"
            docker build -t "mcp-$mcp_server" "mcp-servers/$mcp_server"
        fi
    done
    
    # Start all services
    docker compose up -d --build
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to run health checks
health_check() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    # Wait for services to be ready
    sleep 30
    
    # Check main application
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Main application is healthy${NC}"
    else
        echo -e "${RED}❌ Main application health check failed${NC}"
        return 1
    fi
    
    # Check database
    if docker compose exec -T postgres pg_isready -U admin >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is healthy${NC}"
    else
        echo -e "${RED}❌ Database health check failed${NC}"
        return 1
    fi
    
    # Check Redis
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis is healthy${NC}"
    else
        echo -e "${RED}❌ Redis health check failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All health checks passed${NC}"
}

# Function to setup monitoring
setup_monitoring() {
    echo -e "${YELLOW}📊 Setting up monitoring...${NC}"
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'advanced-server'
    static_configs:
      - targets: ['app:8000']
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
EOF
    
    echo -e "${GREEN}✅ Monitoring setup complete${NC}"
}

# Function to display deployment summary
deployment_summary() {
    echo -e "${GREEN}"
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo "Environment: $ENVIRONMENT"
    echo "Main Application: http://localhost:8000"
    echo "Grafana Dashboard: http://localhost:3000 (admin/admin)"
    echo "Prometheus: http://localhost:9090"
    echo "RabbitMQ Management: http://localhost:15672 (admin/password)"
    echo ""
    echo "API Documentation: http://localhost:8000/docs"
    echo "Health Check: http://localhost:8000/health"
    echo ""
    echo "MCP Servers:"
    echo "- Filesystem: ws://localhost:8001"
    echo "- AWS Tools: ws://localhost:8002"
    echo "- Code Analysis: ws://localhost:8003"
    echo "- Monitoring: ws://localhost:8004"
    echo -e "${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    setup_environment
    setup_monitoring
    deploy_infrastructure
    start_services
    health_check
    deployment_summary
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        docker compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting services...${NC}"
        docker compose restart
        echo -e "${GREEN}✅ Services restarted${NC}"
        ;;
    "logs")
        docker compose logs -f
        ;;
    "clean")
        echo -e "${YELLOW}🧹 Cleaning up...${NC}"
        docker compose down -v
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|clean} [environment]"
        exit 1
        ;;
esac
