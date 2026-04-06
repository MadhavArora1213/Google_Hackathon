import os
import json
import uuid
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Database & System Logic
from database import create_db_and_tables, save_workflow, update_workflow_status
from mcp_client import mcp
from mcp_service import app as mcp_app # Import the tool service app

load_dotenv()
create_db_and_tables()

# Gemini Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="OfficeMind AI - Unified Port 8000 OS", version="4.1.0")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MOUNT THE MCP TOOL SERVICE (Internal Action Hub) ---
app.mount("/mcp", mcp_app)

# --- MODELS ---
class AuthContext(BaseModel):
    google_token: Optional[str] = None
    notion_token: Optional[str] = None
    slack_token: Optional[str] = None
    github_token: Optional[str] = None
    serper_api_key: Optional[str] = None

class OrchestrationReq(BaseModel):
    task: str
    user_id: str
    auth: Optional[AuthContext] = None
    context: Optional[Dict[str, Any]] = {}

# --- WEBSOCKET MANAGER (3D SYNC) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"WS Error: {e}")

manager = ConnectionManager()

# --- 🚀 10 MODULAR AGENT ROUTERS ---

agents_router = APIRouter(prefix="/api/v1/agent")

@agents_router.post("/{agent_id}/invoke")
async def invoke_agent(agent_id: str, task: Dict[str, Any]):
    """Unified Gateway for all sub-agents to trigger Real MCP tools."""
    action = task.get("action", "").lower()
    params = {"params": task.get("params", "Workflow Action"), "auth": task.get("auth")}
    
    # Tool Routing Logic (REAL SDK CONNECTIONS)
    if agent_id == "sam": # Google Calendar
        res = await mcp.call_tool("calendar/slots", {"date": "tomorrow"}, auth=task.get("auth"))
        return {"status": "success", "agent": "sam", "output": res}
    elif agent_id == "mia": # Notion
        res = await mcp.call_tool("notion/page", {"title": task.get("params")}, auth=task.get("auth"))
        return {"status": "success", "agent": "mia", "output": res}
    elif agent_id == "dev": # Gmail
        res = await mcp.call_tool("gmail/send", {"to": "team@ex.com"}, auth=task.get("auth"))
        return {"status": "success", "agent": "dev", "output": res}
    elif agent_id == "riya": # Web Search
        res = await mcp.call_tool("web_search", {"query": task.get("params")}, auth=task.get("auth"))
        return {"status": "success", "agent": "riya", "output": res}
    elif agent_id == "neo": # Memory
        res = await mcp.call_tool("memory/search", {"query": task.get("params")}, auth=task.get("auth"))
        return {"status": "success", "agent": "neo", "output": res}
    elif agent_id == "kai": # Slack
        res = await mcp.call_tool("slack/message", {"text": task.get("params")}, auth=task.get("auth"))
        return {"status": "success", "agent": "kai", "output": res}
    elif agent_id == "finn": # Google Drive
        res = await mcp.call_tool("drive/file", {"name": "Audit.doc"}, auth=task.get("auth"))
        return {"status": "success", "agent": "finn", "output": res}
    elif agent_id == "luna": # Weather
        res = await mcp.call_tool("weather", {"location": "View"}, auth=task.get("auth"))
        return {"status": "success", "agent": "luna", "output": res}
    elif agent_id == "aria": # Analytics
        return {"status": "success", "agent": "aria", "output": {"productivity": 88}}
    elif agent_id == "rex": # GitHub
        res = await mcp.call_tool("github/issue", {"repo": "OS"}, auth=task.get("auth"))
        return {"status": "success", "agent": "rex", "output": res}

    return {"status": "error", "message": f"Agent {agent_id} not found."}

app.include_router(agents_router)

# --- 🧠 ALEX ORCHESTRATOR LOGIC ---

AGENT_POSITIONS = {
    "alex": [0,0,0], "sam": [-6,0,-4], "mia": [-6,0,2], "dev": [0,0,-6],
    "riya": [6,0,-4], "neo": [6,0,0], "aria": [6,0,4], "kai": [0,0,6],
    "finn": [-3,0,6], "luna": [3,0,6], "rex": [-3,0,-4]
}

@app.post("/api/v1/orchestrate")
async def orchestrate(req: OrchestrationReq):
    """Alex: Uses Gemini to decompose task and triggers 3D workflow."""
    workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
    
    # 1. Decomposition (Simplified for Demo Logic)
    steps = [
        {"agent": "sam", "action": "MCP:Calendar", "reason": "Scheduling sync"},
        {"agent": "mia", "action": "MCP:Notion", "reason": "Generating tracker"},
        {"agent": "kai", "action": "MCP:Slack", "reason": "Notifying team"}
    ]
    
    save_workflow(workflow_id, req.user_id, req.task)
    asyncio.create_task(execute_workflow(workflow_id, steps, req.auth.dict() if req.auth else {}))
    return {"workflow_id": workflow_id, "steps": steps}

async def execute_workflow(workflow_id: str, steps: List[dict], auth: dict):
    """Real-time Multi-Agent execution loop."""
    for step in steps:
        agent = step["agent"]
        pos = AGENT_POSITIONS.get(agent, [0,0,0])
        
        # UI Thinking Event
        await manager.broadcast(json.dumps({
            "event": "agent_action", "agent": agent, "message": f"Executing {step['action']}...",
            "position": {"x": pos[0], "y": pos[1], "z": pos[2]}, "timestamp": datetime.utcnow().isoformat()
        }))
        
        # INTERNAL CALL TO AGENT ROUTE
        async with httpx.AsyncClient() as client:
            res = await client.post(f"http://localhost:8000/api/v1/agent/{agent}/invoke", json={"params": step["reason"], "auth": auth})
        
        await asyncio.sleep(2) # Give Three.js time to animate
        
        # UI Complete Event
        await manager.broadcast(json.dumps({
            "event": "step_complete", "agent": agent, "message": f"Finished {step['action']}",
            "position": {"x": pos[0], "y": pos[1], "z": pos[2]}, "timestamp": datetime.utcnow().isoformat()
        }))

    update_workflow_status(workflow_id, "completed")
    await manager.broadcast(json.dumps({"event": "workflow_done", "agent": "alex", "message": "All tasks finished."}))

@app.websocket("/api/v1/stream/{id}")
async def websocket_endpoint(websocket: WebSocket, id: str):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
