# Technical Design Document: AI PPT Generator

## 1. System Architecture

The system follows an asynchronous Producer–Consumer architecture coordinated through Redis-based shared state and caching. The primary goal of the design is to transform slow synchronous AI generation into a scalable, fault-tolerant async workflow optimized for latency, reliability, and cost efficiency.

---

# 2. Request Lifecycle

## A. Producer (Frontend Layer)

The React frontend acts as the producer.

Users submit:
- topic
- grade
- number of slides

The frontend sends a request to:

```http
POST /generate
```

Instead of waiting for generation to finish, the frontend immediately receives a `job_id` and begins polling for updates.

---

## B. Orchestrator (FastAPI API Layer)

The FastAPI backend acts as the orchestration layer.

Responsibilities:
- Validate request payloads using Pydantic
- Generate unique UUID-based `job_id`
- Initialize job state in Redis
- Dispatch async background workers
- Return `202 Accepted` immediately

Example Initial Job State:

```json
{
  "job_id": "abc36",
  "status": "pending"
}
```

This architecture prevents long-running LLM operations from blocking API workers.

---

## C. Consumer (Async Worker Layer)

Background workers process generation jobs asynchronously.

Responsibilities:
- Check semantic cache
- Detect duplicate requests
- Route request to appropriate LLM model
- Generate slide content
- Store results in Redis
- Update job status

The worker lifecycle:

```text
pending → processing → completed/failed
```

This separation improves:
- scalability
- responsiveness
- fault isolation

---

## D. Observer (Frontend Polling Layer)

The frontend periodically polls:

```http
GET /status/{job_id}
```

until the job is completed.

Once finished:

```http
GET /result/{job_id}
```

fetches the generated PPT content.

This creates a responsive UX while keeping the backend stateless and scalable.

---

# 3. Redis Cache & Shared State Layer

Redis is used as the central coordination and caching layer.

Responsibilities:
- Job status tracking
- Semantic caching
- Request deduplication
- Generated PPT storage

---

## A. Exact Match Cache

Redis stores previously generated PPT responses for identical requests.

Example:

```text
Photosynthesis:Grade8:5slides
```

Repeated requests are served instantly without calling the LLM again.

### Benefit
- Reduces latency
- Eliminates repeated API costs
- Improves scalability

---

## B. Semantic Cache (Bonus Optimization)

The system includes a semantic caching layer using:

```text
all-MiniLM-L6-v2
```

embedding vectors.

Instead of relying only on exact text matching, the cache detects semantically similar requests.

Example:

```text
"Class 8 Photosynthesis"
≈
"Grade 8 Photosynthesis lesson"
```

### Similarity Method
- Cosine Similarity
- Threshold: `0.92`

### Benefit
This significantly reduces:
- repeated LLM calls
- response latency
- infrastructure cost

especially for high-frequency educational topics.

---

## C. Request Deduplication

Before dispatching a new generation task, the worker checks whether a similar request is already processing.

If detected:
- existing `job_id` is reused
- duplicate LLM calls are avoided

### Benefit
Improves:
- concurrency handling
- cost efficiency
- scalability during traffic spikes

---

# 4. Reliability & Fault Tolerance

## A. Retry Strategy

Transient failures such as:
- API timeouts
- temporary provider overload
- network instability

are handled using retry logic with exponential-backoff-ready architecture.

### Configuration
- Maximum Retries: `3`

### Failure Handling
If retries fail:
- job status becomes `failed`
- descriptive error returned to frontend

This prevents indefinite hanging requests.

---

## B. Smart Model Routing

The architecture includes a lightweight routing layer for balancing:
- latency
- quality
- API cost

### Routing Logic

```text
Simple Educational Topics
→ Llama-3.1-8B-Instant

Complex Technical Topics
→ Llama-3.3-70B-Versatile
```

### Benefit
This dynamically optimizes:
- generation speed
- inference cost
- response quality

without always relying on expensive large models.

---

## C. Circuit Breaker & Fallback Design

The architecture includes a circuit-breaker-ready reliability layer.

If repeated provider failures occur:
- fallback routing logic activates
- traffic can be redirected to backup providers or secondary API keys

This protects the system from:
- cascading failures
- repeated retry storms
- degraded user experience

### Benefit
Improves:
- uptime
- fault tolerance
- provider resilience

---

## D. Redis Fallback Handling

The `CacheManager` includes safe fallback behavior.

If Redis becomes unavailable:
- the system temporarily falls back to in-memory storage
- core functionality remains operational

This ensures graceful degradation during infrastructure failures.

---

# 5. Cost Optimization Strategy

The assignment strongly emphasizes reducing LLM operational costs.

The system addresses this using multiple optimization layers.

---

## A. Semantic Caching

Avoids repeated generation for contextually similar requests.

### Impact
Potentially reduces LLM costs by:
- 60–80% for repetitive educational topics

---

## B. Request Deduplication

Prevents multiple users from triggering identical concurrent generations.

### Impact
Reduces:
- duplicated inference calls
- worker congestion
- unnecessary compute usage

---

## C. Smart Model Routing

Smaller models are automatically selected for simple tasks.

### Impact
Balances:
- quality
- latency
- operational cost

This prevents overusing expensive large models unnecessarily.

---

## D. Structured JSON Generation

The LLM operates in structured JSON mode.

### Benefit
- predictable outputs
- reduced parsing failures
- fewer regeneration calls

which reduces additional API usage costs.

---

# 6. Scaling Plan

The architecture is intentionally designed as an MVP-first scalable system.

---

## A. Short-Term Scaling

### Improvements
- Increase worker concurrency
- Redis persistence (RDB/AOF)
- Better retry orchestration
- Rate limiting

---

## B. Medium-Term Scaling

### Queue Migration
Migrate from:

```text
FastAPI BackgroundTasks
```

to:

```text
Celery + Redis/RabbitMQ
```

### Benefit
Allows:
- distributed workers
- independent scaling
- queue durability

---

## C. Horizontal Worker Scaling

Dedicated worker containers can process jobs independently from the API layer.

This enables:
- traffic distribution
- better concurrency
- independent worker autoscaling

---

## D. Persistent Database Layer

Add PostgreSQL for:
- permanent job history
- analytics
- user session persistence
- auditability

This removes dependence on ephemeral in-memory state.

---

# 7. System Architecture Diagram

![System Architecture](diagram.png)

---

## Component Breakdown

### Frontend Layer (React + Tailwind)
Handles:
- user interaction
- job polling
- progress display
- final slide rendering

---

### API Layer (FastAPI)
Responsible for:
- validation
- orchestration
- job initialization
- async task dispatching

---

### Async Processing Layer
Coordinates:
- semantic caching
- model routing
- LLM generation
- retry handling

---

### Reliability Layer
Provides:
- circuit breaker protection
- fallback routing
- retry management
- graceful degradation

---

### Redis Cache & State Layer
Stores:
- job state
- generated content
- semantic embeddings
- duplicate request tracking

---

### Analytics Layer
Tracks:
- cache hit rate
- cost savings
- processing latency
- failed job metrics

This provides visibility into system efficiency and optimization impact.

---

# 8. Assumptions & Limitations

## Assumptions
- Users prefer asynchronous progress updates over long blocking waits.
- Educational topics are highly repetitive, making caching effective.
- Most workloads are bursty but short-lived.

---

## Limitations
- Local BackgroundTasks are process-bound and not fully distributed.
- In-memory fallback state is lost on server restart.
- Redis persistence is not fully configured in MVP mode.

---

## Intentional Omissions

The following were intentionally skipped to prioritize core system architecture within the 36-hour engineering window:

- Authentication
- User management
- File storage (S3/GCS)
- Real-time WebSocket infrastructure
- Distributed orchestration
- Kubernetes deployment

The focus was intentionally placed on:
- async architecture
- scalability
- caching
- reliability
- cost optimization
- production-aware system design