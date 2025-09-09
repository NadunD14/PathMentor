import secrets
from typing import Any, List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PathMentor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    @field_validator("SUPABASE_URL", mode="before")
    @classmethod
    def validate_supabase_url(cls, v):
        if not v:
            raise ValueError("SUPABASE_URL is required")
        return v

    @field_validator("SUPABASE_SERVICE_ROLE_KEY", mode="before")
    @classmethod
    def validate_supabase_service_key(cls, v):
        if not v:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is required")
        return v

    # Optional PostgreSQL
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: Optional[str] = None

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> Optional[str]:
        """Build database URI for SQLAlchemy if PostgreSQL credentials are provided"""
        if all([self.POSTGRES_SERVER, self.POSTGRES_USER, self.POSTGRES_PASSWORD, self.POSTGRES_DB]):
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT or 5432}/{self.POSTGRES_DB}"
        return None

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"

    # ML Models
    ML_MODEL_PATH: str = "./models"
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        protected_namespaces=()
    )
    


settings = Settings()
