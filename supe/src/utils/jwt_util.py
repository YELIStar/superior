from typing import Any, Dict, Optional
from pathlib import Path
from datetime import datetime, timedelta, UTC
from functools import lru_cache
import secrets

from jose import jwt, exceptions
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

import utils.path_util as path_util

"""自定义异常类"""
class TokenError(Exception):
    """Token相关基础异常"""
    pass


class TokenExpiredError(TokenError):
    """Token已过期"""
    pass


class InvalidTokenError(TokenError):
    """Token无效（签名错误/格式错误/篡改等）"""
    pass


class JWTSettings(BaseSettings):
    """JWT核心配置"""
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = Field(default="RS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=10)
    
    RSA_KEY_SIZE: int = Field(default=2048, description="RSA密钥长度，建议2048/4096")
    RSA_PUBLIC_EXPONENT: int = Field(default=65537, description="RSA公钥指数")
    PRIVATE_KEY_FILE: Path = Field(default=Path("configs/private_key.pem"))
    PUBLIC_KEY_FILE: Path = Field(default=Path("configs/public_key.pem"))

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__", # 支持嵌套配置（如JWT__RSA_KEY_SIZE）
        case_sensitive=False,      # 不区分大小写
        frozen=True                # 配置不可变
    )


@lru_cache(maxsize=1)
def get_jwt_settings() -> JWTSettings:
    """获取JWT配置实例缓存， 避免重复初始化"""
    return JWTSettings()


@lru_cache(maxsize=1)
def get_private_key() -> str:
    """
    获取RSA私钥
    """
    settings = get_jwt_settings()
    private_key_file = settings.PRIVATE_KEY_FILE

    # 优先读取已存在的私钥文件
    if private_key_file.exists():
        return private_key_file.read_text(encoding="utf-8")

    # 生成新的RSA私钥
    private_key = rsa.generate_private_key(
        public_exponent=settings.RSA_PUBLIC_EXPONENT,
        key_size=settings.RSA_KEY_SIZE,
    )

    # 序列化为PKCS8格式的PEM字符串
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    private_key_file.write_text(private_pem, encoding="utf-8")
    return private_pem


@lru_cache(maxsize=1)
def get_public_key() -> str:
    """
    获取RSA公钥
    """
    settings = get_jwt_settings()
    public_key_file = settings.PUBLIC_KEY_FILE

    # 优先读取已存在的公钥文件
    if public_key_file.exists():
        return public_key_file.read_text(encoding="utf-8")

    # 从私钥生成公钥
    private_pem = get_private_key()
    private_key = serialization.load_pem_private_key(
        private_pem.encode("utf-8"),
        password=None,
    )
    public_key = private_key.public_key()

    # 序列化为PEM字符串
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    # 写入文件
    public_key_file.write_text(public_pem, encoding="utf-8")
    return public_pem


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    创建JWT访问令牌
    """
    settings = get_jwt_settings()
    to_encode = data.copy()

    # 计算过期时间
    now = datetime.now(UTC)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    # 添加JWT标准声明（增强规范性）
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": "your-app",# 签发者（可根据业务修改）
        "sub": "access"   # 令牌主题（区分不同类型令牌）
    })

    # 编码生成JWT
    encoded_jwt = jwt.encode(
        claims=to_encode,
        key=get_private_key(),
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_access_token(token: str) -> Dict[str, Any]:
    """
    验证JWT访问令牌并返回解析后的载荷
    """
    settings = get_jwt_settings()
    try:
        payload = jwt.decode(
            token=token,
            key=get_public_key(),
            algorithms=[settings.ALGORITHM],
            options={
                "verify_exp": True,  # 强制验证过期时间
                "verify_iat": True,  # 强制验证签发时间
                "require": ["exp", "iat"],  # 要求必须包含exp和iat声明
            },
        )
        return payload
    except exceptions.ExpiredSignatureError as e:
        raise TokenExpiredError("Token has expired") from e
    except exceptions.JWTError as e:
        raise InvalidTokenError(f"Invalid token: {str(e)}") from e


# ======================== 辅助函数（可选） ========================
def clear_jwt_cache() -> None:
    """
    清理JWT相关缓存
    """
    get_jwt_settings.cache_clear()
    get_private_key.cache_clear()
    get_public_key.cache_clear()