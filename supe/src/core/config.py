import os
import secrets
from pydantic_settings import BaseSettings

# JWT 密钥（生产环境需用环境变量配置，避免硬编码）
class Settings(BaseSettings):
    SECRET_KEY: str = os.environ.get("SECRET_KEY") or secrets.token_urlsafe(32)  # 建议至少 32 字符
    ALGORITHM: str = "HS256"  # 加密算法
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 访问令牌过期时间（30分钟）
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 刷新令牌过期时间（7天）
settings = Settings()