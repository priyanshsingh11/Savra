# Engineering Decisions & Tradeoffs

This document explains the architectural decisions behind the AI-powered async PPT generation system and how each decision supports scalability, reliability, cost optimization, and production-readiness within the constraints of a 36-hour engineering assignment.

## 1. Asynchronous Job-Based Architecture
**Decision**
Implemented an asynchronous workflow: 
`Submit Request` → `Create Job` → `Background Processing` → `Poll Status` → `Fetch Result`

**Why This Was Chosen**
PPT generation using LLMs is computationally expensive and unpredictable in latency. A synchronous request-response architecture would block API workers for several seconds, increasing timeout risks and degrading frontend responsiveness.

The async job architecture allows:
- Immediate API response with a `job_id`
- Non-blocking request handling
- Scalable background processing
- Better user experience through progress tracking

This aligns directly with the system design goal of transforming slow synchronous AI workflows into scalable async pipelines.

**Tradeoff**
Polling introduces additional API requests, but significantly simplifies the architecture compared to persistent real-time socket management.

---

## 2. Polling-Based Status Updates
**Decision**
Used frontend polling (`GET /status/{job_id}` every few seconds) instead of WebSockets or SSE.

**Why This Was Chosen**
The architecture prioritizes simplicity, statelessness, and rapid MVP scalability. Polling integrates naturally with REST APIs and avoids maintaining long-lived socket connections. For short-lived AI generation tasks, polling is operationally simpler while still delivering a responsive UX.

**System Design Benefit**
This keeps the API layer horizontally scalable because each request remains independent and stateless.

**Tradeoff**
Polling creates minor redundant requests, but the operational simplicity outweighed the complexity of managing WebSocket infrastructure within the assignment timeframe.

---

## 3. Redis as Cache & State Layer
**Decision**
Redis was used for job status tracking, semantic cache storage, request deduplication, and generated PPT result caching.

**Why This Was Chosen**
Redis provides extremely low-latency reads/writes and lightweight ephemeral state management. This directly supports reducing LLM costs, improving response speed, and supporting concurrent AI workloads.

**System Design Benefit**
Redis acts as the central coordination layer between API services, async workers, cache systems, and frontend polling requests.

**Tradeoff**
Redis persistence was not fully configured for the MVP. In production, Redis persistence or PostgreSQL would be added for long-term storage and recovery.

---

## 4. Semantic Caching Strategy
**Decision**
Added a semantic cache layer using embedding similarity instead of relying only on exact string matching.

**Why This Was Chosen**
Traditional caching only works for identical requests. However, users often phrase similar prompts differently (e.g., "Class 8 Photosynthesis" vs "Grade 8 Photosynthesis lesson"). Semantic caching allows the system to identify meaningfully similar requests and reuse results, drastically reducing repeated LLM calls.

**System Design Benefit**
This directly optimizes API cost, generation latency, and scalability under high traffic. It transforms caching from exact-match into meaning-based intelligent caching.

**Tradeoff**
Embedding generation introduces a small computational overhead, but the reduction in repeated LLM calls provides significantly larger long-term savings.

---

## 5. Request Deduplication
**Decision**
Implemented duplicate request detection before starting new generation jobs.

**Why This Was Chosen**
Without deduplication, multiple identical requests could trigger multiple expensive LLM generations simultaneously. This layer prevents unnecessary compute usage and redundant async jobs.

**System Design Benefit**
Improves concurrency handling and resource efficiency, especially for common educational topics requested by many users simultaneously.

---

## 6. FastAPI BackgroundTasks Instead of Celery
**Decision**
Used `FastAPI.BackgroundTasks` for async processing.

**Why This Was Chosen**
The assignment prioritized rapid prototyping and clean architecture. Using Celery/RabbitMQ would significantly increase setup complexity for a short MVP timeline.

**System Design Benefit**
The architecture still preserves clear separation between the API layer, worker logic, and cache management. The current worker module is designed modularly to allow for easy future migration to Celery or distributed worker systems.

**Tradeoff**
BackgroundTasks are process-local and less fault-tolerant compared to distributed queues.

---

## 7. Smart Model Routing
**Decision**
Implemented a routing layer that selects different LLM models based on request complexity.

**Why This Was Chosen**
Not all generation tasks require large expensive models. Simple topics use smaller/faster models while complex academic topics use higher-quality models.

**System Design Benefit**
This balances response quality, inference speed, and API cost optimization, demonstrating production-style AI orchestration.

**Tradeoff**
Complexity classification is currently heuristic-based rather than ML-driven.

---

## 8. Groq as Primary LLM Provider
**Decision**
Used Groq-hosted Llama 3 models as the primary generation provider.

**Why This Was Chosen**
Groq provides extremely fast inference latency, which supports the system’s async-first UX by minimizing total generation time and reducing queue buildup.

---

## 9. Circuit Breaker & Fallback Routing
**Decision**
Implemented a fallback reliability mechanism for LLM provider failures.

**Why This Was Chosen**
LLM providers can timeout or rate limit. The circuit breaker detects failures and automatically routes traffic to fallback providers, preventing cascading failures and improving system uptime.

**Tradeoff**
Fallback providers may introduce higher latency or cost, but system availability is prioritized.

---

## 10. Analytics & Observability Layer
**Decision**
Added monitoring metrics such as cache hit rate, estimated cost savings, failed jobs, and processing times.

**Why This Was Chosen**
The analytics layer demonstrates measurable business impact (LLM cost reduction) and operational awareness rather than only functional correctness.

---

## 11. Intentional MVP Tradeoffs
**Why**
The system intentionally avoided Kubernetes or complex microservices to focus on building a realistic startup-scale MVP. The architecture focuses on extensibility and modularity while remaining realistic for a 36-hour engineering assignment.
