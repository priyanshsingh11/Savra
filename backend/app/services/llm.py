import os
import json
import asyncio
import logging
from typing import Dict, Any
from groq import Groq
from ..config.settings import settings
from ..utils.circuit_breaker import llm_circuit_breaker

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    async def generate_slides(self, topic: str, grade: str, slides: int) -> Dict[str, Any]:
        """
        Clean, robust Groq call with Circuit Breaker.
        """
        if not llm_circuit_breaker.can_proceed():
            logger.warning(f"[CIRCUIT OPEN] Bypassing Groq for topic: {topic}")
            return await self._mock_generate(topic, grade, slides)

        logger.info(f"GROQ ATTEMPT: {topic} (Grade {grade})")
        
        system_prompt = f"""You are a slide generator. Return ONLY JSON.
        Format:
        {{
            "title": "Title",
            "slides": [
                {{"title": "Slide 1", "content": "Content 1"}}
            ]
        }}
        Topic: {topic}, Grade: {grade}, Slides: {slides}
        """

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Generate {slides} slides about {topic}."}
                    ]
                )
            )
            
            raw_content = response.choices[0].message.content
            json_str = raw_content.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(json_str)
            llm_circuit_breaker.record_success()
            return result
            
        except Exception as e:
            logger.error(f"GROQ CRITICAL ERROR: {str(e)}")
            llm_circuit_breaker.record_failure()
            return await self._mock_generate(topic, grade, slides)

    async def _mock_generate(self, topic: str, grade: str, slides: int) -> Dict[str, Any]:
        logger.info("FALLBACK TO MOCK")
        result = {
            "title": f"The Wonders of {topic} (Draft)",
            "slides": []
        }
        for i in range(1, slides + 1):
            result["slides"].append({
                "title": f"Slide {i}: {topic}",
                "content": f"Real AI generation failed. This is a placeholder for {topic} (Grade {grade})."
            })
        return result

llm_service = LLMService()
