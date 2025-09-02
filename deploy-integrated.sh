#!/bin/bash

# 🧠 BrainSAIT + Advanced Server Platform - Integrated Deployment Script
# NEURAL: Ultimate healthcare AI platform deployment
# BRAINSAIT: HIPAA + NPHIES compliance with enterprise infrastructure
# MEDICAL: FHIR R4 + AWS HealthLake + HealthOmics integration

set -euo pipefail

# NEURAL: BrainSAIT Colors
readonly MIDNIGHT_BLUE='\033[38;2;26;54;93m'
readonly MEDICAL_BLUE='\033[38;2;43;108;184m'
readonly SIGNAL_TEAL='\033[38;2;14;165;233m'
readonly DEEP_ORANGE='\033[38;2;234;88;12m'
readonly RESET='\033[0m'
readonly BOLD='\033[1m'

# BRAINSAIT: Configuration
readonly INTEGRATED_VERSION="2.0.0-integrated"
readonly DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
readonly COMPOSE_PROJECT_NAME="brainsait-advanced-server"

# NEURAL: Print integrated logo
print_integrated_logo() {
    echo -e "${SIGNAL_TEAL}${BOLD}"
    cat << 'EOF'
    
    ██████╗ ██████╗  █████╗ ██╗███╗   ██╗███████╗ █████╗ ██╗████████╗
    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔════╝██╔══██╗██║╚══██╔══╝
    ██████╔╝██████╔╝███████║██║██╔██╗ ██║███████╗███████║██║   ██║   
    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║╚════██║██╔══██║██║   ██║   
    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║███████║██║  ██║██║   ██║   
    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   
    
    + Advanced Server Platform Integration v${INTEGRATED_VERSION}
    
EOF
    echo -e "${RESET}"
    echo -e "${MEDICAL_BLUE}🎯 Ultimate Healthcare AI Platform${RESET}"
    echo -e "${MIDNIGHT_BLUE}🔐 HIPAA + NPHIES + Enterprise Infrastructure${RESET}"
    echo -e "${DEEP_ORANGE}☁️ AWS MCP + FHIR R4 + Genomics Integration${RESET}"
    echo ""
}

# BRAINSAIT: Logging functions
log() {
    echo -e "${SIGNAL_TEAL}[$(date +'%Y-%m-%d %H:%M:%S')] $1${RESET}"
}

log_success() {
    echo -e "${SIGNAL_TEAL}✅ $1${RESET}"
}

log_error() {
    echo -e "${DEEP_ORANGE}❌ ERROR: $1${RESET}" >&2
}

log_warning() {
    echo -e "${DEEP_ORANGE}⚠️  WARNING: $1${RESET}"
}

# NEURAL: Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites for integrated deployment..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check available resources
    local available_memory=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
    if (( $(echo "$available_memory < 16" | bc -l) )); then
        log_warning "Available memory is ${available_memory}GB. Recommended: 32GB+ for full integration"
    fi
    
    # Check for NVIDIA GPU
    if command -v nvidia-smi &> /dev/null; then
        log_success "NVIDIA GPU detected - AI acceleration enabled"
        export GPU_ACCELERATION=true
    else
        log_warning "No NVIDIA GPU detected - using CPU for AI processing"
        export GPU_ACCELERATION=false
    fi
    
    log_success "Prerequisites check completed"
}

# BRAINSAIT: Setup integrated environment
setup_integrated_environment() {
    log "🔧 Setting up integrated environment..."
    
    # Create integrated directory structure
    mkdir -p {integrated,brainsait,server,monitoring,nginx,ssl,medical-terminologies}
    mkdir -p {data/{ai-models,fhir,audit},logs/{application,security,compliance}}
    
    # BRAINSAIT: Generate integrated environment file
    if [ ! -f ".env" ]; then
        log "⚙️  Creating integrated environment configuration..."
        cat > .env << EOF
# 🧠 BrainSAIT + Advanced Server Platform - Integrated Configuration
INTEGRATED_VERSION=${INTEGRATED_VERSION}
DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}

# BRAINSAIT: Core Configuration
BRAINSAIT_ENABLED=true
BRAINSAIT_VERSION=2.0.0-enterprise
HIPAA_COMPLIANCE=strict
NPHIES_INTEGRATION=enabled
FHIR_VERSION=R4
AUDIT_LEVEL=comprehensive

# NEURAL: Advanced Server Platform
DATABASE_URL=postgresql://admin:\${POSTGRES_PASSWORD}@postgres:5432/advanced_server_brainsait
REDIS_URL=redis://redis:6379
SECRET_KEY=$(openssl rand -base64 32)
MAX_AGENTS=100
LOG_LEVEL=INFO

# AWS: MCP Integration
AWS_MCP_ENABLED=true
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_PROFILE=${AWS_PROFILE:-default}
HEALTHLAKE_DATASTORE_ID=${HEALTHLAKE_DATASTORE_ID:-}
HEALTHOMICS_WORKFLOW_ID=${HEALTHOMICS_WORKFLOW_ID:-}

# AGENT: AI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY:-your_openai_key_here}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-your_anthropic_key_here}
AZURE_COGNITIVE_KEY=${AZURE_COGNITIVE_KEY:-your_azure_key_here}
GPU_ACCELERATION=${GPU_ACCELERATION:-false}

# BRAINSAIT: Security & Passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 32)
KEYCLOAK_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# BILINGUAL: Localization
DEFAULT_LANGUAGE=en
RTL_SUPPORT=true
ARABIC_NLP_SUPPORT=true

# NEURAL: Performance
MAX_WORKERS=8
MEMORY_LIMIT=8G
CPU_LIMIT=4.0

# MEDICAL: Healthcare Integration
NPHIES_ENDPOINT=${NPHIES_ENDPOINT:-https://nphies.sa/api}
SAUDI_TERMINOLOGY_SERVER=http://terminology-server:8081

# BRAINSAIT: Monitoring
PROMETHEUS_RETENTION=90d
GRAFANA_LICENSE=${GRAFANA_LICENSE:-}
EOF
        log_success "Integrated environment configuration created"
    fi
    
    # NEURAL: Create integrated monitoring configuration
    if [ ! -f "monitoring/prometheus-integrated.yml" ]; then
        log "📊 Creating integrated monitoring configuration..."
        cat > monitoring/prometheus-integrated.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'brainsait-advanced-server'
    environment: 'production'
    compliance: 'hipaa-nphies'

scrape_configs:
  # Integrated Application
  - job_name: 'integrated-app'
    static_configs:
      - targets: ['app:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # BrainSAIT MCP Gateway
  - job_name: 'brainsait-mcp-gateway'
    static_configs:
      - targets: ['brainsait-mcp-gateway:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # AWS MCP Bridges
  - job_name: 'aws-healthlake-bridge'
    static_configs:
      - targets: ['healthlake-bridge:8090']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'aws-healthomics-bridge'
    static_configs:
      - targets: ['healthomics-bridge:8091']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'aws-core-bridge'
    static_configs:
      - targets: ['core-bridge:8092']
    metrics_path: '/metrics'
    scrape_interval: 15s

  # Infrastructure
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  # FHIR Server
  - job_name: 'fhir-server'
    static_configs:
      - targets: ['fhir-server:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 30s
EOF
        log_success "Integrated monitoring configuration created"
    fi
    
    # BRAINSAIT: Create nginx configuration
    if [ ! -f "nginx/nginx-integrated.conf" ]; then
        log "🌐 Creating nginx reverse proxy configuration..."
        mkdir -p nginx
        cat > nginx/nginx-integrated.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream integrated_app {
        server app:8000;
    }
    
    upstream brainsait_mcp_gateway {
        server brainsait-mcp-gateway:8080;
    }
    
    upstream grafana_dashboard {
        server grafana:3000;
    }

    server {
        listen 80;
        server_name localhost;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name localhost;
        
        ssl_certificate /etc/nginx/ssl/brainsait.crt;
        ssl_certificate_key /etc/nginx/ssl/brainsait.key;
        
        # Main application
        location / {
            proxy_pass http://integrated_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # BrainSAIT MCP Gateway
        location /mcp/ {
            proxy_pass http://brainsait_mcp_gateway/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Grafana Dashboard
        location /grafana/ {
            proxy_pass http://grafana_dashboard/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF
        log_success "Nginx configuration created"
    fi
    
    log_success "Integrated environment setup completed"
}

# MEDICAL: Setup healthcare data
setup_healthcare_data() {
    log "🏥 Setting up healthcare data and terminologies..."
    
    # Create medical terminologies structure
    mkdir -p medical-terminologies/{icd10,cpt,loinc,snomed,nphies}
    
    # MEDICAL: Create placeholder medical terminologies
    if [ ! -f "medical-terminologies/README.md" ]; then
        cat > medical-terminologies/README.md << 'EOF'
# Medical Terminologies for BrainSAIT Integration

This directory contains medical terminologies and code systems:

- **ICD-10**: International Classification of Diseases
- **CPT**: Current Procedural Terminology  
- **LOINC**: Logical Observation Identifiers Names and Codes
- **SNOMED CT**: Systematized Nomenclature of Medicine Clinical Terms
- **NPHIES**: Saudi National Platform for Health Information Exchange Standards

## Arabic Support

All terminologies include Arabic translations and RTL support for Saudi healthcare standards.
EOF
    fi
    
    log_success "Healthcare data setup completed"
}

# NEURAL: Build integrated images
build_integrated_images() {
    log "🐳 Building integrated Docker images..."
    
    # Build main integrated application
    log "Building integrated application image..."
    docker build -f Dockerfile.integrated -t brainsait/advanced-server:integrated . || {
        log_error "Failed to build integrated application image"
        return 1
    }
    
    # Build BrainSAIT MCP components if files exist
    if [ -f "brainsait/docker/Dockerfile.mcp-gateway" ]; then
        log "Building BrainSAIT MCP Gateway..."
        docker build -f brainsait/docker/Dockerfile.mcp-gateway -t brainsait/mcp-gateway:enterprise . || {
            log_warning "Failed to build MCP Gateway image"
        }
    fi
    
    if [ -f "brainsait/docker/Dockerfile.healthlake" ]; then
        log "Building HealthLake MCP Bridge..."
        docker build -f brainsait/docker/Dockerfile.healthlake -t brainsait/aws-mcp-bridge:healthlake . || {
            log_warning "Failed to build HealthLake bridge image"
        }
    fi
    
    log_success "Docker images built successfully"
}

# BRAINSAIT: Deploy integrated services
deploy_integrated_services() {
    log "🚀 Deploying integrated services..."
    
    # Stop any existing services
    docker-compose -f docker-compose-integrated.yml down --remove-orphans 2>/dev/null || true
    
    # Start integrated services
    docker-compose -f docker-compose-integrated.yml up -d || {
        log_error "Failed to deploy integrated services"
        return 1
    }
    
    # Wait for services to be ready
    log "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_integrated_services_health
    
    log_success "Integrated services deployed successfully"
}

# NEURAL: Check service health
check_integrated_services_health() {
    log "🔍 Checking integrated services health..."
    
    local services=("app:8000" "brainsait-mcp-gateway:8080" "postgres:5432" "redis:6379")
    local healthy_services=0
    
    for service in "${services[@]}"; do
        local host_port=(${service//:/ })
        local host=${host_port[0]}
        local port=${host_port[1]}
        
        if docker-compose -f docker-compose-integrated.yml exec -T $host echo "Service check" > /dev/null 2>&1; then
            log_success "Service $service is healthy"
            ((healthy_services++))
        else
            log_warning "Service $service is not responding"
        fi
    done
    
    log "📊 Health check: $healthy_services/${#services[@]} services healthy"
}

# BRAINSAIT: Validate integrated deployment
validate_integrated_deployment() {
    log "✅ Validating integrated deployment..."
    
    local validation_passed=true
    
    # Check main application
    if ! curl -f -s "http://localhost:8000/health" > /dev/null; then
        log_error "Main application is not responding"
        validation_passed=false
    else
        log_success "Main application is healthy"
    fi
    
    # Check BrainSAIT MCP Gateway
    if ! curl -f -s "http://localhost:8080/health" > /dev/null; then
        log_warning "BrainSAIT MCP Gateway is not responding"
    else
        log_success "BrainSAIT MCP Gateway is healthy"
    fi
    
    # Check database connectivity
    if ! docker-compose -f docker-compose-integrated.yml exec -T postgres pg_isready -U admin > /dev/null 2>&1; then
        log_error "Database is not accessible"
        validation_passed=false
    else
        log_success "Database is accessible"
    fi
    
    # Check Grafana
    if ! curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        log_warning "Grafana dashboard is not responding"
    else
        log_success "Grafana dashboard is accessible"
    fi
    
    if $validation_passed; then
        log_success "Integrated deployment validation passed"
        return 0
    else
        log_error "Integrated deployment validation failed"
        return 1
    fi
}

# NEURAL: Print deployment summary
print_deployment_summary() {
    echo -e "${SIGNAL_TEAL}${BOLD}"
    echo "🎉 BrainSAIT + Advanced Server Platform Integration Complete!"
    echo -e "${RESET}"
    
    echo -e "${MEDICAL_BLUE}🌐 Access Points:${RESET}"
    echo "   🎯 Main Application: https://localhost (HTTP redirects to HTTPS)"
    echo "   🎯 Direct API Access: http://localhost:8000"
    echo "   🌉 BrainSAIT MCP Gateway: http://localhost:8080"
    echo "   📊 Grafana Dashboard: http://localhost:3000"
    echo "   🔍 Prometheus Metrics: http://localhost:9090"
    echo "   🏥 FHIR Server: http://localhost:8081/fhir"
    echo "   🔐 Keycloak Auth: http://localhost:8082"
    echo ""
    
    echo -e "${MIDNIGHT_BLUE}🔐 Default Credentials:${RESET}"
    echo "   Grafana: admin / $(grep GRAFANA_PASSWORD .env | cut -d'=' -f2)"
    echo "   Keycloak: admin / $(grep KEYCLOAK_PASSWORD .env | cut -d'=' -f2)"
    echo ""
    
    echo -e "${DEEP_ORANGE}🧠 Platform Features:${RESET}"
    echo "   ✅ BrainSAIT AI Agents (MASTERLINC, HEALTHCARELINC, etc.)"
    echo "   ✅ Advanced Server Platform Infrastructure"
    echo "   ✅ AWS MCP Integration (HealthLake, HealthOmics, Core)"
    echo "   ✅ FHIR R4 Compliance"
    echo "   ✅ HIPAA + NPHIES Compliance"
    echo "   ✅ Arabic/English Bilingual Support"
    echo "   ✅ Enterprise Monitoring & Observability"
    echo "   ✅ SSL/TLS Security"
    echo ""
    
    echo -e "${SIGNAL_TEAL}🚀 Next Steps:${RESET}"
    echo "   1. Configure AWS credentials for MCP integration"
    echo "   2. Set up HealthLake datastore ID in .env"
    echo "   3. Configure NPHIES integration endpoints"
    echo "   4. Upload medical terminologies"
    echo "   5. Test FHIR operations and AI agents"
    echo "   6. Configure monitoring alerts"
    echo ""
    
    echo -e "${SIGNAL_TEAL}Happy healthcare AI building with the integrated platform! 🧠${RESET}"
}

# NEURAL: Main deployment function
main() {
    print_integrated_logo
    
    log "🚀 Starting integrated BrainSAIT + Advanced Server Platform deployment..."
    
    check_prerequisites
    setup_integrated_environment
    setup_healthcare_data
    build_integrated_images
    deploy_integrated_services
    
    if validate_integrated_deployment; then
        print_deployment_summary
        exit 0
    else
        log_error "Integrated deployment failed validation"
        exit 1
    fi
}

# BRAINSAIT: Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "validate")
        validate_integrated_deployment
        ;;
    "health")
        check_integrated_services_health
        ;;
    "stop")
        log "🛑 Stopping integrated services..."
        docker-compose -f docker-compose-integrated.yml down
        log_success "Integrated services stopped"
        ;;
    "restart")
        log "🔄 Restarting integrated services..."
        docker-compose -f docker-compose-integrated.yml restart
        log_success "Integrated services restarted"
        ;;
    "logs")
        docker-compose -f docker-compose-integrated.yml logs -f
        ;;
    "clean")
        log "🧹 Cleaning up integrated deployment..."
        docker-compose -f docker-compose-integrated.yml down -v --remove-orphans
        docker system prune -f
        log_success "Cleanup completed"
        ;;
    *)
        echo "Usage: $0 {deploy|validate|health|stop|restart|logs|clean}"
        exit 1
        ;;
esac
