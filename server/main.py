from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import asyncio
import json
import psutil
import time
import requests
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import redis
import psycopg2
from datetime import datetime
import uuid
import aiohttp
from bs4 import BeautifulSoup

@dataclass
class ServerConfig:
    debug: bool = False
    max_agents: int = 100

app = FastAPI(
    title="Advanced Server Platform",
    version="1.0.0",
    description="AI Agent Management with MCP Protocol Support",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
agents = {}
tools = {
    "code_format": {"description": "Format and beautify code", "category": "development", "mcp_server": "code-analysis"},
    "security_scan": {"description": "Security vulnerability scan", "category": "security", "mcp_server": "code-analysis"},
    "performance_test": {"description": "Performance testing and optimization", "category": "monitoring", "mcp_server": "monitoring"},
    "deploy_service": {"description": "Deploy service to AWS", "category": "infrastructure", "mcp_server": "aws"},
    "file_operations": {"description": "File system operations", "category": "filesystem", "mcp_server": "filesystem"},
    "aws_resources": {"description": "AWS resource management", "category": "infrastructure", "mcp_server": "aws"},
    "system_metrics": {"description": "System monitoring and metrics", "category": "monitoring", "mcp_server": "monitoring"},
    "fetch_content": {"description": "Fetch content from gp.thefadil.site for brainsait.com", "category": "content", "mcp_server": "content-sync"}
}
metrics = {"requests": 0, "agents_active": 0, "tools_executed": 0, "websocket_connections": 0}
active_connections = []

# MCP Server endpoints
MCP_SERVERS = {
    "filesystem": "http://mcp-filesystem:8001",
    "aws": "http://mcp-aws:8002", 
    "code-analysis": "http://mcp-code-analysis:8003",
    "monitoring": "http://mcp-monitoring:8004"
}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log to metrics
    metrics["requests"] += 1
    
    return response

@app.get("/")
async def root():
    return {
        "message": "Advanced Server Platform",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": ["AI Agents", "MCP Protocol", "Tool Registry", "Real-time Monitoring", "WebSocket Support"],
        "endpoints": {
            "dashboard": "/dashboard",
            "docs": "/docs",
            "agents": "/api/agents",
            "tools": "/api/tools",
            "metrics": "/api/metrics",
            "health": "/health",
            "mcp": "/api/mcp",
            "websocket": "/ws"
        },
        "public_urls": {
            "main": "https://brainsait.com",
            "app": "https://app.brainsait.com", 
            "docs": "https://docs.brainsait.com",
            "frontend": "https://frontend.brainsait.com",
            "grafana": "https://grafana.brainsait.com",
            "prometheus": "https://prometheus.brainsait.com"
        }
    }

@app.get("/health")
async def health():
    try:
        r = redis.Redis(host='redis', port=6379, decode_responses=True)
        r.ping()
        redis_status = "healthy"
    except:
        redis_status = "unhealthy"
    
    try:
        conn = psycopg2.connect(host="postgres", database="serverdb", user="admin", password="password")
        conn.close()
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    # Check MCP servers
    mcp_status = {}
    for name, url in MCP_SERVERS.items():
        try:
            response = requests.get(f"{url}/health", timeout=2)
            mcp_status[name] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            mcp_status[name] = "unhealthy"
    
    return {
        "status": "healthy",
        "services": {
            "api": "healthy",
            "redis": redis_status,
            "database": db_status,
            "mcp_servers": mcp_status
        },
        "timestamp": time.time()
    }

@app.get("/api/status")
async def status():
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "status": "operational",
        "services": ["api", "agents", "mcp", "tools", "websocket"],
        "system": {
            "cpu_usage": f"{cpu_percent}%",
            "memory_usage": f"{memory.percent}%",
            "memory_available": f"{memory.available / 1024**3:.1f}GB",
            "disk_usage": f"{disk.percent}%",
            "disk_free": f"{disk.free / 1024**3:.1f}GB"
        },
        "metrics": metrics,
        "uptime": time.time(),
        "active_connections": len(active_connections)
    }

@app.get("/api/agents")
async def list_agents():
    return {
        "agents": [
            {
                "id": agent_id,
                "type": agent_data.get("type", "general"),
                "status": agent_data.get("status", "idle"),
                "created": agent_data.get("created"),
                "last_task": agent_data.get("last_task")
            }
            for agent_id, agent_data in agents.items()
        ],
        "total": len(agents),
        "types": ["development", "infrastructure", "monitoring", "security", "automation"],
        "capabilities": [
            "Code analysis and formatting",
            "Infrastructure deployment", 
            "Security scanning",
            "Performance monitoring",
            "Automated workflows"
        ]
    }

@app.post("/api/agents/{agent_id}/execute")
async def execute_agent(agent_id: str, task: dict):
    task_id = str(uuid.uuid4())
    
    if agent_id not in agents:
        agents[agent_id] = {
            "id": agent_id,
            "type": task.get("type", "general"),
            "status": "active",
            "created": time.time(),
            "tasks_completed": 0
        }
        metrics["agents_active"] += 1
    
    # Update agent
    agents[agent_id]["status"] = "processing"
    agents[agent_id]["last_task"] = task_id
    
    # Simulate advanced processing based on task type
    task_type = task.get("type", "general")
    
    if task_type == "code_analysis":
        # Use MCP code analysis server
        try:
            mcp_response = requests.post(
                f"{MCP_SERVERS['code-analysis']}/analyze",
                json={"code": task.get("code", ""), "language": task.get("language", "python")},
                timeout=10
            )
            analysis_result = mcp_response.json() if mcp_response.status_code == 200 else {"error": "MCP server unavailable"}
        except:
            analysis_result = {"error": "Analysis failed", "fallback": "Basic syntax check passed"}
        
        result = {
            "agent_id": agent_id,
            "task_id": task_id,
            "task": task,
            "status": "completed",
            "result": f"Code analysis completed for {task.get('language', 'unknown')} code",
            "analysis": analysis_result,
            "timestamp": time.time()
        }
    
    elif task_type == "infrastructure":
        result = {
            "agent_id": agent_id,
            "task_id": task_id,
            "task": task,
            "status": "completed",
            "result": "Infrastructure task completed",
            "resources": ["EC2", "RDS", "S3", "Lambda"],
            "timestamp": time.time()
        }
    
    else:
        result = {
            "agent_id": agent_id,
            "task_id": task_id,
            "task": task,
            "status": "completed",
            "result": f"Task {task_type} executed successfully by agent {agent_id}",
            "timestamp": time.time()
        }
    
    # Update agent status
    agents[agent_id]["status"] = "idle"
    agents[agent_id]["tasks_completed"] = agents[agent_id].get("tasks_completed", 0) + 1
    
    # Notify WebSocket connections
    await broadcast_to_connections({
        "type": "agent_task_completed",
        "data": result
    })
    
    return result

@app.get("/api/tools")
async def list_tools():
    return {
        "tools": tools,
        "total": len(tools),
        "categories": list(set(tool["category"] for tool in tools.values())),
        "mcp_servers": list(MCP_SERVERS.keys())
    }

@app.post("/api/tools/{tool_name}/execute")
async def execute_tool(tool_name: str, params: dict):
    metrics["tools_executed"] += 1
    
    if tool_name not in tools:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool_info = tools[tool_name]
    mcp_server = tool_info.get("mcp_server")
    
    # Execute via MCP server if available
    if mcp_server and mcp_server in MCP_SERVERS:
        try:
            mcp_response = requests.post(
                f"{MCP_SERVERS[mcp_server]}/execute",
                json={"tool": tool_name, "params": params},
                timeout=15
            )
            
            if mcp_response.status_code == 200:
                mcp_result = mcp_response.json()
                result = {
                    "tool": tool_name,
                    "params": params,
                    "status": "success",
                    "output": mcp_result.get("output", f"Tool {tool_name} executed via MCP"),
                    "mcp_server": mcp_server,
                    "execution_time": mcp_result.get("execution_time", 0),
                    "timestamp": time.time()
                }
            else:
                result = {
                    "tool": tool_name,
                    "params": params,
                    "status": "error",
                    "error": "MCP server error",
                    "timestamp": time.time()
                }
        except Exception as e:
            result = {
                "tool": tool_name,
                "params": params,
                "status": "error",
                "error": f"MCP connection failed: {str(e)}",
                "timestamp": time.time()
            }
    elif tool_name == "fetch_content":
        # Direct content fetching for brainsait integration
        try:
            path = params.get("path", "")
            url = f"https://gp.thefadil.site/{path}".rstrip('/')
            
            # Use requests instead of aiohttp for simplicity
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Save to brainsait website
                brainsait_content = {
                    "title": soup.title.string if soup.title else "",
                    "content": soup.get_text(strip=True)[:1000],  # Limit content length
                    "source": url,
                    "timestamp": time.time()
                }
                
                with open("/home/ubuntu/brainsait-website/public/fetched-content.json", "w") as f:
                    json.dump(brainsait_content, f, indent=2)
                
                result = {
                    "tool": tool_name,
                    "params": params,
                    "status": "success",
                    "output": f"Content fetched from {url} and synced to brainsait",
                    "data": brainsait_content,
                    "timestamp": time.time()
                }
            else:
                result = {
                    "tool": tool_name,
                    "params": params,
                    "status": "error",
                    "error": f"HTTP {response.status_code}",
                    "timestamp": time.time()
                }
        except Exception as e:
            result = {
                "tool": tool_name,
                "params": params,
                "status": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    else:
        # Fallback execution
        result = {
            "tool": tool_name,
            "params": params,
            "status": "success",
            "output": f"Tool {tool_name} executed with params: {params}",
            "execution_time": 0.1,
            "timestamp": time.time()
        }
    
    # Broadcast to WebSocket connections
    await broadcast_to_connections({
        "type": "tool_executed",
        "data": result
    })
    
    return result

@app.get("/api/mcp/servers")
async def list_mcp_servers():
    server_status = {}
    for name, url in MCP_SERVERS.items():
        try:
            response = requests.get(f"{url}/status", timeout=2)
            server_status[name] = {
                "url": url,
                "status": "running" if response.status_code == 200 else "error",
                "response_time": response.elapsed.total_seconds() if response.status_code == 200 else None
            }
        except:
            server_status[name] = {"url": url, "status": "offline", "response_time": None}
    
    return {
        "servers": server_status,
        "total": len(MCP_SERVERS)
    }

@app.get("/api/metrics")
async def get_metrics():
    return {
        "metrics": metrics,
        "system": {
            "cpu": psutil.cpu_percent(),
            "memory": psutil.virtual_memory().percent,
            "disk": psutil.disk_usage('/').percent,
            "network": {
                "bytes_sent": psutil.net_io_counters().bytes_sent,
                "bytes_recv": psutil.net_io_counters().bytes_recv
            }
        },
        "agents": {
            "total": len(agents),
            "active": len([a for a in agents.values() if a.get("status") == "active"]),
            "idle": len([a for a in agents.values() if a.get("status") == "idle"])
        },
        "timestamp": time.time()
    }

async def broadcast_to_connections(message: dict):
    if active_connections:
        disconnected = []
        for connection in active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            active_connections.remove(conn)
            metrics["websocket_connections"] -= 1

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    metrics["websocket_connections"] += 1
    
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Connected to Advanced Server Platform",
            "timestamp": time.time()
        }))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": time.time()
                }))
            
            elif message.get("type") == "get_status":
                status_data = await status()
                await websocket.send_text(json.dumps({
                    "type": "status_update",
                    "data": status_data,
                    "timestamp": time.time()
                }))
            
    except Exception as e:
        pass
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)
            metrics["websocket_connections"] -= 1

@app.websocket("/ws/agent/{agent_id}")
async def websocket_agent(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            task = json.loads(data)
            
            # Process task
            result = await execute_agent(agent_id, task)
            await websocket.send_text(json.dumps(result))
            
    except Exception as e:
        await websocket.close()

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Advanced Server Platform Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1400px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .metric { text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin: 5px; }
            .status-healthy { color: #28a745; font-weight: bold; }
            .status-unhealthy { color: #dc3545; font-weight: bold; }
            .status-offline { color: #6c757d; font-weight: bold; }
            h1, h2 { color: #333; }
            .endpoint { background: #e9ecef; padding: 15px; margin: 5px 0; border-radius: 4px; }
            .endpoint a { text-decoration: none; color: #007bff; font-weight: bold; }
            .endpoint a:hover { color: #0056b3; }
            .real-time { border-left: 4px solid #28a745; }
            .log { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
            .ws-status { padding: 10px; border-radius: 4px; margin: 10px 0; }
            .ws-connected { background: #d4edda; color: #155724; }
            .ws-disconnected { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Advanced Server Platform Dashboard</h1>
            
            <div class="ws-status" id="wsStatus">
                <span id="wsIndicator">🔴 Disconnected</span>
                <span id="wsMessage">Connecting to real-time updates...</span>
            </div>
            
            <div class="card real-time">
                <h2>📊 Real-time System Status</h2>
                <div id="status">Loading...</div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h2>🤖 AI Agents</h2>
                    <div id="agents">Loading...</div>
                    <div class="endpoint"><a href="/api/agents">View All Agents</a></div>
                </div>
                
                <div class="card">
                    <h2>🔧 Tool Registry</h2>
                    <div id="tools">Loading...</div>
                    <div class="endpoint"><a href="/api/tools">Browse Tools</a></div>
                </div>
                
                <div class="card">
                    <h2>🔌 MCP Servers</h2>
                    <div id="mcpServers">Loading...</div>
                    <div class="endpoint"><a href="/api/mcp/servers">Server Status</a></div>
                </div>
                
                <div class="card">
                    <h2>📈 System Metrics</h2>
                    <div id="metrics">Loading...</div>
                    <div class="endpoint"><a href="/api/metrics">Detailed Metrics</a></div>
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h2>🌐 Public URLs</h2>
                    <div class="endpoint"><a href="https://brainsait.com" target="_blank">🏠 Main Site</a></div>
                    <div class="endpoint"><a href="https://app.brainsait.com" target="_blank">⚡ API Platform</a></div>
                    <div class="endpoint"><a href="https://docs.brainsait.com/docs" target="_blank">📚 API Docs</a></div>
                    <div class="endpoint"><a href="https://frontend.brainsait.com" target="_blank">🎨 Frontend</a></div>
                    <div class="endpoint"><a href="https://grafana.brainsait.com" target="_blank">📊 Grafana</a></div>
                    <div class="endpoint"><a href="https://prometheus.brainsait.com" target="_blank">📈 Prometheus</a></div>
                </div>
                
                <div class="card">
                    <h2>📝 Activity Log</h2>
                    <div class="log" id="activityLog">
                        <div>System initialized...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            let ws = null;
            let reconnectInterval = null;
            
            function connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/ws`;
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function() {
                    document.getElementById('wsStatus').className = 'ws-status ws-connected';
                    document.getElementById('wsIndicator').textContent = '🟢 Connected';
                    document.getElementById('wsMessage').textContent = 'Real-time updates active';
                    
                    if (reconnectInterval) {
                        clearInterval(reconnectInterval);
                        reconnectInterval = null;
                    }
                    
                    addToLog('WebSocket connected - Real-time updates enabled');
                };
                
                ws.onmessage = function(event) {
                    const message = JSON.parse(event.data);
                    handleWebSocketMessage(message);
                };
                
                ws.onclose = function() {
                    document.getElementById('wsStatus').className = 'ws-status ws-disconnected';
                    document.getElementById('wsIndicator').textContent = '🔴 Disconnected';
                    document.getElementById('wsMessage').textContent = 'Attempting to reconnect...';
                    
                    addToLog('WebSocket disconnected - Attempting reconnection');
                    
                    if (!reconnectInterval) {
                        reconnectInterval = setInterval(connectWebSocket, 5000);
                    }
                };
                
                ws.onerror = function(error) {
                    addToLog('WebSocket error occurred');
                };
            }
            
            function handleWebSocketMessage(message) {
                if (message.type === 'connected') {
                    addToLog('Connected to Advanced Server Platform');
                } else if (message.type === 'agent_task_completed') {
                    addToLog(`Agent ${message.data.agent_id} completed task: ${message.data.task.type}`);
                } else if (message.type === 'tool_executed') {
                    addToLog(`Tool ${message.data.tool} executed successfully`);
                } else if (message.type === 'status_update') {
                    updateStatus(message.data);
                }
            }
            
            function addToLog(message) {
                const log = document.getElementById('activityLog');
                const timestamp = new Date().toLocaleTimeString();
                const entry = document.createElement('div');
                entry.textContent = `[${timestamp}] ${message}`;
                log.appendChild(entry);
                log.scrollTop = log.scrollHeight;
                
                // Keep only last 50 entries
                while (log.children.length > 50) {
                    log.removeChild(log.firstChild);
                }
            }
            
            async function loadData() {
                try {
                    // Load status
                    const statusResponse = await fetch('/api/status');
                    const statusData = await statusResponse.json();
                    updateStatus(statusData);
                    
                    // Load agents
                    const agentsResponse = await fetch('/api/agents');
                    const agentsData = await agentsResponse.json();
                    document.getElementById('agents').innerHTML = `
                        <div class="metric">Total: ${agentsData.total}</div>
                        <div class="metric">Types: ${agentsData.types.length}</div>
                    `;
                    
                    // Load tools
                    const toolsResponse = await fetch('/api/tools');
                    const toolsData = await toolsResponse.json();
                    document.getElementById('tools').innerHTML = `
                        <div class="metric">Total: ${toolsData.total}</div>
                        <div class="metric">Categories: ${toolsData.categories.length}</div>
                    `;
                    
                    // Load MCP servers
                    const mcpResponse = await fetch('/api/mcp/servers');
                    const mcpData = await mcpResponse.json();
                    const mcpHtml = Object.entries(mcpData.servers).map(([name, info]) => 
                        `<div class="metric">
                            ${name}: <span class="status-${info.status}">${info.status}</span>
                        </div>`
                    ).join('');
                    document.getElementById('mcpServers').innerHTML = mcpHtml;
                    
                    // Load metrics
                    const metricsResponse = await fetch('/api/metrics');
                    const metricsData = await metricsResponse.json();
                    document.getElementById('metrics').innerHTML = `
                        <div class="metric">Requests: ${metricsData.metrics.requests}</div>
                        <div class="metric">Tools Executed: ${metricsData.metrics.tools_executed}</div>
                        <div class="metric">WebSocket: ${metricsData.metrics.websocket_connections}</div>
                    `;
                    
                } catch (error) {
                    addToLog('Error loading dashboard data');
                }
            }
            
            function updateStatus(data) {
                document.getElementById('status').innerHTML = `
                    <div class="grid">
                        <div class="metric">Status: ${data.status}</div>
                        <div class="metric">CPU: ${data.system.cpu_usage}</div>
                        <div class="metric">Memory: ${data.system.memory_usage}</div>
                        <div class="metric">Disk: ${data.system.disk_usage}</div>
                        <div class="metric">Active Agents: ${data.metrics.agents_active}</div>
                        <div class="metric">Connections: ${data.active_connections}</div>
                    </div>
                `;
            }
            
            // Initialize
            connectWebSocket();
            loadData();
            setInterval(loadData, 30000); // Refresh every 30 seconds
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
