from fastapi import APIRouter, BackgroundTasks, HTTPException
from uuid import uuid4
from ..schemas.ppt import PPTGenerateRequest, JobResponse, JobStatusResponse, PPTResult
from ..cache.storage import cache_manager
from ..workers.tasks import generate_ppt_task

router = APIRouter()

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
    
    return PPTResult(**job["result"])
