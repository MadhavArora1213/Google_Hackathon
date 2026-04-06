import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from mcp_client import mcp 

load_dotenv()

app = FastAPI(title="Dev Email Service", version="1.0.0")

class EmailReq(BaseModel):
    to: List[EmailStr]
    subject: str
    body: str

@app.post("/api/v1/email/send")
async def send_email(req: EmailReq, auth: Optional[Dict[str, str]] = None):
    """Sends real Gmail using the user's connection in MCP Service."""
    mcp_res = await mcp.call_tool("gmail/send", {
        "to": req.to,
        "subject": req.subject,
        "body": req.body
    }, auth=auth)
    return {"status": "success", "message_id": mcp_res.get("message_id")}

@app.post("/api/v1/agent/dev/invoke")
async def invoke_dev(task: Dict[str, Any]):
    action = task.get("action", "").lower()
    auth = task.get("auth") # Pass user tokens from Alex
    
    if "send" in action or "email" in action:
        return await send_email(EmailReq(
            to=["team@example.com"],
            subject="Project Update",
            body=task.get("params", "Workflow step completed.")
        ), auth=auth)
    return {"status": "success", "agent": "dev", "output": f"Dev completed {action}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
