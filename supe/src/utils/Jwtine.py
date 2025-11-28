# utils/jwt.py
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import jwt, JWTError
from typing import Any
from core.config import settings

def create_access_token(
    subject: Dict[str, Any],  # 存储在 token 中的用户信息（如 user_id）
    expires_delta: Optional[timedelta] = None
) -> str:
    """生成访问令牌（短期有效）"""
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 构建 payload（包含用户信息和过期时间）
    to_encode = {"exp": expire, "sub": subject}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    subject: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """生成刷新令牌（长期有效，用于获取新的访问令牌）"""
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode: Dict[str, Any] = {"exp": expire, "sub": subject}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """验证 token 并返回 payload 中的用户信息"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload  # 包含 "sub"（用户信息）和 "exp"（过期时间）
    except JWTError:
        raise ValueError("无效的令牌")
    except Exception:
        raise ValueError("令牌验证失败")