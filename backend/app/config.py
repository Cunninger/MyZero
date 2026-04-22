from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # AI API
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-3.5-turbo"
    polish_model: str = ""
    humanize_model: str = ""
    
    # Server
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    
    # App
    debug: bool = False
    max_text_length: int = 50000
    api_request_interval: int = 6
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
