from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from typing import Dict, List, Any
from dataclasses import dataclass
from agents.agent_manager import AgentManager
from mcp.mcp_client import MCPClient
from tools.tool_registry import ToolRegistry
from infrastructure.monitoring import MetricsCollector

@dataclass
class ServerConfig:
    debug: bool = False
    max_agents: int = 100
    mcp_servers: List[str] = None
    
app = FastAPI(title="Advanced Server Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core components
agent_manager = AgentManager()
mcp_client = MCPClient()
tool_registry = ToolRegistry()
metrics = MetricsCollector()

@app.on_event("startup")
async def startup():
    await agent_manager.initialize()
    await mcp_client.connect_servers()
    await tool_registry.load_tools()
    await metrics.start_collection()

@app.websocket("/ws/agent/{agent_id}")
async def agent_websocket(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    agent = await agent_manager.get_or_create_agent(agent_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            response = await agent.process_message(message)
            await websocket.send_text(json.dumps(response))
    except Exception as e:
        await websocket.close()

@app.post("/api/agents/{agent_id}/execute")
async def execute_agent_task(agent_id: str, task: Dict[str, Any]):
    agent = await agent_manager.get_agent(agent_id)
    if not agent:
        return {"error": "Agent not found"}
    
    result = await agent.execute_task(task)
    return {"result": result}

@app.get("/api/tools")
async def list_tools():
    return await tool_registry.list_available_tools()

@app.post("/api/tools/{tool_name}/execute")
async def execute_tool(tool_name: str, params: Dict[str, Any]):
    return await tool_registry.execute_tool(tool_name, params)

@app.get("/api/mcp/servers")
async def list_mcp_servers():
    return await mcp_client.list_servers()

@app.get("/api/metrics")
async def get_metrics():
    return await metrics.get_current_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
