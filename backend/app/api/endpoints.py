from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
import os
from uuid import uuid4
from datetime import datetime
from ..schemas.ppt import PPTGenerateRequest, JobResponse, JobStatusResponse, PPTResult
from ..cache.storage import cache_manager
from ..workers.tasks import generate_ppt_task

from ..services.database import db_service

router = APIRouter()

@router.get("/history")
async def get_history(limit: int = 10):
    """
    Fetch history from Supabase.
    """
    return db_service.get_history(limit=limit)

@router.get("/download/{job_id}")
async def download_ppt(job_id: str):
    """
    Download the generated .pptx file.
    """
    file_path = os.path.join("app/static/exports", f"{job_id}.pptx")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or still generating.")
    
    return FileResponse(
        path=file_path,
        filename=f"presentation_{job_id[:8]}.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )

@router.get("/stats")
async def get_system_stats():
    """
    Get system-wide performance and cost-saving metrics.
    """
    return cache_manager.get_stats()

@router.post("/generate", response_model=JobResponse)
async def generate_ppt(request: PPTGenerateRequest, background_tasks: BackgroundTasks):
    """
    Submit a new PPT generation job.
    """
    job_id = str(uuid4())
    
    # Initialize job state
    cache_manager.set(f"job:{job_id}", {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
        "error": None
    })
    
    # Trigger background task
    background_tasks.add_task(
        generate_ppt_task,
        job_id=job_id,
        topic=request.topic,
        grade=request.grade,
        slides=request.slides
    )
    
    return JobResponse(job_id=job_id)

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_status(job_id: str):
    """
    Check the current status of a generation job.
    """
    job = cache_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(**job)

@router.get("/result/{job_id}", response_model=PPTResult)
async def get_result(job_id: str):
    """
    Retrieve the final generated PPT result.
    """
    job = cache_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job is not completed. Current status: {job['status']}")
    
    # Merge metrics into the result for the frontend
    result_data = job["result"]
    result_data["execution_time"] = job.get("execution_time")
    result_data["is_cached"] = job.get("is_cached")
    result_data["download_url"] = job.get("download_url")
    
    return PPTResult(**result_data)
