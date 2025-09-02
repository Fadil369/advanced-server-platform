# Enhanced main application with WebSocket and API integration
from integrated.main import *
from integrated.websocket import ws_router, manager
from integrated.api.enhanced import router as enhanced_router

# Add WebSocket and enhanced API routes to the main app
app.include_router(ws_router)
app.include_router(enhanced_router)

# Add CORS for frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced health check with frontend status
@app.get("/health/frontend")
async def frontend_health():
    """Health check specifically for frontend integration"""
    return JSONResponse(content={
        "status": "healthy",
        "frontend_ready": True,
        "websocket_connections": len(manager.active_connections),
        "real_time_enabled": True,
        "ui_version": "2.0.0-enhanced"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "integrated.main_enhanced:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
