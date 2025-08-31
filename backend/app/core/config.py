import secrets
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, BaseSettings, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "PathMentor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Supabase Configuration (Primary Database)
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    @validator("SUPABASE_URL", pre=True)
    def validate_supabase_url(cls, v):
        if not v:
            raise ValueError("SUPABASE_URL is required")
        return v
    
    @validator("SUPABASE_SERVICE_ROLE_KEY", pre=True)
    def validate_supabase_service_key(cls, v):
        if not v:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is required")
        return v

    # Optional PostgreSQL (if using direct connection)
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: Optional[str] = None
    
    # Redis (Optional for caching)
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # ML Models
    ML_MODEL_PATH: str = "./models"
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
