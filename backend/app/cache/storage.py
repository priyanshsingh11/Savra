import logging
import json
import redis
from typing import Optional, Any, Dict
from ..config.settings import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """
    Handles job status and results.
    Uses Redis if available, falls back to in-memory storage.
    """
    def __init__(self):
        self._in_memory: Dict[str, Any] = {}
        self._redis: Optional[redis.Redis] = None
        
        if settings.REDIS_URL:
            try:
                self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
                # Test connection
                self._redis.ping()
                logger.info("Connected to Redis cache.")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis, falling back to in-memory. Error: {e}")

    def get(self, key: str) -> Optional[Any]:
        if self._redis:
            try:
                data = self._redis.get(key)
                return json.loads(data) if data else None
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        
        return self._in_memory.get(key)

    def set(self, key: str, value: Any, expire: int = settings.CACHE_EXPIRE_SECONDS):
        if self._redis:
            try:
                self._redis.setex(key, expire, json.dumps(value))
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        
        self._in_memory[key] = value

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.get(f"job:{job_id}")

    def update_job(self, job_id: str, data: Dict):
        current = self.get_job(job_id) or {}
        current.update(data)
        self.set(f"job:{job_id}", current)

# Global singleton
cache_manager = CacheManager()
