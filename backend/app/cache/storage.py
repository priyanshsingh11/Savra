import logging
from typing import Optional, Any, Dict
import json

logger = logging.getLogger(__name__)

class CacheManager:
    """
    Handles job status and results.
    Designed for easy migration to Redis.
    """
    def __init__(self):
        # In-memory store: {key: value}
        # In production, this would be Redis or a Database.
        self._storage: Dict[str, Any] = {}

    def get(self, key: str) -> Optional[Any]:
        return self._storage.get(key)

    def set(self, key: str, value: Any):
        self._storage[key] = value

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.get(f"job:{job_id}")

    def update_job(self, job_id: str, data: Dict):
        current = self.get_job(job_id) or {}
        current.update(data)
        self.set(f"job:{job_id}", current)

# Global singleton
cache_manager = CacheManager()
