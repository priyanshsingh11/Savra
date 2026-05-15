import asyncio
import logging
import time
from datetime import datetime
from ..cache.storage import cache_manager
from ..services.llm import llm_service
from ..services.ppt_generator import ppt_generator
from ..cache.semantic import semantic_cache
from ..config.settings import settings

logger = logging.getLogger(__name__)

async def generate_ppt_task(job_id: str, topic: str, grade: str, slides: int):
    """
    Background worker task with Stats Tracking, Semantic Caching and real PPTX generation.
    """
    start_time = time.time()
    cache_manager.record_stat("total_requests")
    
    # Cache key format: hash(topic + grade + slides)
    cache_key = f"result:{topic.lower().strip()}:{grade}:{slides}"
    
    # 1. Check Exact Cache First
    cached_result = cache_manager.get(cache_key)
    if cached_result:
        cache_manager.record_stat("exact_hits")
    
    # 2. Check Semantic Cache if exact miss
    if not cached_result:
        semantic_key = semantic_cache.find_similar(topic, grade)
        if semantic_key:
            # We found a similar topic
            cached_result = cache_manager.get(semantic_key)
            if cached_result:
                cache_manager.record_stat("semantic_hits")
                logger.info(f"[SEMANTIC HIT] Job {job_id} reusing result from {semantic_key}")
                cache_key = semantic_key

    if cached_result:
        # ... same cache hit logic ...
        execution_time = round(time.time() - start_time, 2)
        cache_manager.update_job(job_id, {
            "status": "completed",
            "progress": 100,
            "completed_at": datetime.utcnow().isoformat(),
            "execution_time": execution_time,
            "is_cached": True,
            "download_url": f"/download/{job_id}",
            "result": cached_result
        })
        return

    # 2. Process with Retries
    retries = 0
    while retries < settings.MAX_RETRIES:
        try:
            # Call LLM
            cache_manager.record_stat("llm_calls")
            cache_manager.update_job(job_id, {"status": "processing", "progress": 30})
            ppt_content = await llm_service.generate_slides(topic, grade, slides)
            
            # 3. Generate Real .PPTX File
            cache_manager.update_job(job_id, {"status": "processing", "progress": 85})
            ppt_generator.generate(job_id, ppt_content)
            
            # 4. Store in Cache & Finalize
            execution_time = round(time.time() - start_time, 2)
            cache_manager.set(cache_key, ppt_content)
            semantic_cache.add(topic, grade, cache_key)
            
            cache_manager.update_job(job_id, {
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.utcnow().isoformat(),
                "execution_time": execution_time,
                "is_cached": False,
                "download_url": f"/download/{job_id}",
                "result": ppt_content
            })
            logger.info(f"[SUCCESS] Job {job_id} completed with .pptx in {execution_time}s")
            return
            
        except Exception as e:
            retries += 1
            logger.error(f"[ERROR] Attempt {retries} failed for job {job_id}: {str(e)}")
            if retries < settings.MAX_RETRIES:
                await asyncio.sleep(1) 

    # 4. Handle Failure
    cache_manager.update_job(job_id, {
        "status": "failed",
        "completed_at": datetime.utcnow().isoformat(),
        "error": f"Max retries ({settings.MAX_RETRIES}) exceeded during generation."
    })
