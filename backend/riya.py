import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Riya Research Service", version="1.0.0")

class SearchReq(BaseModel):
    query: str
    max_results: int = 5

@app.post("/api/v1/research")
async def run_research(req: SearchReq, auth: Optional[Dict[str, str]] = None):
    """Uses Web Search MCP (via Serper) for live web queries."""
    mcp_res = await mcp.call_tool("web_search", {"query": req.query}, auth=auth)
    return {"status": "success", "summary": mcp_res.get("summary", "Done"), "sources": mcp_res.get("snippets", [])}

@app.post("/api/v1/agent/riya/invoke")
async def invoke_riya(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # User credentials propagate here
    
    if "search" in action or "research" in action or "query" in action:
        return await run_research(SearchReq(query=task.get("params", "Latest Trends")), auth=auth)
    return {"status": "success", "agent": "riya", "output": f"Riya completed research for {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
