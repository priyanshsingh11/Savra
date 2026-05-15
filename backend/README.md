# AI PPT Generation Backend

A production-ready FastAPI backend for generating presentation content asynchronously using Groq LLM (with Mock fallback).

## Features
- **Async Job Processing**: Uses `BackgroundTasks` for non-blocking generation.
- **Smart Caching**: Results are cached by topic/grade/slides to save LLM costs.
- **Resilient**: Automatic retries (max 3) for transient LLM failures.
- **Scalable**: Clean architecture allows swapping the in-memory store for Redis/Postgres easily.

## Getting Started

### 1. Setup Virtual Environment
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Copy `.env.example` to `.env` and add your Groq key.
```bash
cp .env.example .env
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```

## API Usage (CURL)

### 1. Submit a Job
```bash
curl -X POST "http://localhost:8000/api/v1/generate" \
     -H "Content-Type: application/json" \
     -d '{"topic": "Photosynthesis", "grade": "8", "slides": 5}'
```

### 2. Check Status
Replace `{job_id}` with the ID from the previous step.
```bash
curl -X GET "http://localhost:8000/api/v1/status/{job_id}"
```

### 3. Get Result
```bash
curl -X GET "http://localhost:8000/api/v1/result/{job_id}"
```

## Future Scalability
- **Celery**: Swap `BackgroundTasks` for Celery/Redis for persistent job queuing.
- **Postgres**: Store job status in a real database for persistence across restarts.
- **S3**: Store generated `.pptx` files (once file generation is added).
