from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "resume_scanner"
    jwt_secret: str = "change-me"
    jwt_expire_minutes: int = 1440
    max_upload_mb: int = 5
    frontend_url: str = "http://localhost:5173"
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

settings = Settings()
