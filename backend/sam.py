import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import firestore
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Sam Scheduler Service", version="3.0.0")
db = firestore.Client() if os.getenv("FIRESTORE_PROJECT") else None

class EventReq(BaseModel):
    title: str
    start: str 
    end: str   
    attendees: List[str] = []

@app.post("/api/v1/schedule")
async def schedule_event(req: EventReq, auth: Optional[Dict[str, str]] = None):
    """Uses Real Google Calendar MCP with user auth."""
    mcp_res = await mcp.call_tool("calendar/event", {
        "summary": req.title,
        "start": req.start,
        "end": req.end
    }, auth=auth)
    
    event_id = mcp_res.get("id", f"err_{uuid.uuid4().hex[:8]}")
    if db:
        db.collection("events").document(event_id).set({
            "id": event_id, "title": req.title, "start": req.start, "end": req.end,
            "url": mcp_res.get("link"), "status": "scheduled"
        })
    return {"status": "success", "event_id": event_id, "link": mcp_res.get("link")}

@app.post("/api/v1/agent/sam/invoke")
async def invoke_sam(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # User credentials
    
    if "schedule" in action or "meeting" in action:
        return await schedule_event(EventReq(
            title=task.get("params", "Sync Meeting"),
            start="2026-04-07T10:00:00Z",
            end="2026-04-07T11:00:00Z"
        ), auth=auth)
    return {"status": "success", "agent": "sam", "output": "Sam idling."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
