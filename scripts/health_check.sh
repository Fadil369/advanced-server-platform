#!/bin/bash
# BrainSAIT LincCore Health Check Script

set -euo pipefail

TIMEOUT=${1:-300}
VERBOSE=${2:-false}

echo "🩺 BrainSAIT LincCore Health Check"

# Check main application
echo "Checking main application..."
curl -f http://localhost:8000/health || exit 1

# Check database
echo "Checking database..."
docker compose exec -T postgres pg_isready -h localhost -p 5432 -U admin || exit 1

# Check Redis
echo "Checking Redis..."
docker compose exec -T redis redis-cli ping || exit 1

# Check agents
echo "Checking agents..."
curl -f http://localhost:8000/agents/status || exit 1

echo "✅ All services healthy"
