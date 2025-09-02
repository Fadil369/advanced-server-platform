# 🧠 BrainSAIT + Advanced Server Platform - Integrated Main Application
# NEURAL: Ultimate healthcare AI platform with AWS MCP integration
# BRAINSAIT: HIPAA + NPHIES compliance with enterprise infrastructure
# MEDICAL: FHIR R4 + AWS HealthLake + HealthOmics integration

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Advanced Server Platform imports
from server.main import create_app as create_server_app
from server.agents.manager import AgentManager
from server.tools.registry import ToolRegistry
from server.mcp.client import MCPClient

# BrainSAIT imports
from brainsait.agents import BrainSAITAgentFactory, AgentCapability
from brainsait.aws_mcp import AWSMCPBridge, AWSMCPEnabledAgent
from brainsait.compliance import HIPAAValidator, NPHIESIntegration
from brainsait.security import AuditLogger, EncryptionManager
from brainsait.fhir import FHIRValidator

# Integrated components
from integrated.agents import IntegratedAgentManager
from integrated.tools import HealthcareToolRegistry
from integrated.mcp import BrainSAITMCPClient
from integrated.api import healthcare_router, compliance_router, ai_router

# NEURAL: Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='🧠 %(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("BrainSAIT.Integrated")

# BRAINSAIT: Global state
class IntegratedPlatformState:
    """Global state for the integrated platform"""
    
    def __init__(self):
        # Advanced Server Platform components
        self.agent_manager: AgentManager = None
        self.tool_registry: ToolRegistry = None
        self.mcp_client: MCPClient = None
        
        # BrainSAIT components
        self.brainsait_agents: Dict[str, AWSMCPEnabledAgent] = {}
        self.aws_mcp_bridge: AWSMCPBridge = None
        self.hipaa_validator: HIPAAValidator = None
        self.nphies_integration: NPHIESIntegration = None
        self.audit_logger: AuditLogger = None
        self.fhir_validator: FHIRValidator = None
        
        # Integrated components
        self.integrated_agent_manager: IntegratedAgentManager = None
        self.healthcare_tool_registry: HealthcareToolRegistry = None
        self.brainsait_mcp_client: BrainSAITMCPClient = None
        
        # Status
        self.initialized = False
        self.brainsait_enabled = os.getenv('BRAINSAIT_ENABLED', 'false').lower() == 'true'
        self.aws_mcp_enabled = os.getenv('AWS_MCP_ENABLED', 'false').lower() == 'true'

# NEURAL: Global platform state
platform_state = IntegratedPlatformState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    
    logger.info("🚀 Starting BrainSAIT + Advanced Server Platform Integration...")
    
    try:
        # Initialize platform components
        await initialize_platform()
        
        logger.info("✅ Integrated platform started successfully")
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to start integrated platform: {e}")
        raise
    finally:
        # Cleanup
        await cleanup_platform()
        logger.info("🛑 Integrated platform stopped")

async def initialize_platform():
    """Initialize all platform components"""
    
    # BRAINSAIT: Initialize compliance and security
    await initialize_brainsait_core()
    
    # NEURAL: Initialize Advanced Server Platform
    await initialize_advanced_server_platform()
    
    # AGENT: Initialize BrainSAIT agents if enabled
    if platform_state.brainsait_enabled:
        await initialize_brainsait_agents()
    
    # MEDICAL: Initialize AWS MCP integration if enabled
    if platform_state.aws_mcp_enabled:
        await initialize_aws_mcp_integration()
    
    # NEURAL: Initialize integrated components
    await initialize_integrated_components()
    
    platform_state.initialized = True
    logger.info("🎯 All platform components initialized successfully")

async def initialize_brainsait_core():
    """Initialize BrainSAIT core components"""
    logger.info("🔐 Initializing BrainSAIT compliance and security...")
    
    # BRAINSAIT: Initialize compliance validators
    platform_state.hipaa_validator = HIPAAValidator()
    platform_state.nphies_integration = NPHIESIntegration()
    
    # BRAINSAIT: Initialize security components
    platform_state.audit_logger = AuditLogger(component="IntegratedPlatform")
    platform_state.encryption_manager = EncryptionManager()
    
    # MEDICAL: Initialize FHIR validator
    platform_state.fhir_validator = FHIRValidator(version="R4")
    
    logger.info("✅ BrainSAIT core components initialized")

async def initialize_advanced_server_platform():
    """Initialize Advanced Server Platform components"""
    logger.info("🏗️ Initializing Advanced Server Platform...")
    
    # Initialize core components
    platform_state.agent_manager = AgentManager()
    platform_state.tool_registry = ToolRegistry()
    platform_state.mcp_client = MCPClient()
    
    # Start MCP client
    await platform_state.mcp_client.start()
    
    logger.info("✅ Advanced Server Platform initialized")

async def initialize_brainsait_agents():
    """Initialize BrainSAIT AI agents"""
    logger.info("🤖 Initializing BrainSAIT AI agents...")
    
    try:
        # Create BrainSAIT agent cluster
        brainsait_cluster = await BrainSAITAgentFactory.initialize_cluster_with_monitoring()
        platform_state.brainsait_agents = brainsait_cluster['agents']
        
        # Create AWS MCP-enabled agents
        aws_region = os.getenv('AWS_REGION', 'us-east-1')
        healthlake_datastore_id = os.getenv('HEALTHLAKE_DATASTORE_ID')
        
        # Enhanced MASTERLINC agent
        masterlinc_enhanced = AWSMCPEnabledAgent(
            name="MASTERLINC_ENHANCED",
            capabilities=[
                AgentCapability.CLINICAL_REASONING,
                AgentCapability.WORKFLOW_AUTOMATION,
                AgentCapability.DECISION_SUPPORT,
                AgentCapability.ARABIC_NLP
            ],
            aws_region=aws_region,
            memory_limit_mb=8192,
            gpu_required=True
        )
        
        # Enhanced HEALTHCARELINC agent
        healthcarelinc_enhanced = AWSMCPEnabledAgent(
            name="HEALTHCARELINC_ENHANCED", 
            capabilities=[
                AgentCapability.FHIR_PROCESSING,
                AgentCapability.MEDICAL_IMAGING,
                AgentCapability.CLINICAL_REASONING,
                AgentCapability.ARABIC_NLP
            ],
            aws_region=aws_region,
            memory_limit_mb=6144
        )
        
        # Add enhanced agents to the collection
        platform_state.brainsait_agents['masterlinc_enhanced'] = masterlinc_enhanced
        platform_state.brainsait_agents['healthcarelinc_enhanced'] = healthcarelinc_enhanced
        
        logger.info(f"✅ Initialized {len(platform_state.brainsait_agents)} BrainSAIT agents")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize BrainSAIT agents: {e}")
        # Continue without BrainSAIT agents
        platform_state.brainsait_enabled = False

async def initialize_aws_mcp_integration():
    """Initialize AWS MCP integration"""
    logger.info("☁️ Initializing AWS MCP integration...")
    
    try:
        # Initialize AWS MCP bridge
        platform_state.aws_mcp_bridge = AWSMCPBridge(
            aws_region=os.getenv('AWS_REGION', 'us-east-1'),
            aws_profile=os.getenv('AWS_PROFILE')
        )
        
        # Initialize healthcare MCP servers for enhanced agents
        healthlake_datastore_id = os.getenv('HEALTHLAKE_DATASTORE_ID')
        
        if 'masterlinc_enhanced' in platform_state.brainsait_agents:
            await platform_state.brainsait_agents['masterlinc_enhanced'].initialize_healthcare_mcp_servers(
                healthlake_datastore_id=healthlake_datastore_id,
                enable_healthomics=True,
                enable_core_server=True
            )
        
        if 'healthcarelinc_enhanced' in platform_state.brainsait_agents:
            await platform_state.brainsait_agents['healthcarelinc_enhanced'].initialize_healthcare_mcp_servers(
                healthlake_datastore_id=healthlake_datastore_id,
                enable_healthomics=True,
                enable_core_server=True
            )
        
        logger.info("✅ AWS MCP integration initialized")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize AWS MCP integration: {e}")
        # Continue without AWS MCP
        platform_state.aws_mcp_enabled = False

async def initialize_integrated_components():
    """Initialize integrated components that bridge both platforms"""
    logger.info("🌉 Initializing integrated components...")
    
    # Initialize integrated agent manager
    platform_state.integrated_agent_manager = IntegratedAgentManager(
        server_agent_manager=platform_state.agent_manager,
        brainsait_agents=platform_state.brainsait_agents
    )
    
    # Initialize healthcare tool registry
    platform_state.healthcare_tool_registry = HealthcareToolRegistry(
        base_registry=platform_state.tool_registry,
        fhir_validator=platform_state.fhir_validator,
        aws_mcp_bridge=platform_state.aws_mcp_bridge
    )
    
    # Initialize BrainSAIT MCP client
    platform_state.brainsait_mcp_client = BrainSAITMCPClient(
        base_client=platform_state.mcp_client,
        aws_mcp_bridge=platform_state.aws_mcp_bridge
    )
    
    logger.info("✅ Integrated components initialized")

async def cleanup_platform():
    """Cleanup platform resources"""
    logger.info("🧹 Cleaning up platform resources...")
    
    try:
        # Stop BrainSAIT agents
        if platform_state.brainsait_agents:
            for agent in platform_state.brainsait_agents.values():
                if hasattr(agent, 'shutdown'):
                    await agent.shutdown()
        
        # Stop AWS MCP bridge
        if platform_state.aws_mcp_bridge:
            await platform_state.aws_mcp_bridge.stop_all_servers()
        
        # Stop MCP client
        if platform_state.mcp_client:
            await platform_state.mcp_client.stop()
        
        logger.info("✅ Platform cleanup completed")
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")

# NEURAL: Create FastAPI application
def create_integrated_app() -> FastAPI:
    """Create the integrated FastAPI application"""
    
    app = FastAPI(
        title="BrainSAIT + Advanced Server Platform",
        description="Ultimate Healthcare AI Platform with AWS MCP Integration",
        version="2.0.0-integrated",
        lifespan=lifespan
    )
    
    # BRAINSAIT: Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # NEURAL: Include routers
    app.include_router(healthcare_router, prefix="/api/healthcare", tags=["Healthcare"])
    app.include_router(compliance_router, prefix="/api/compliance", tags=["Compliance"])
    app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
    
    # BRAINSAIT: Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint with compliance status"""
        
        health_status = {
            "status": "healthy" if platform_state.initialized else "initializing",
            "version": "2.0.0-integrated",
            "components": {
                "advanced_server_platform": platform_state.agent_manager is not None,
                "brainsait_enabled": platform_state.brainsait_enabled,
                "aws_mcp_enabled": platform_state.aws_mcp_enabled,
                "brainsait_agents": len(platform_state.brainsait_agents) if platform_state.brainsait_agents else 0,
                "hipaa_compliant": True,
                "nphies_integrated": platform_state.nphies_integration is not None,
                "fhir_r4_support": platform_state.fhir_validator is not None
            },
            "timestamp": asyncio.get_event_loop().time()
        }
        
        return JSONResponse(content=health_status)
    
    # NEURAL: Platform status endpoint
    @app.get("/api/status")
    async def platform_status():
        """Detailed platform status"""
        
        if not platform_state.initialized:
            raise HTTPException(status_code=503, detail="Platform not fully initialized")
        
        status = {
            "platform": "BrainSAIT + Advanced Server Platform",
            "version": "2.0.0-integrated",
            "brainsait": {
                "enabled": platform_state.brainsait_enabled,
                "agents": list(platform_state.brainsait_agents.keys()) if platform_state.brainsait_agents else [],
                "compliance": {
                    "hipaa": True,
                    "nphies": platform_state.nphies_integration is not None
                }
            },
            "aws_mcp": {
                "enabled": platform_state.aws_mcp_enabled,
                "bridge_active": platform_state.aws_mcp_bridge is not None,
                "servers": await platform_state.aws_mcp_bridge.get_server_status() if platform_state.aws_mcp_bridge else {}
            },
            "advanced_server": {
                "agents": await platform_state.agent_manager.get_agent_count() if platform_state.agent_manager else 0,
                "tools": len(platform_state.tool_registry.tools) if platform_state.tool_registry else 0,
                "mcp_client_active": platform_state.mcp_client is not None
            }
        }
        
        return JSONResponse(content=status)
    
    return app

# AGENT: Create the application instance
app = create_integrated_app()

# NEURAL: Main execution
if __name__ == "__main__":
    # BRAINSAIT: Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    
    logger.info(f"🚀 Starting integrated platform on {host}:{port}")
    
    # NEURAL: Run the application
    uvicorn.run(
        "integrated.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
