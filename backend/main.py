import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

app = FastAPI(title="OfficeMind AI API", description="AI Orchestration for OfficeMind Productivity OS")

# Enable CORS for the Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class OrchestrationReq(BaseModel):
    task: str
    user_id: str

# --- ENDPOINTS ---

@app.get("/health")
async def health():
    """Skill-035: Health Check Endpoint"""
    return {
        "status": "ok", 
        "agent": "alex-orchestrator", 
        "version": "1.0.0",
        "uptime": 0 
    }

@app.post("/api/v1/orchestrate")
async def orchestrate(req: OrchestrationReq):
    """Skill-001: Natural Language Task Decomposition"""
    # Alex's placeholder response
    return {
        "workflow_id": "wf_abc_demo",
        "steps": [
            {"agent": "sam", "action": "check_calendar"},
            {"agent": "dev", "action": "draft_email"}
        ],
        "estimated_duration_s": 5
    }

if __name__ == "__main__":
    import uvicorn
    # Skill-034: Auto-generates Swagger Docs at /docs
    uvicorn.run(app, host="0.0.0.0", port=8000)
