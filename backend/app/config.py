import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "CivicLens AI"
    APP_VERSION: str = "3.1.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    # Default to sqlite local file for instant zero-dependency out-of-the-box run,
    # or override with DATABASE_URL=postgresql://postgres:postgres@localhost:5432/civiclens
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'civiclens.db'}")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Storage for evidence photos
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # Deduplication & Routing Constraints (from PRD Section 5.2)
    DEDUP_PROXIMITY_METERS: float = 15.0  # ST_DWithin 15.0m
    DEDUP_WINDOW_HOURS: int = 12          # 12-hour sliding window

    # Dispatch & Notification Settings
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_DEFAULT_CHAT_ID: str = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "")
    EMERGENCY_WEBHOOK_URL: str = os.getenv("EMERGENCY_WEBHOOK_URL", "")

    # Default Target City / Municipality
    DEFAULT_MUNICIPALITY: str = "Greater Visakhapatnam Municipal Corporation (GVMC)"
    DEFAULT_ZONE: str = "Zone 3"
    DEFAULT_WARD: str = "Ward 14"

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
