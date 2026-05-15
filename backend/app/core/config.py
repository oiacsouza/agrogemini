from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_USER: str = "AGROGEMINI"
    DB_PASSWORD: str = "AgroGemini123"
    DB_DSN: str = "127.0.0.1:1521/freepdb1"

    SECRET_KEY: str = "agrogemini-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://agrogemini.com:8443",
        "http://agrogemini.com:8443",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
