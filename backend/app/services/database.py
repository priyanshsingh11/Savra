import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from ..config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Connected to Supabase Database.")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {e}")

    def save_presentation(self, job_id: str, topic: str, grade: str, result: Dict[str, Any]):
        """
        Persistently save a completed presentation to Supabase.
        """
        if not self.client:
            return

        try:
            data = {
                "id": job_id,
                "topic": topic,
                "grade": grade,
                "content": result,
                "created_at": "now()"
            }
            # This assumes you have a table named 'presentations'
            self.client.table("presentations").upsert(data).execute()
            logger.info(f"Presentation {job_id} synced to Supabase.")
        except Exception as e:
            logger.warning(f"Failed to sync to Supabase (check if 'presentations' table exists): {e}")

    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch the most recent presentations.
        """
        if not self.client:
            return []

        try:
            response = self.client.table("presentations").select("*").order("created_at", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch history from Supabase: {e}")
            return []

# Global singleton
db_service = DatabaseService()
