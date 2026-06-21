"""
Configuration management for the YouTube AI Data Engineering Platform.
Uses Pydantic for type-safe configuration with environment variable support.
"""

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
    """Database connection settings."""
    mongodb_url: str = Field(default="mongodb://localhost:27017", env="MONGODB_URL")
    postgres_url: str = Field(default="postgresql://user:pass@localhost:5432/youtube_db", env="POSTGRES_URL")
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    class Config:
        env_file = ".env"


class CloudSettings(BaseSettings):
    """Cloud service settings."""
    aws_access_key_id: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", env="AWS_REGION")
    s3_bucket: str = Field(default="youtube-data-bucket", env="S3_BUCKET")
    
    class Config:
        env_file = ".env"


class AISettings(BaseSettings):
    """AI service settings."""
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    model_name: str = Field(default="gpt-4", env="AI_MODEL_NAME")
    temperature: float = Field(default=0.7, env="AI_TEMPERATURE")
    
    class Config:
        env_file = ".env"


class APISettings(BaseSettings):
    """API configuration settings."""
    host: str = Field(default="0.0.0.0", env="API_HOST")
    port: int = Field(default=8000, env="API_PORT")
    debug: bool = Field(default=False, env="API_DEBUG")
    cors_origins: list = Field(default=["*"], env="API_CORS_ORIGINS")
    
    class Config:
        env_file = ".env"


class ProcessingSettings(BaseSettings):
    """Data processing settings."""
    batch_size: int = Field(default=100, env="BATCH_SIZE")
    max_workers: int = Field(default=4, env="MAX_WORKERS")
    chunk_size: int = Field(default=1000, env="CHUNK_SIZE")
    
    class Config:
        env_file = ".env"


class LoggingSettings(BaseSettings):
    """Logging configuration."""
    level: str = Field(default="INFO", env="LOG_LEVEL")
    format: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT")
    file: Optional[str] = Field(default=None, env="LOG_FILE")
    
    class Config:
        env_file = ".env"


class SecuritySettings(BaseSettings):
    """Security settings."""
    secret_key: str = Field(default="your-secret-key-here", env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    class Config:
        env_file = ".env"


class Settings(BaseSettings):
    """Main application settings."""
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    database: DatabaseSettings = DatabaseSettings()
    cloud: CloudSettings = CloudSettings()
    ai: AISettings = AISettings()
    api: APISettings = APISettings()
    processing: ProcessingSettings = ProcessingSettings()
    logging: LoggingSettings = LoggingSettings()
    security: SecuritySettings = SecuritySettings()
    
    class Config:
        env_file = ".env"
    
    @validator('environment')
    def validate_environment(cls, v):
        allowed = ['development', 'staging', 'production']
        if v not in allowed:
            raise ValueError(f'Environment must be one of: {allowed}')
        return v


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


def get_database_url() -> str:
    """Get database URL based on environment."""
    settings = get_settings()
    if settings.environment == "production":
        return settings.database.postgres_url
    return settings.database.mongodb_url


def is_production() -> bool:
    """Check if running in production environment."""
    return get_settings().environment == "production"


def is_development() -> bool:
    """Check if running in development environment."""
    return get_settings().environment == "development"
