# Technical Design Document: AI PPT Generator

## 1. System Architecture
The system is built on a **Producer-Consumer** pattern mediated by a shared cache.

### A. Request Lifecycle
1. **Producer (Client)**: React frontend submits a `PPTGenerateRequest`.
2. **Orchestrator (FastAPI)**: 
   - Validates input via Pydantic.
   - Generates a UUID `job_id`.
   - Initializes job state in Redis (`status: pending`).
   - Dispatches a `BackgroundTasks` worker.
   - Returns `202 Accepted` with the `job_id`.
3. **Consumer (Worker)**:
   - Checks Redis for existing results (Deduplication).
   - Calls Groq API for content generation.
   - Updates Redis with the result and `status: completed`.
4. **Observer (Client)**: Polls `/status/{id}` until completion, then fetches `/result/{id}`.

### B. Caching Layer
- **Exact Match Cache**: Redis-based key-value store for identical requests.
- **Semantic Cache (Bonus)**: Uses `all-MiniLM-L6-v2` embeddings to identify contextually similar topics (e.g., "Class 8 Photosynthesis" matches "Grade 8 Photosynthesis").
- **Similarity Threshold**: 0.92 (Cosine Similarity).
- **Impact**: Significant reduction in LLM latency and API costs for popular educational topics.

## 2. Reliability & Fault Tolerance
### A. Retry Strategy
Transient failures (LLM timeouts, API rate limits) are handled using an exponential backoff-ready retry loop in the worker:
- **Max Retries**: 3
- **Action**: On failure, the job is marked as `failed` with a descriptive error message returned to the UI.

### B. Graceful Failures
- **Smart Model Routing**: Heuristic-based routing that sends simple queries to `Llama-3.1-8B-Instant` (low cost/latency) and complex/technical queries to `Llama-3.3-70B-Versatile`.
- **Circuit Breaker Pattern**: Intelligent monitoring of LLM health; automatically falls back to safe states if Groq/Gemini hits 503 errors.
- The `CacheManager` uses a try-except block to fall back to local RAM if Redis is down.
- Frontend includes error boundaries and "Try Again" triggers to handle backend connectivity issues.

## 3. Cost Reduction Strategy
- **Deduplication**: Before calling the LLM, the worker checks if the exact same presentation was generated recently.
- **Structured JSON**: By using LLM "JSON Mode," we ensure the response is always parseable, reducing the need for expensive "correction" calls.
- **Estimated Savings**: For an educational platform with repeating curricula, caching can reduce LLM costs by up to 60-80%.

## 4. Scaling Plan (Roadmap)
### Short Term (Scale Up)
- Increase worker concurrency in FastAPI.
- Deploy Redis with Persistence (RDB/AOF).

### Medium Term (Scale Out)
- **Broker Migration**: Move from `BackgroundTasks` to **Celery + Redis/RabbitMQ**.
- **Independent Workers**: Spin up dedicated worker containers that listen to the Redis queue, allowing the API and Workers to scale independently.
- **Database**: Add **PostgreSQL** to move from ephemeral job tracking to persistent user histories.

## 5. Textual Flow Diagram
```text
[ USER ] 
   │
   ▼
[ React SPA ] ───( Polls Status )───┐
   │                                │
   ▼                                │
[ FastAPI API ] ───( Writes )───▶ [ Redis Cache ]
   │                                ▲
   ▼                                │
[ Background Worker ] ──( Updates )─┘
   │
   ▼
[ Groq LLM API ]
```

## 6. Assumptions & Limitations
- **Assumptions**: Users prefer a "Generation Started" message over waiting 10 seconds for a response.
- **Limitations**: In-memory job tracking (without Redis) is lost on server restart. 
- **Intentional Omissions**: User Authentication and File Storage (S3) were skipped to focus on the core async pipeline.
