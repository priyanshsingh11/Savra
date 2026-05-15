from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID

class PPTGenerateRequest(BaseModel):
    topic: str = Field(..., example="Photosynthesis")
    grade: str = Field(..., example="8")
    slides: int = Field(default=5, ge=1, le=20)

class JobResponse(BaseModel):
    job_id: str

class SlideContent(BaseModel):
    title: str
    content: str

class PPTResult(BaseModel):
    slides: List[SlideContent]

class JobStatusResponse(BaseModel):
    job_id: str
    status: str # "pending", "processing", "completed", "failed"
    progress: int
    error: Optional[str] = None
