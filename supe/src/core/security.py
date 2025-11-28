from typing import Optional, Dict, Any
import jwt
import os
import secrets
import hashlib
from passlib.context import CryptContext
from datetime import datetime, timedelta

from core.config import settings

# 密码哈希上下文，使用bcrypt算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """使用bcrypt算法对密码进行安全哈希处理"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码与bcrypt哈希密码是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT访问令牌"""
    to_encode = data.copy()
    
    # 设置过期时间
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 添加过期时间到载荷
    to_encode.update({"exp": expire, "iat": datetime.now()})
    
    # 编码JWT令牌
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """验证JWT访问令牌并返回载荷"""
    try:
        # 解码JWT令牌
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # 令牌已过期
        return None
    except jwt.PyJWTError:
        # 令牌无效
        return None


def generate_reset_token(expires_delta: Optional[timedelta] = None) -> str:
    """生成用于密码重置的JWT令牌"""
    if not expires_delta:
        # 默认15分钟过期，密码重置令牌应该更短
        expires_delta = timedelta(minutes=15)
    
    # 创建包含重置目的的载荷
    data = {"purpose": "password_reset", "jti": secrets.token_urlsafe(16)}
    return create_access_token(data, expires_delta)


def verify_reset_token(token: str) -> Optional[Dict[str, Any]]:
    """验证密码重置令牌"""
    payload = verify_access_token(token)
    if payload and payload.get("purpose") == "password_reset":
        return payload
    return None