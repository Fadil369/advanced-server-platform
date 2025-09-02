import asyncio
import json
import websockets
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

@dataclass
class MCPServer:
    name: str
    url: str
    capabilities: List[str]
    connection: Optional[websockets.WebSocketServerProtocol] = None
    is_connected: bool = False

class MCPClient:
    def __init__(self):
        self.servers: Dict[str, MCPServer] = {}
        self.logger = logging.getLogger(__name__)
        
    async def connect_servers(self):
        """Connect to all configured MCP servers"""
        default_servers = [
            MCPServer("filesystem", "ws://localhost:8001", ["file_operations", "directory_listing"]),
            MCPServer("aws-tools", "ws://localhost:8002", ["aws_cli", "resource_management"]),
            MCPServer("code-analysis", "ws://localhost:8003", ["static_analysis", "security_scan"]),
            MCPServer("monitoring", "ws://localhost:8004", ["metrics_collection", "alerting"]),
        ]
        
        for server in default_servers:
            await self._connect_server(server)
    
    async def _connect_server(self, server: MCPServer):
        """Connect to a single MCP server"""
        try:
            server.connection = await websockets.connect(server.url)
            server.is_connected = True
            self.servers[server.name] = server
            
            # Send initialization message
            init_message = {
                "jsonrpc": "2.0",
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {},
                        "resources": {},
                        "prompts": {}
                    },
                    "clientInfo": {
                        "name": "advanced-server",
                        "version": "1.0.0"
                    }
                },
                "id": 1
            }
            
            await server.connection.send(json.dumps(init_message))
            response = await server.connection.recv()
            
            self.logger.info(f"Connected to MCP server: {server.name}")
            
        except Exception as e:
            self.logger.error(f"Failed to connect to {server.name}: {e}")
            server.is_connected = False
    
    async def call_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool on a specific MCP server"""
        server = self.servers.get(server_name)
        if not server or not server.is_connected:
            return {"error": f"Server {server_name} not available"}
        
        message = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            },
            "id": asyncio.current_task().get_name()
        }
        
        try:
            await server.connection.send(json.dumps(message))
            response = await server.connection.recv()
            return json.loads(response)
        except Exception as e:
            return {"error": f"Tool call failed: {e}"}
    
    async def list_tools(self, server_name: str) -> List[Dict[str, Any]]:
        """List available tools on a server"""
        server = self.servers.get(server_name)
        if not server or not server.is_connected:
            return []
        
        message = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": "list_tools"
        }
        
        try:
            await server.connection.send(json.dumps(message))
            response = await server.connection.recv()
            result = json.loads(response)
            return result.get("result", {}).get("tools", [])
        except Exception as e:
            self.logger.error(f"Failed to list tools for {server_name}: {e}")
            return []
    
    async def get_resource(self, server_name: str, resource_uri: str) -> Dict[str, Any]:
        """Get a resource from an MCP server"""
        server = self.servers.get(server_name)
        if not server or not server.is_connected:
            return {"error": f"Server {server_name} not available"}
        
        message = {
            "jsonrpc": "2.0",
            "method": "resources/read",
            "params": {
                "uri": resource_uri
            },
            "id": "get_resource"
        }
        
        try:
            await server.connection.send(json.dumps(message))
            response = await server.connection.recv()
            return json.loads(response)
        except Exception as e:
            return {"error": f"Resource fetch failed: {e}"}
    
    async def list_servers(self) -> List[Dict[str, Any]]:
        """List all connected MCP servers"""
        return [
            {
                "name": server.name,
                "url": server.url,
                "capabilities": server.capabilities,
                "is_connected": server.is_connected
            }
            for server in self.servers.values()
        ]
    
    async def disconnect_all(self):
        """Disconnect from all MCP servers"""
        for server in self.servers.values():
            if server.connection and server.is_connected:
                await server.connection.close()
                server.is_connected = False
