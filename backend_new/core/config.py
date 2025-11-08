"""
Core configuration for PathMentor backend.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "PathMentor API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", 8000))  # Railway provides PORT env var
    
    # Database
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_key: Optional[str] = None  # Alias for backward compatibility
    database_url: Optional[str] = None
    
    # External APIs
    groq_api_key: Optional[str] = None
    youtube_api_key: Optional[str] = None
    udemy_client_id: Optional[str] = None
    udemy_client_secret: Optional[str] = None
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    reddit_user_agent: Optional[str] = None
    
    # ML Models
    rl_model_path: Optional[str] = None
    transformers_cache: Optional[str] = None
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "text"
    
    # Security
    secret_key: Optional[str] = None
    allowed_origins: str = "*"
    
    # Rate limiting
    rate_limit_per_minute: int = 100
    
    # Redis
    redis_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields that might be in .env


# Global settings instance
settings = Settings()