import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Finn File Service", version="1.0.0")

class FileReq(BaseModel):
    name: str
    content: str

@app.post("/api/v1/file/create")
async def create_file(req: FileReq, auth: Optional[Dict[str, str]] = None):
    """Creates a real document in Google Drive via MCP."""
    mcp_res = await mcp.call_tool("drive/file", {
        "name": req.name,
        "content": req.content
    }, auth=auth)
    return {"status": "success", "file_id": mcp_res.get("id"), "url": mcp_res.get("web_view_link")}

@app.post("/api/v1/agent/finn/invoke")
async def invoke_finn(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # Pass user tokens from orchestrator
    
    if "save" in action or "file" in action or "drive" in action:
        return await create_file(FileReq(
            name=f"Workflow_{uuid.uuid4().hex[:8]}.gdoc",
            content=task.get("params", "Summary of the multi-agent task workflow.")
        ), auth=auth)
    return {"status": "success", "agent": "finn", "output": f"Finn completed {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
