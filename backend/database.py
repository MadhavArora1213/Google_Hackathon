import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, create_engine, Session, select
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Connection URL (Point to Firebase Data Connect / Cloud SQL)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local sqlite for development if RDS info is missing
    DATABASE_URL = "sqlite:///./officemind.db"

engine = create_engine(DATABASE_URL, echo=True)

class WorkflowRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str
    task_input: str
    status: str = "pending" # pending, running, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: str
    agent_name: str
    action: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def save_workflow(workflow_id: str, user_id: str, task: str):
    with Session(engine) as session:
        record = WorkflowRecord(
            id=workflow_id,
            user_id=user_id,
            task_input=task,
            status="running"
        )
        session.add(record)
        session.commit()

def log_agent_action(workflow_id: str, agent: str, action: str, message: str):
    with Session(engine) as session:
        log = AuditLog(
            workflow_id=workflow_id,
            agent_name=agent,
            action=action,
            message=message
        )
        session.add(log)
        session.commit()

def update_workflow_status(workflow_id: str, status: str):
    with Session(engine) as session:
        statement = select(WorkflowRecord).where(WorkflowRecord.id == workflow_id)
        results = session.exec(statement)
        workflow = results.one()
        workflow.status = status
        workflow.updated_at = datetime.utcnow()
        session.add(workflow)
        session.commit()
