from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "AI-PPT-Generator"
    DEBUG: bool = False
    
    # API Keys
    GROQ_API_KEY: str
    
    # Cache Config
    REDIS_URL: Optional[str] = None
    CACHE_EXPIRE_SECONDS: int = 3600
    
    # Polling & Worker Config
    POLLING_INTERVAL: int = 2
    MAX_RETRIES: int = 3
    
    # Logging & DB
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()
