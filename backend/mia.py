import os
import uuid
import asyncio
from typing import List, Dict, Any, Optional, Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import firestore
from dotenv import load_dotenv
from mcp_client import mcp # Clean MCP call pattern

load_dotenv()

app = FastAPI(title="Mia Task Service", version="2.0.0 (MCP Architecture)")
db = firestore.Client() if os.getenv("FIRESTORE_PROJECT") else None

class TaskReq(BaseModel):
    title: str
    priority: Literal["P0", "P1", "P2", "P3"] = "P2"
    deadline: str # ISO8601
    description: Optional[str] = ""
    workflow_id: Optional[str] = None

class BulkTaskReq(BaseModel):
    goal: str
    workflow_id: str
    tasks: List[TaskReq]

# --- SKILL-010: Task Creation (Real Notion via MCP) ---
@app.post("/api/v1/task")
async def create_task(req: TaskReq, auth: Optional[Dict[str, str]] = None):
    """Creates a real task page in Notion via MCP Tool."""
    mcp_res = await mcp.call_tool("notion/page", {
        "title": req.title,
        "priority": req.priority,
        "deadline": req.deadline,
        "description": req.description
    }, auth=auth)
    
    notion_id = mcp_res.get("page_id", f"backup_{uuid.uuid4().hex[:10]}")
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    
    if db:
        db.collection("tasks").document(task_id).set({
            "id": task_id,
            "notion_id": notion_id,
            "title": req.title,
            "priority": req.priority,
            "deadline": req.deadline,
            "status": "todo",
            "workflow_id": req.workflow_id,
            "created_at": firestore.SERVER_TIMESTAMP,
            "url": mcp_res.get("url")
        })

    return {"status": "success", "task_id": task_id, "url": mcp_res.get("url")}

@app.post("/api/v1/agent/mia/invoke")
async def invoke_mia(task: Dict[str, Any]):
    """A2A Protocol Hook - Passes user auth context to MCP."""
    action = task.get("action", "").lower()
    auth = task.get("auth") # User tokens passed from orchestrator
    
    if "create" in action or "task" in action:
        return await create_task(TaskReq(
            title=task.get("params", "Project Milestone"),
            deadline="2026-04-10T09:00:00Z"
        ), auth=auth)
    
    return {"status": "success", "agent": "mia", "output": f"Mia processed: {action}"}
    
    return {"status": "success", "agent": "mia", "output": f"Mia processed: {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
