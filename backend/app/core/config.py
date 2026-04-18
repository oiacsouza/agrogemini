from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_USER: str = "AGROGEMINI"
    DB_PASSWORD: str = "AgroGemini123"
    DB_DSN: str = "localhost:1521/FREEPDB1"

    SECRET_KEY: str = "agrogemini-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
