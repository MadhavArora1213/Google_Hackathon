import os
from typing import Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Kai Comms Service", version="1.0.0")

class SlackReq(BaseModel):
    channel: str
    message: str

@app.post("/api/v1/notify")
async def slack_notify(req: SlackReq, auth: Optional[Dict[str, str]] = None):
    """Sends real Slack messages using User's connection in MCP."""
    mcp_res = await mcp.call_tool("slack/message", {
        "channel": req.channel,
        "text": req.message
    }, auth=auth)
    return {"status": "success", "ts": mcp_res.get("ts"), "ok": True}

@app.post("/api/v1/agent/kai/invoke")
async def invoke_kai(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # User credentials
    
    if "notify" in action or "slack" in action or "comms" in action:
        return await slack_notify(SlackReq(
            channel="#general",
            message=task.get("params", "Team alert: workflow step completed.")
        ), auth=auth)
    return {"status": "success", "agent": "kai", "output": f"Kai notified: {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
