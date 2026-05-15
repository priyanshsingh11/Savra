# Architectural Decisions

This document outlines the key technical decisions made during the development of the AI-Powered PPT Generation System.

## 1. Async Job Processing: FastAPI BackgroundTasks
**Decision**: Use FastAPI's built-in `BackgroundTasks` instead of Celery/RabbitMQ for the initial implementation.
**Rationale**: 
- Simplifies the architecture for a 12-hour assignment.
- Avoids the overhead of setting up a message broker.
- Can be easily refactored to Celery/TaskIQ in the future by swapping the task decorator.

## 2. Polling vs. WebSockets
**Decision**: Use Client-side Polling (1-2 second intervals).
**Rationale**: 
- Easier to implement and debug within the timeframe.
- Less state management required on the backend compared to WebSockets.
- Sufficient for the expected generation time (5-15 seconds).

## 3. Cache Layer: Memory-first with Redis Interface
**Decision**: Implement a generic `CacheProvider` interface that defaults to an in-memory dictionary but supports Redis configuration via environment variables.
**Rationale**: 
- Ensures the system is "Redis-ready" without requiring the user to have Redis installed locally.
- Speeds up repeated requests for the same topic/grade combinations.

## 4. LLM Strategy: Groq API
**Decision**: Use Groq's API for content generation.
**Rationale**: 
- Groq provides ultra-fast inference (Llama 3 70B), which is critical for a good user experience during slide generation.
- Free-tier accessibility for development.

## 5. Slide Generation: JSON Intermediate Format
**Decision**: The LLM generates a structured JSON representing the slides, which is then converted to a `.pptx` file (or returned as JSON for frontend preview).
**Rationale**: 
- Decouples content generation from file formatting.
- Allows the frontend to show a "live preview" of the generated content before the user downloads the file.

## 6. Naming Conventions
- **Files**: PascalCase for React components, camelCase for hooks/services, snake_case for Python files.
- **API**: kebab-case for URL paths, snake_case for JSON keys (following Python standards) or camelCase (if frontend consistency is preferred). Decided on **snake_case** for API responses to match Pydantic defaults.

## Future Improvements (Scalability)
1. **Distributed Task Queue**: Migrate `BackgroundTasks` to Celery + Redis for horizontal scaling.
2. **Object Storage**: Store generated `.pptx` files in AWS S3 or MinIO instead of local disk.
3. **User Authentication**: Add Supabase or Auth0 for user-specific job tracking.
4. **Streaming LLM**: Stream slide content to the frontend as it's being generated for an even more responsive feel.
