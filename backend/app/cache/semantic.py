import numpy as np
import logging
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class SemanticCache:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", threshold: float = 0.92):
        self.threshold = threshold
        logger.info(f"Loading Semantic model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        # In a real distributed system, these would be in a Vector DB like Pinecone/Milvus
        # For this scalable prototype, we'll use a high-performance local index synced with Redis
        self.index = [] # List of { "vector": np.array, "cache_key": str, "topic": str }

    def get_embedding(self, text: str) -> np.array:
        return self.model.encode([text])[0]

    def find_similar(self, topic: str, grade: str) -> Optional[str]:
        """
        Searches the semantic index for a similar topic + grade combo.
        """
        if not self.index:
            return None

        query_text = f"{topic} {grade}".lower()
        query_vector = self.get_embedding(query_text).reshape(1, -1)
        
        # Calculate similarities
        best_score = 0
        best_key = None
        best_topic = ""

        for item in self.index:
            score = cosine_similarity(query_vector, item["vector"].reshape(1, -1))[0][0]
            if score > best_score:
                best_score = score
                best_key = item["cache_key"]
                best_topic = item["topic"]

        if best_score >= self.threshold:
            logger.info(f"[SEMANTIC HIT] Found match: '{topic}' -> '{best_topic}' (Score: {best_score:.4f})")
            return best_key
        
        logger.info(f"[SEMANTIC MISS] Best match: '{topic}' -> '{best_topic}' (Score: {best_score:.4f})")
        return None

    def add(self, topic: str, grade: str, cache_key: str):
        """
        Adds a new topic to the semantic index.
        """
        query_text = f"{topic} {grade}".lower()
        vector = self.get_embedding(query_text)
        self.index.append({
            "vector": vector,
            "cache_key": cache_key,
            "topic": topic
        })
        logger.info(f"[SEMANTIC INDEXED] Added '{topic}' to the index.")

# Singleton instance
semantic_cache = SemanticCache()
