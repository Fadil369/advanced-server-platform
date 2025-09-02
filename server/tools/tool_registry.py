import asyncio
import importlib
import inspect
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass
from enum import Enum
import json

class ToolCategory(Enum):
    DEVELOPMENT = "development"
    INFRASTRUCTURE = "infrastructure"
    MONITORING = "monitoring"
    SECURITY = "security"
    AUTOMATION = "automation"
    DATA = "data"

@dataclass
class ToolMetadata:
    name: str
    description: str
    category: ToolCategory
    parameters: Dict[str, Any]
    returns: str
    requires_auth: bool = False
    async_execution: bool = False

class Tool:
    def __init__(self, metadata: ToolMetadata, func: Callable):
        self.metadata = metadata
        self.func = func
    
    async def execute(self, **kwargs) -> Any:
        if self.metadata.async_execution:
            return await self.func(**kwargs)
        else:
            return self.func(**kwargs)

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
        self.categories: Dict[ToolCategory, List[str]] = {cat: [] for cat in ToolCategory}
    
    async def load_tools(self):
        """Load all available tools"""
        await self._register_builtin_tools()
        await self._discover_plugin_tools()
    
    async def _register_builtin_tools(self):
        """Register built-in tools"""
        
        # Development tools
        self.register_tool(
            ToolMetadata(
                "code_format",
                "Format code using various formatters",
                ToolCategory.DEVELOPMENT,
                {"code": "string", "language": "string", "formatter": "string"},
                "formatted code string"
            ),
            self._format_code
        )
        
        self.register_tool(
            ToolMetadata(
                "run_tests",
                "Execute test suites",
                ToolCategory.DEVELOPMENT,
                {"test_path": "string", "framework": "string"},
                "test results object",
                async_execution=True
            ),
            self._run_tests
        )
        
        # Infrastructure tools
        self.register_tool(
            ToolMetadata(
                "deploy_terraform",
                "Deploy infrastructure using Terraform",
                ToolCategory.INFRASTRUCTURE,
                {"config_path": "string", "workspace": "string", "auto_approve": "boolean"},
                "deployment status object",
                async_execution=True
            ),
            self._deploy_terraform
        )
        
        self.register_tool(
            ToolMetadata(
                "scale_service",
                "Scale containerized services",
                ToolCategory.INFRASTRUCTURE,
                {"service_name": "string", "replicas": "integer"},
                "scaling status object",
                async_execution=True
            ),
            self._scale_service
        )
        
        # Monitoring tools
        self.register_tool(
            ToolMetadata(
                "collect_metrics",
                "Collect system and application metrics",
                ToolCategory.MONITORING,
                {"targets": "array", "duration": "integer"},
                "metrics data object",
                async_execution=True
            ),
            self._collect_metrics
        )
        
        # Security tools
        self.register_tool(
            ToolMetadata(
                "security_scan",
                "Perform security vulnerability scan",
                ToolCategory.SECURITY,
                {"target": "string", "scan_type": "string"},
                "security report object",
                async_execution=True
            ),
            self._security_scan
        )
        
        # Automation tools
        self.register_tool(
            ToolMetadata(
                "create_workflow",
                "Create automated workflow",
                ToolCategory.AUTOMATION,
                {"workflow_config": "object", "trigger": "string"},
                "workflow id string"
            ),
            self._create_workflow
        )
    
    def register_tool(self, metadata: ToolMetadata, func: Callable):
        """Register a new tool"""
        tool = Tool(metadata, func)
        self.tools[metadata.name] = tool
        self.categories[metadata.category].append(metadata.name)
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Any:
        """Execute a tool with given parameters"""
        tool = self.tools.get(tool_name)
        if not tool:
            return {"error": f"Tool '{tool_name}' not found"}
        
        try:
            return await tool.execute(**params)
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}
    
    async def list_available_tools(self) -> Dict[str, Any]:
        """List all available tools by category"""
        result = {}
        for category, tool_names in self.categories.items():
            result[category.value] = []
            for tool_name in tool_names:
                tool = self.tools[tool_name]
                result[category.value].append({
                    "name": tool.metadata.name,
                    "description": tool.metadata.description,
                    "parameters": tool.metadata.parameters,
                    "returns": tool.metadata.returns,
                    "requires_auth": tool.metadata.requires_auth,
                    "async_execution": tool.metadata.async_execution
                })
        return result
    
    # Built-in tool implementations
    def _format_code(self, code: str, language: str, formatter: str = "auto") -> str:
        """Format code using appropriate formatter"""
        # Simulate code formatting
        formatted = code.strip()
        if language == "python":
            formatted = f"# Formatted Python code\n{formatted}"
        elif language == "javascript":
            formatted = f"// Formatted JavaScript code\n{formatted}"
        return formatted
    
    async def _run_tests(self, test_path: str, framework: str = "pytest") -> Dict[str, Any]:
        """Run test suite"""
        await asyncio.sleep(1)  # Simulate test execution
        return {
            "status": "passed",
            "tests_run": 42,
            "failures": 0,
            "coverage": 85.5,
            "duration": "1.2s"
        }
    
    async def _deploy_terraform(self, config_path: str, workspace: str = "default", auto_approve: bool = False) -> Dict[str, Any]:
        """Deploy infrastructure with Terraform"""
        await asyncio.sleep(2)  # Simulate deployment
        return {
            "status": "success",
            "resources_created": 15,
            "resources_updated": 3,
            "resources_destroyed": 0,
            "workspace": workspace
        }
    
    async def _scale_service(self, service_name: str, replicas: int) -> Dict[str, Any]:
        """Scale containerized service"""
        await asyncio.sleep(0.5)  # Simulate scaling
        return {
            "service": service_name,
            "previous_replicas": 3,
            "new_replicas": replicas,
            "status": "scaling_complete"
        }
    
    async def _collect_metrics(self, targets: List[str], duration: int = 60) -> Dict[str, Any]:
        """Collect system metrics"""
        await asyncio.sleep(0.2)  # Simulate collection
        metrics = {}
        for target in targets:
            metrics[target] = {
                "cpu_percent": 45.2,
                "memory_percent": 67.8,
                "disk_io": 1024.5,
                "network_io": 2048.3
            }
        return {"metrics": metrics, "duration": duration}
    
    async def _security_scan(self, target: str, scan_type: str = "vulnerability") -> Dict[str, Any]:
        """Perform security scan"""
        await asyncio.sleep(3)  # Simulate scanning
        return {
            "target": target,
            "scan_type": scan_type,
            "vulnerabilities_found": 2,
            "severity": "medium",
            "recommendations": [
                "Update dependency X to version Y",
                "Configure proper access controls"
            ]
        }
    
    def _create_workflow(self, workflow_config: Dict[str, Any], trigger: str) -> str:
        """Create automated workflow"""
        workflow_id = f"workflow_{hash(json.dumps(workflow_config, sort_keys=True))}"
        # Store workflow configuration (implement persistence)
        return workflow_id
    
    async def _discover_plugin_tools(self):
        """Discover and load plugin tools"""
        # Implementation for loading external tool plugins
        pass
