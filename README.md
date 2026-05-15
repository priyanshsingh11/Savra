# AI-Powered PPT Generation System

A scalable, asynchronous full-stack application for generating professional PowerPoint presentations using the Groq LLM API.

## Project Overview
This project is designed as a production-ready assignment for an AI-powered PPT generation system. It features a Next.js frontend, a FastAPI backend, and an asynchronous job processing system with Redis-ready caching.

## Tech Stack
- **Frontend**: Next.js 14+, Tailwind CSS, Lucide React (Icons), Axios/SWR (API Fetching)
- **Backend**: FastAPI (Python 3.10+), Pydantic v2
- **LLM**: Groq API (Llama 3 / Mixtral)
- **Async Processing**: FastAPI BackgroundTasks (Simulated Job Queue)
- **Cache**: In-memory / Redis-ready abstraction
- **Presentation Logic**: `python-pptx` (for backend generation)

## Quick Start
1. **Clone the repository**
2. **Setup Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   uvicorn main:app --reload
   ```
3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## Folder Structure & Purpose

### `frontend/`
- `components/`: Reusable UI components (Button, Card, Input, SlidePreview).
- `app/`: Next.js App Router pages and layouts.
- `services/`: API client abstractions and endpoint definitions.
- `hooks/`: Custom React hooks, including `usePolling` for job status.
- `lib/`: Utility functions and shared constants.
- `styles/`: Global CSS and Tailwind configuration.

### `backend/`
- `api/`: FastAPI routers and endpoint handlers.
- `services/`: Business logic, including LLM integration and PPT generation.
- `core/`: Core configurations, security, and cache abstractions.
- `models/`: Database models or data structures.
- `schemas/`: Pydantic models for request/response validation.
- `worker/`: Background task handlers and job management.
- `utils/`: Helper functions (logging, retry logic).

### `architecture/`
- `design-doc.md`: Technical documentation of system architecture.

## API Endpoint Structure
- `POST /api/v1/jobs`: Create a new PPT generation job.
- `GET /api/v1/jobs/{job_id}`: Poll job status and retrieve results.
- `GET /api/v1/jobs`: List recent jobs (optional).
- `GET /api/v1/health`: Health check endpoint.

## Environment Variables
See `.env.example` in both `frontend` and `backend` directories.
- `GROQ_API_KEY`: Required for LLM generation.
- `REDIS_URL`: Optional (defaults to in-memory if not provided).
- `BACKEND_URL`: Used by frontend to connect to FastAPI.
