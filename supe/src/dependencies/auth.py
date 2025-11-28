# dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from datetime import datetime
from jose import JWTError

from core.database import create_db
from models.User import User 
from utils.Jwtine import verify_token
from core.config import settings

# 定义 OAuth2 令牌获取方式（从请求头的 Authorization: Bearer <token> 中提取）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # tokenUrl 是登录接口路径

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(create_db)
) -> User:
    """
    依赖注入：验证 token 并返回当前登录用户
    用于需要登录才能访问的接口
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 验证 token 并解析用户信息
        payload = verify_token(token)
        user_id: int = payload.get("sub").get("user_id")  # 从 payload 中获取 user_id
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception
    
    # 查询数据库获取用户
    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user