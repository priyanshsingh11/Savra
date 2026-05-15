import numpy as np
import os
import logging
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class SemanticCache:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", threshold: float = 0.80):
        self.threshold = threshold
        self.persist_path = "app/static/semantic_index.json"
        self.vectors_path = "app/static/semantic_vectors.npy"
        
        logger.info(f"Loading Semantic model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        
        self.metadata = [] # List of { "cache_key": str, "topic": str }
        self.vectors = None # Numpy array of vectors
        
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.persist_path) and os.path.exists(self.vectors_path):
            try:
                with open(self.persist_path, 'r') as f:
                    self.metadata = json.load(f)
                self.vectors = np.load(self.vectors_path)
                logger.info(f"[SEMANTIC LOADED] Restored {len(self.metadata)} topics from disk.")
            except Exception as e:
                logger.error(f"Failed to load semantic index: {e}")

    def _save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(self.persist_path), exist_ok=True)
            with open(self.persist_path, 'w') as f:
                json.dump(self.metadata, f)
            np.save(self.vectors_path, self.vectors)
        except Exception as e:
            logger.error(f"Failed to save semantic index: {e}")

    def _normalize(self, text: str) -> str:
        return text.lower().strip()

    def get_embedding(self, text: str) -> np.array:
        return self.model.encode([text])[0]

    def find_similar(self, topic: str, grade: str) -> Optional[str]:
        if not self.metadata or self.vectors is None:
            return None

        topic = self._normalize(topic)
        query_text = f"{topic} {grade}".lower()
        query_vector = self.get_embedding(query_text).reshape(1, -1)
        
        # Batch calculate similarities using sklearn
        similarities = cosine_similarity(query_vector, self.vectors)[0]
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]

        if best_score >= self.threshold:
            match = self.metadata[best_idx]
            logger.info(f"[SEMANTIC HIT] Found match: '{topic}' -> '{match['topic']}' (Score: {best_score:.4f})")
            return match["cache_key"]
        
        return None

    def add(self, topic: str, grade: str, cache_key: str):
        query_text = f"{topic} {grade}".lower()
        vector = self.get_embedding(query_text)
        
        self.metadata.append({
            "cache_key": cache_key,
            "topic": topic
        })
        
        if self.vectors is None:
            self.vectors = vector.reshape(1, -1)
        else:
            self.vectors = np.vstack([self.vectors, vector.reshape(1, -1)])
            
        self._save_to_disk()
        logger.info(f"[SEMANTIC INDEXED] Added '{topic}' to the index.")

# Singleton instance
semantic_cache = SemanticCache()
