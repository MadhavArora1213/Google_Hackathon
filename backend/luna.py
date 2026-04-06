import os
from typing import Dict, Any, Optional
from fastapi import FastAPI
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Luna Context Service", version="3.1.0")

@app.get("/api/v1/weather")
async def get_weather(location: str = "Mountain View", auth: Optional[Dict[str, str]] = None):
    """Fetches real-time weather via MCP Service."""
    mcp_res = await mcp.call_tool("weather", {"location": location}, auth=auth)
    return {"location": location, "result": mcp_res}

@app.get("/api/v1/commute")
async def get_commute(origin: str, destination: str, auth: Optional[Dict[str, str]] = None):
    """Calculates commute buffer via Maps MCP Service."""
    mcp_res = await mcp.call_tool("maps/commute", {"origin": origin, "destination": destination}, auth=auth)
    return {"origin": origin, "destination": destination, "traffic": mcp_res}

@app.post("/api/v1/agent/luna/invoke")
async def invoke_luna(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # Propagate user credentials
    
    if "weather" in action:
        weather = await get_weather(location=task.get("params", "Mountain View"), auth=auth)
        return {"status": "success", "agent": "luna", "weather": weather}
        
    return {"status": "success", "agent": "luna", "output": f"Luna fetched context: {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
