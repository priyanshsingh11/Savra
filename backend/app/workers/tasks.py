import asyncio
import logging
from ..cache.storage import cache_manager
from ..services.llm import llm_service
from ..config.settings import settings

logger = logging.getLogger(__name__)

async def generate_ppt_task(job_id: str, topic: str, grade: str, slides: int):
    """
    Background worker task.
    Implements:
    - Cache check (by topic + grade + slides)
    - Retry logic (max 3)
    - Status updates
    """
    
    # Cache key format: hash(topic + grade + slides)
    cache_key = f"result:{topic.lower().strip()}:{grade}:{slides}"
    
    # 1. Check Cache
    cached_result = cache_manager.get(cache_key)
    if cached_result:
        logger.info(f"Cache hit for job {job_id}")
        cache_manager.update_job(job_id, {
            "status": "completed",
            "progress": 100,
            "result": cached_result
        })
        return

    # 2. Process with Retries
    retries = 0
    while retries < settings.MAX_RETRIES:
        try:
            logger.info(f"Attempt {retries + 1} for job {job_id}")
            
            # Update progress
            cache_manager.update_job(job_id, {"status": "processing", "progress": 30})
            
            # Call LLM
            result = await llm_service.generate_slides(topic, grade, slides)
            
            # 3. Store in Cache & Finalize
            cache_manager.set(cache_key, result)
            cache_manager.update_job(job_id, {
                "status": "completed",
                "progress": 100,
                "result": result
            })
            logger.info(f"Job {job_id} completed successfully.")
            return
            
        except Exception as e:
            retries += 1
            logger.error(f"Error in attempt {retries} for job {job_id}: {str(e)}")
            await asyncio.sleep(1) # Wait before retry

    # 4. Handle Failure
    cache_manager.update_job(job_id, {
        "status": "failed",
        "error": "Max retries exceeded during generation."
    })
