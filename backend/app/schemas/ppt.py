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
    execution_time: Optional[float] = None
    is_cached: Optional[bool] = False
    download_url: Optional[str] = None

class JobStatusResponse(BaseModel):
    job_id: str
    status: str # "pending", "processing", "completed", "failed"
    progress: int
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    execution_time: Optional[float] = None
    download_url: Optional[str] = None
    error: Optional[str] = None
    is_cached: Optional[bool] = False
