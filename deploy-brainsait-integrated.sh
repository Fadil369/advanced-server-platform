#!/bin/bash

echo "🚀 Deploying BrainSait with Advanced Server Platform Integration"

# Activate virtual environment
source /home/ubuntu/venv/bin/activate

# Start the advanced server platform
echo "Starting Advanced Server Platform..."
cd /home/ubuntu
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the content fetcher
echo "Testing content fetcher..."
curl -X POST http://localhost:8000/api/tools/fetch_content/execute \
  -H "Content-Type: application/json" \
  -d '{"path": ""}' || echo "Content fetch test failed"

# Start a simple HTTP server for brainsait website
echo "Starting BrainSait website..."
cd /home/ubuntu/brainsait-website/public
python3 -m http.server 3000 &
WEBSITE_PID=$!

echo "✅ Deployment complete!"
echo "🌐 Advanced Server Platform: http://localhost:8000"
echo "🧠 BrainSait Website: http://localhost:3000"
echo "📚 API Documentation: http://localhost:8000/docs"

echo "Server PID: $SERVER_PID"
echo "Website PID: $WEBSITE_PID"

# Keep script running
wait
