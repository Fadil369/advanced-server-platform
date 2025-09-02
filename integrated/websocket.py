import asyncio
import json
import logging
from typing import Dict, List, Set
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

logger = logging.getLogger("BrainSAIT.WebSocket")

class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[str, Set[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str = None):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected: {client_id or 'anonymous'}")
        
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        # Remove from all subscriptions
        for topic_connections in self.subscriptions.values():
            topic_connections.discard(websocket)
            
    async def subscribe(self, websocket: WebSocket, topic: str):
        if topic not in self.subscriptions:
            self.subscriptions[topic] = set()
        self.subscriptions[topic].add(websocket)
        
    async def broadcast(self, message: dict, topic: str = None):
        """Broadcast message to all or topic-specific connections"""
        connections = (
            self.subscriptions.get(topic, set()) if topic 
            else self.active_connections
        )
        
        if connections:
            await asyncio.gather(
                *[self._send_safe(conn, message) for conn in connections],
                return_exceptions=True
            )
    
    async def _send_safe(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            self.disconnect(websocket)

# Global connection manager
manager = ConnectionManager()

# WebSocket router
ws_router = APIRouter()

@ws_router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """Main dashboard WebSocket endpoint"""
    await manager.connect(websocket, "dashboard")
    await manager.subscribe(websocket, "dashboard")
    
    try:
        # Send initial data
        initial_data = await get_dashboard_data()
        await websocket.send_text(json.dumps(initial_data))
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                await handle_dashboard_message(websocket, message)
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Dashboard WebSocket error: {e}")
                break
                
    finally:
        manager.disconnect(websocket)

@ws_router.websocket("/ws/agents/{agent_id}")
async def agent_websocket(websocket: WebSocket, agent_id: str):
    """Agent-specific WebSocket endpoint"""
    await manager.connect(websocket, f"agent-{agent_id}")
    await manager.subscribe(websocket, f"agent-{agent_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_agent_message(websocket, agent_id, message)
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)

async def get_dashboard_data() -> dict:
    """Get current dashboard data"""
    from integrated.main import platform_state
    
    # Get agent data
    agents_data = []
    if platform_state.brainsait_agents:
        for name, agent in platform_state.brainsait_agents.items():
            agents_data.append({
                'id': name,
                'name': name,
                'specialty': getattr(agent, 'specialty', 'AI Agent'),
                'status': 'active' if hasattr(agent, 'active') and agent.active else 'inactive',
                'metrics': {
                    'tasks': getattr(agent, 'task_count', 0),
                    'accuracy': getattr(agent, 'accuracy', 95.0),
                    'speed': getattr(agent, 'avg_response_time', 150)
                }
            })
    
    # Get system metrics
    metrics = {
        'patients': 2847,
        'fhirOps': 15692,
        'compliance': 99.8,
        'responseTime': 120
    }
    
    # Get alerts
    alerts = [
        {
            'id': '1',
            'type': 'info',
            'title': 'System Update',
            'message': 'BrainSAIT agents updated successfully',
            'timestamp': datetime.now().isoformat()
        },
        {
            'id': '2', 
            'type': 'warning',
            'title': 'High Load',
            'message': 'FHIR operations above normal threshold',
            'timestamp': datetime.now().isoformat()
        }
    ]
    
    # Get workflows
    workflows = [
        {
            'id': '1',
            'name': 'Patient Intake Workflow',
            'status': 'active',
            'nodes': ['patient-intake', 'fhir-validation', 'ai-analysis']
        },
        {
            'id': '2',
            'name': 'Clinical Decision Support',
            'status': 'active', 
            'nodes': ['clinical-decision', 'compliance-check', 'output-report']
        }
    ]
    
    return {
        'agents': agents_data,
        'metrics': metrics,
        'alerts': alerts,
        'workflows': workflows,
        'compliance': {
            'hipaa': True,
            'nphies': True,
            'fhir': True
        },
        'timestamp': datetime.now().isoformat()
    }

async def handle_dashboard_message(websocket: WebSocket, message: dict):
    """Handle incoming dashboard messages"""
    msg_type = message.get('type')
    
    if msg_type == 'execute_agent':
        agent_id = message.get('agent_id')
        await execute_agent_task(agent_id, message.get('task', {}))
        
    elif msg_type == 'subscribe_metrics':
        await manager.subscribe(websocket, 'metrics')
        
    elif msg_type == 'create_workflow':
        workflow_data = message.get('workflow')
        await create_workflow(workflow_data)

async def handle_agent_message(websocket: WebSocket, agent_id: str, message: dict):
    """Handle agent-specific messages"""
    from integrated.main import platform_state
    
    if agent_id in platform_state.brainsait_agents:
        agent = platform_state.brainsait_agents[agent_id]
        
        if message.get('type') == 'execute_task':
            task = message.get('task')
            result = await agent.execute_task(task)
            
            await websocket.send_text(json.dumps({
                'type': 'task_result',
                'agent_id': agent_id,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }))

async def execute_agent_task(agent_id: str, task: dict):
    """Execute task on specific agent"""
    from integrated.main import platform_state
    
    if agent_id in platform_state.brainsait_agents:
        agent = platform_state.brainsait_agents[agent_id]
        
        try:
            result = await agent.execute_task(task)
            
            # Broadcast result to dashboard
            await manager.broadcast({
                'type': 'agent_task_completed',
                'agent_id': agent_id,
                'task': task,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }, 'dashboard')
            
        except Exception as e:
            logger.error(f"Agent task execution failed: {e}")
            await manager.broadcast({
                'type': 'agent_task_failed',
                'agent_id': agent_id,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }, 'dashboard')

async def create_workflow(workflow_data: dict):
    """Create new workflow"""
    # Implementation for workflow creation
    workflow_id = f"workflow_{datetime.now().timestamp()}"
    
    await manager.broadcast({
        'type': 'workflow_created',
        'workflow': {
            'id': workflow_id,
            'name': workflow_data.get('name', 'New Workflow'),
            'status': 'created',
            'nodes': workflow_data.get('nodes', [])
        },
        'timestamp': datetime.now().isoformat()
    }, 'dashboard')

# Background task for periodic updates
async def periodic_updates():
    """Send periodic updates to connected clients"""
    while True:
        try:
            # Update dashboard data every 5 seconds
            dashboard_data = await get_dashboard_data()
            await manager.broadcast(dashboard_data, 'dashboard')
            
            # Update metrics every 10 seconds
            await manager.broadcast({
                'type': 'metrics_update',
                'metrics': dashboard_data['metrics'],
                'timestamp': datetime.now().isoformat()
            }, 'metrics')
            
            await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Periodic update error: {e}")
            await asyncio.sleep(10)

# Start background task
asyncio.create_task(periodic_updates())
