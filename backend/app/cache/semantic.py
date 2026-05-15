import os
import logging
import json
import httpx
from typing import Optional, List

logger = logging.getLogger(__name__)

class SemanticCache:
    def __init__(self, threshold: float = 0.80):
        self.threshold = threshold
        # Using simple JSON storage for vectors (fine for small hobby app)
        self.persist_path = "app/static/semantic_index.json"
        self.hf_token = os.getenv("HF_TOKEN")
        # Free Inference API - extremely lightweight
        self.api_url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        
        self.data = [] # List of { "cache_key": str, "topic": str, "vector": list }
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.persist_path):
            try:
                with open(self.persist_path, 'r') as f:
                    self.data = json.load(f)
                logger.info(f"[SEMANTIC LOADED] Restored {len(self.data)} topics from disk.")
            except Exception as e:
                logger.error(f"Failed to load semantic index: {e}")

    def _save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(self.persist_path), exist_ok=True)
            with open(self.persist_path, 'w') as f:
                json.dump(self.data, f)
        except Exception as e:
            logger.error(f"Failed to save semantic index: {e}")

    def _normalize(self, text: str) -> str:
        return text.lower().strip()

    def get_embedding(self, text: str) -> List[float]:
        """Fetch embedding from Hugging Face Free Inference API."""
        headers = {}
        if self.hf_token:
            headers["Authorization"] = f"Bearer {self.hf_token}"
            
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    self.api_url,
                    headers=headers,
                    json={"inputs": text, "options": {"wait_for_model": True}}
                )
                if response.status_code == 200:
                    result = response.json()
                    # HF sometimes returns a list of lists even for single input
                    if isinstance(result, list) and len(result) > 0:
                        return result if isinstance(result[0], float) else result[0]
                    return result
                else:
                    logger.error(f"HF API Error: {response.status_code} - {response.text}")
                    return []
        except Exception as e:
            logger.error(f"Failed to get embedding from HF: {e}")
            return []

    def cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        """Pure Python cosine similarity to avoid numpy dependency."""
        if not v1 or not v2: return 0.0
        try:
            dot = sum(a*b for a, b in zip(v1, v2))
            norm1 = sum(a*a for a in v1) ** 0.5
            norm2 = sum(b*b for b in v2) ** 0.5
            return dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0
        except:
            return 0.0

    def find_similar(self, topic: str, grade: str) -> Optional[str]:
        if not self.data:
            return None

        topic = self._normalize(topic)
        query_text = f"{topic} {grade}".lower()
        query_vector = self.get_embedding(query_text)
        
        if not query_vector or not isinstance(query_vector, list):
            return None

        best_score = -1.0
        best_key = None
        best_topic = ""

        for item in self.data:
            score = self.cosine_similarity(query_vector, item["vector"])
            if score > best_score:
                best_score = score
                best_key = item["cache_key"]
                best_topic = item["topic"]

        if best_score >= self.threshold:
            logger.info(f"[SEMANTIC HIT] Found match: '{topic}' -> '{best_topic}' (Score: {best_score:.4f})")
            return best_key
        
        return None

    def add(self, topic: str, grade: str, cache_key: str):
        query_text = f"{topic} {grade}".lower()
        vector = self.get_embedding(query_text)
        
        if not vector or not isinstance(vector, list):
            logger.warning("Could not add to semantic index: Failed to get embedding.")
            return

        self.data.append({
            "cache_key": cache_key,
            "topic": topic,
            "vector": vector
        })
            
        self._save_to_disk()
        logger.info(f"[SEMANTIC INDEXED] Added '{topic}' to the index.")

# Singleton instance
semantic_cache = SemanticCache()
