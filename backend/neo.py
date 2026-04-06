import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Neo Memory Service", version="1.0.0")

class MemoryReq(BaseModel):
    content: str
    workflow_id: str

@app.post("/api/v1/memory")
async def store_memory(req: MemoryReq, auth: Optional[Dict[str, str]] = None):
    """Uses Pinecone MCP for semantic RAG storage."""
    mcp_res = await mcp.call_tool("memory/store", {
        "text": req.content,
        "workflow_id": req.workflow_id
    }, auth=auth)
    return {"status": "success", "id": mcp_res.get("id")}

@app.get("/api/v1/memory/recall")
async def recall_memory(query: str, auth: Optional[Dict[str, str]] = None):
    """Uses Pinecone MCP for semantic retrieval."""
    mcp_res = await mcp.call_tool("memory/search", {"query": query}, auth=auth)
    return {"status": "success", "matches": mcp_res.get("matches", [])}

@app.post("/api/v1/agent/neo/invoke")
async def invoke_neo(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # User auth
    
    if "recall" in action or "search" in action:
        return await recall_memory(query=task.get("params", ""), auth=auth)
    if "store" in action or "save" in action:
        return await store_memory(MemoryReq(
            content=task.get("params", "Project Milestone"),
            workflow_id="temp_wf_123"
        ), auth=auth)
    return {"status": "success", "agent": "neo", "output": f"Neo completed {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
