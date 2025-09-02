const http = require('http');
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'AWS MCP Server Running',
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 8002;
server.listen(PORT, () => {
  console.log(`AWS MCP Server running on port ${PORT}`);
});
