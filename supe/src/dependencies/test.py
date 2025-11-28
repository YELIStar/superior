from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta, datetime

from core.database import create_db
from models.User import User
from core.security import verify_password
from utils.Jwtine import create_access_token, create_refresh_token, verify_token
from core.config import settings
from dependencies.auth import get_current_user

app = FastAPI()

# 登录接口（返回 access_token 和 refresh_token）
@app.post("/login/")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(create_db)
):
    # OAuth2PasswordRequestForm 包含 username（这里用手机号）和 password
    user = db.exec(select(User).where(User.phone == form_data.username)).first()
    
    # 验证用户和密码
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 定义存储在 token 中的用户信息（避免敏感数据）
    user_info = {"user_id": user.user_id, "phone": user.phone}
    
    # 生成访问令牌和刷新令牌
    access_token = create_access_token(subject=user_info)
    refresh_token = create_refresh_token(subject=user_info)
    
    # 更新最后登录时间
    user.last_login = datetime.now()
    db.add(user)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"  # 固定为 bearer 类型
    }

# 刷新访问令牌接口（用 refresh_token 获取新的 access_token）
@app.post("/refresh-token/")
def refresh_token(
    refresh_token: str,
    db: Session = Depends(create_db)
):
    try:
        # 验证刷新令牌
        payload = verify_token(refresh_token)
        user_info = payload.get("sub")
        if not user_info:
            raise HTTPException(status_code=401, detail="无效的刷新令牌")
    except ValueError:
        raise HTTPException(status_code=401, detail="刷新令牌无效或已过期")
    
    # 生成新的访问令牌
    new_access_token = create_access_token(subject=user_info)
    return {"access_token": new_access_token, "token_type": "bearer"}

# 示例：需要登录才能访问的接口
@app.get("/users/me/")
def read_current_user(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息（隐藏密码）"""
    user_dict = current_user.model_dump(exclude={"password_hash"})
    return user_dict