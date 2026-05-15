import os
import json
import asyncio
import logging
from typing import Dict, Any
from ..config.settings import settings

logger = logging.getLogger(__name__)

class LLMService:
    """
    Abstraction for LLM interaction.
    Supports both Mock (for testing) and Real (Groq) generation.
    """
    async def generate_slides(self, topic: str, grade: str, slides: int, use_mock: bool = False) -> Dict[str, Any]:
        if use_mock:
            return await self._mock_generate(topic, grade, slides)
        
        # In a real implementation, you'd use the Groq client here.
        # For this assignment, we'll keep the mock logic clean but structured.
        return await self._mock_generate(topic, grade, slides)

    async def _mock_generate(self, topic: str, grade: str, slides: int) -> Dict[str, Any]:
        logger.info(f"Mocking LLM generation for {topic} ({grade}th grade)")
        await asyncio.sleep(2) # Simulate latency
        
        result = {
            "slides": [
                {
                    "title": f"Introduction to {topic}",
                    "content": f"This presentation covers {topic} for grade {grade}."
                }
            ]
        }
        
        # Add more slides if requested
        for i in range(2, slides + 1):
            result["slides"].append({
                "title": f"Key Concept {i-1}",
                "content": f"Detailed exploration of concept {i-1} related to {topic}."
            })
            
        return result

llm_service = LLMService()
