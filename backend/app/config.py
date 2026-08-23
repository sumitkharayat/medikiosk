import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PORT: int = 5000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DB_TYPE: str = "sqlite"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "medikiosk"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    SQLITE_DB_PATH: str = "medikiosk.db"

    # JWT
    JWT_SECRET: str = "medikiosk_super_secret_jwt_key_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # AI Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Uploads
    UPLOAD_DIR: str = "uploads"

    @property
    def database_url(self) -> str:
        if self.DB_TYPE.lower() == "mysql":
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        return f"sqlite:///{self.SQLITE_DB_PATH}"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
