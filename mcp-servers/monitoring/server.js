const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'Monitoring MCP Server Running',
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 8004;
server.listen(PORT, () => {
  console.log(`Monitoring MCP Server running on port ${PORT}`);
});
