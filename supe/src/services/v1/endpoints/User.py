from typing import Optional, Annotated
from fastapi import (
    Cookie, Header, Query, Request, Response, status,
    Depends, HTTPException, Body
)
from fastapi.routing import APIRouter
from pydantic import EmailStr
from sqlmodel import Session

from core.database import get_session
from models.User import (
    UserCreate, User, UserResponse, UserUpdate,
    UserRegister, PasswordReset
)
from crud.User import (
    crud_create_user, crud_delete_user, crud_logout_user,
    crud_update_user, crud_get_user_by_id, crud_register_user,
    crud_get_user_by_username, crud_request_password_reset,
    crud_reset_password
)
from core.security import (
    create_access_token, verify_password,
    get_password_hash, generate_reset_token
)
from dependencies.auth import verify_token, create_refresh_token, oauth2_scheme

# 初始化路由，前缀统一为/api/user，便于分组管理
Urouter: APIRouter = APIRouter(prefix="/api/user", tags=["User"])


# 依赖项：验证session_id并返回当前用户
def get_current_user(
    token: str = Depends(oauth2_scheme),  # 从dependencies/auth.py导入
    db: Session = Depends(get_session)
) -> User:
    """基于JWT的认证依赖"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(token)
        user_id: int = payload.get("sub").get("user_id")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    user = crud_get_user_by_id(db, user_id)
    if not user:
        raise credentials_exception
    return user


@Urouter.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def user_register(
    user: UserRegister,
    db: Session = Depends(get_session)
):
    """用户注册接口"""
    # 检查用户名是否已存在
    existing_user = crud_get_user_by_username(
        db, user.username) if user.username else None
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被注册"
        )
    # 密码加密后存储（在crud中实现或此处处理）
    user.password = get_password_hash(user.password)
    new_user = crud_register_user(db, user)
    return new_user


@Urouter.post("/login", response_model=UserResponse | dict)
def user_login(
    response: Response,
    username: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    db: Session = Depends(get_session)
):
    """用户登录接口（返回JWT令牌）"""
    user = crud_get_user_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    # 生成令牌
    user_info = {"user_id": user.user_id, "username": user.username}
    access_token = create_access_token(subject=user_info)
    refresh_token = create_refresh_token(subject=user_info)

    # 更新登录时间
    user.last_login = datetime.now()
    db.commit()

    # 返回 UserResponse 对象而不是字典
    return UserResponse(
        phone=user.phone,
        username=user.username,
        avatar=user.avatar,
        email=user.email,
        status=user.status
    )


@Urouter.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """获取当前登录用户信息（需登录）"""
    return UserResponse(
        phone=current_user.phone,
        username=current_user.username,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        email=current_user.email,
        status=current_user.status
    )


@Urouter.put("/update", response_model=UserResponse)
def user_update(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """更新用户信息（仅能更新当前登录用户）"""
    # 防止更新其他用户信息（权限校验）
    updated_user = crud_update_user(db, current_user.user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在或更新失败"
        )
    return UserResponse(
        phone=updated_user.phone,
        username=updated_user.username,
        nickname=updated_user.nickname,
        avatar=updated_user.avatar,
        email=updated_user.email,
        status=updated_user.status
    )


@Urouter.post("/logout")
def user_logout(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """用户登出（清除会话）"""
    # 可选：在数据库中标记会话失效（如果有会话管理表）
    db = next(get_session())
    crud_logout_user(db, current_user.user_id)
    # 清除Cookie
    response.delete_cookie(
        key="session_id",
        path="/api/user"
    )
    return {"message": "成功登出"}


@Urouter.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
def user_delete(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """删除当前登录用户（需谨慎操作）"""
    deleted = crud_delete_user(db, current_user.user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="删除失败，用户不存在"
        )
    # 清除会话
    response.delete_cookie("session_id", path="/api/user")
    return  # 204状态码无返回内容


@Urouter.post("/password/reset-request")
def request_password_reset(
    email: EmailStr = Body(..., embed=True),
    db: Session = Depends(get_session)
):
    """请求密码重置（发送验证码到邮箱）"""
    # 生成重置令牌（存储到数据库，有效期15分钟）
    reset_token = generate_reset_token()
    success = crud_request_password_reset(db, email, reset_token)
    if not success:
        # 为了安全，即使邮箱不存在也返回相同提示（避免枚举邮箱）
        return {"message": "若邮箱存在，重置链接已发送"}
    # 实际项目中这里会调用邮件服务发送包含reset_token的链接
    return {"message": "若邮箱存在，重置链接已发送"}


@Urouter.post("/password/reset")
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_session)
):
    """通过令牌重置密码"""
    success = crud_reset_password(
        db,
        token=reset_data.token,
        new_password=get_password_hash(reset_data.new_password)
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="令牌无效或已过期"
        )
    return {"message": "密码重置成功，请重新登录"}

# from typing import Optional
# from fastapi import Cookie, Header, Query, Request, Response, status
# from fastapi.routing import APIRouter

# from core.database import get_session
# from models.User import UserCreate, User, UserResponse, UserUpdate
# from crud.User import crud_create_user, crud_delete_user, crud_logout_user, crud_update_user

# Urouter: APIRouter = APIRouter()

# @Urouter.post(path="/login", response_model=UserResponse | dict)
# def user_create(response: Response, user: UserCreate):
#     user_result = crud_create_user(next(get_session()), user)
#     if user_result is not None:
#         # 使用更标准的方式设置Cookie
#         response.set_cookie(key="session_id", value=str(user_result.user_id), httponly=True,path="/api/user")
#         return user_result
#     response.status_code = status.HTTP_400_BAD_REQUEST
#     return {"error": "Login failed"}

# @Urouter.post(path="/logout")
# def user_logout(response: Response, session_id: str = Cookie()):
#     user_result = crud_logout_user(next(get_session()), int(session_id))
#     if user_result is not None:
#         response.delete_cookie("session_id")
#         return
#     response.status_code = status.HTTP_410_GONE
#     return

# @Urouter.put(path="/update", response_model=UserResponse)
# def user_update(user: UserUpdate, response: Response, session_id: str = Cookie()):
#     user_result = crud_update_user(next(get_session()), int(session_id), user)
#     if user_result is not None:
#         return user_result
#     response.status_code = status.HTTP_410_GONE
#     return

# @Urouter.delete(path="/delete")
# def user_delete(response: Response, session_id: str = Cookie()):
#     user_result = crud_delete_user(next(get_session()), int(session_id))
#     if user_result is not None:
#         response.delete_cookie("session_id")
#         return
#     response.status_code = status.HTTP_410_GONE
#     return
