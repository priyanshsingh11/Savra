# Engineering Decisions & Tradeoffs

This document outlines the architectural rationale behind SlideAI, balancing the requirements of a 12-hour engineering assignment with production-ready scalability.

## 1. Asynchronous Job Architecture
**Decision**: Use an async-first workflow (Submit → Poll → Result).
**Rationale**: LLM generation is inherently slow and non-deterministic (5-15 seconds). A synchronous request would block the API worker and lead to client timeouts. By using a job-based system, we keep the API layer highly responsive and provide a superior UX with progress indicators.

## 2. Polling vs. WebSockets
**Decision**: Use Client-side Polling (3s interval) instead of WebSockets.
**Rationale**: 
- **Complexity**: WebSockets require managing stateful connections and handling complex reconnection logic on both sides.
- **Scalability**: For an MVP, polling is stateless and easier to scale behind a standard Load Balancer. 
- **Tradeoff**: While polling adds minor overhead, the 3s interval is a negligible cost compared to the complexity of maintaining persistent sockets for short-lived generation tasks.

## 3. Redis for Caching & State
**Decision**: Redis as the primary store for job status and slide results.
**Rationale**: 
- **Speed**: Ephemeral data like "Job Status" needs sub-millisecond latency.
- **Cost Optimization**: Repeated requests for common topics (e.g., "Photosynthesis") are served directly from Redis, reducing LLM API costs by 100% for cached hits.
- **Fallback**: Implemented an in-memory fallback to ensure the system is functional even if Redis infrastructure is unavailable during initial setup.

## 4. FastAPI BackgroundTasks
**Decision**: Use `FastAPI.BackgroundTasks` instead of Celery/RabbitMQ.
**Rationale**: 
- **Time Constraint**: Setting up a full Celery/Redis/Broker stack would have taken 20% of the assignment time.
- **Scale**: `BackgroundTasks` is sufficient for a single-node startup MVP. 
- **Future Proofing**: The `workers/tasks.py` is written as a standalone module, making the future migration to Celery as simple as changing a decorator.

## 5. Groq API for LLM
**Decision**: Groq (Llama 3 70B) for content generation.
**Rationale**: Groq’s LPU architecture provides inference speeds significantly faster than OpenAI or Anthropic, which is critical for maintaining an "instant-feel" UI in an async generation system.

## 6. Tradeoffs & Limitations
- **Statelessness**: The current system is stateless across restarts (unless Redis is persistent). For a true production system, a relational database (Postgres) would be added for permanent history.
- **Security**: Authentication was intentionally omitted to focus on the core engineering pipeline within the 12-hour window.
- **Local Worker**: The background worker runs in the same process as the API. In a large-scale system, these would be separated into independent services.
