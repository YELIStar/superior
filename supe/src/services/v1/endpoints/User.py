from datetime import datetime

from fastapi import (
    Cookie, Header, Query, Depends, Body,
    Request, Response, status, HTTPException
)
from fastapi.security import OAuth2PasswordBearer
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr

from dependencies.database import get_async_db_session
import models.User as UserModel
import schemas.User as UserSchema
import cruds.User as UserCrud
import utils.jwt_util as JWTUtil
import utils.password_hash as PasswordHash
import utils.logging_setting as Logger


User_router: APIRouter = APIRouter(prefix="/api/user", tags=["UserModel.User"])
"""子路由，前缀统一为 /api/user"""


@User_router.post(
    "/register", 
    response_model=UserSchema.UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
    description="通过手机号和密码注册新用户账户"
)
async def user_register(
    user_register: UserSchema.UserRegister,
    request: Request,
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """用户注册接口"""
    try:
        existing_user = await UserCrud.get_user_by_phone(
            db_session,
            user_register.phone
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="手机号码已被注册"
            )

        # DTO 转换为 ORM 模型
        register_data = user_register.model_dump()
        # del register_data['confirm_password']
        register_data['password_hash'] = PasswordHash.get_password_hash(
            register_data.pop('password')
        )
        last_login_ip = None
        # 尝试从请求中获取客户端IP地址
        client = request.client
        if client:
            last_login_ip = getattr(client, 'host', None) or (
                client[0] if isinstance(client, tuple) and client else None
            )
        if not last_login_ip:
            xff = request.headers.get('x-forwarded-for')
            if xff:
                last_login_ip = xff.split(',')[0].strip()
        register_data['last_login_ip'] = last_login_ip or '0.0.0.0'
        register_data['nickname'] = f"用户{user_register.phone[-4:]}"
        register_data['user_status'] = UserModel.user_status_enum.online
        user = UserModel.User.model_validate(register_data)
        
        await UserCrud.save_user(db_session, user)
        
        await Logger.logger_info(
            f"新用户注册成功，用户ID: {user.user_id}, 手机号: {user.phone}"
        )

        return UserSchema.UserResponse(
            user_id=user.user_id,
            phone=user.phone,
            user_status=user.user_status,
            last_login_at=user.last_login_at,
            create_at=user.create_at,
            profile=UserSchema.UserProfileResponse(
                email=user.email,
                nickname=user.nickname,
                gender=user.gender,
                birthday=user.birthday,
                signature=user.signature,
                province=user.province,
                city=user.city,
                avatar_url=user.avatar_url
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        await Logger.logger_error(f"用户注册过程中发生未预期错误: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器内部错误，无法完成注册"
        )


@User_router.post("/login", response_model=UserSchema.UserResponse)
async def user_login(
    response: Response,
    nickname: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """用户登录接口（返回JWT令牌）"""
    user = await UserCrud.get_user_by_phone(db_session, nickname)
    if not user or not PasswordHash.verify_password(password, user.password_hash):
        await Logger.logger_warning(
            f"用户登录失败，手机号{nickname}不存在或密码错误"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    await UserCrud.login_user(db_session, user)
    
    

    return UserSchema.UserResponse(
        phone=user.phone,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        email=user.email,
        status=user.status
    )


@User_router.get("/me", response_model=UserSchema.UserResponse)
async def get_current_user_info(
    current_user: UserModel.User = Depends(get_current_user)
):
    """获取当前登录用户信息（需登录）"""
    return UserSchema.UserResponse(
        phone=current_user.phone,
        nickname=current_user.nickname,
        nickname=current_user.nickname,
        avatar_url=current_user.avatar_url,
        email=current_user.email,
        status=current_user.status
    )


@User_router.put("/update", response_model=UserSchema.UserResponse)
async def user_update(
    user_update: UserSchema.UserUpdate,
    current_user: UserModel.User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """更新用户信息（仅能更新当前登录用户）"""
    # 防止更新其他用户信息（权限校验）
    updated_user = UserCrud.update_user(
        current_user.user_id, user_update, db_session)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在或更新失败"
        )
    return UserSchema.UserResponse(
        phone=updated_user.phone,
        nickname=updated_user.nickname,
        nickname=updated_user.nickname,
        avatar_url=updated_user.avatar_url,
        email=updated_user.email,
        status=updated_user.status
    )


@User_router.post("/logout")
async def user_logout(
    response: Response,
    current_user: UserModel.User = Depends(get_current_user)
):
    """用户登出（清除会话）"""
    # 可选：在数据库中标记会话失效（如果有会话管理表）
    db_session = next(get_async_db_session())
    UserCrud.logout_user(db_session, current_user.user_id)
    # 清除Cookie
    response.delete_cookie(
        key="session_id",
        path="/api/user"
    )
    return {"message": "成功登出"}


@User_router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def user_delete(
    response: Response,
    current_user: UserModel.User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """删除当前登录用户（需谨慎操作）"""
    deleted = UserCrud.delete_user(db_session, current_user.user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="删除失败，用户不存在"
        )
    # 清除会话
    response.delete_cookie("session_id", path="/api/user")
    return  # 204状态码无返回内容


@User_router.post("/password/reset-request")
async def request_password_reset(
    email: EmailStr = Body(..., embed=True),
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """请求密码重置（发送验证码到邮箱）"""
    # 生成重置令牌（存储到数据库，有效期15分钟）
    reset_token = JWTUtil.generate_reset_token()
    success = UserCrud.request_password_reset(db_session, email, reset_token)
    if not success:
        # 为了安全，即使邮箱不存在也返回相同提示（避免枚举邮箱）
        return {"message": "若邮箱存在，重置链接已发送"}
    # 实际项目中这里会调用邮件服务发送包含reset_token的链接
    return {"message": "若邮箱存在，重置链接已发送"}


@User_router.post("/password/reset")
async def reset_password(
    reset_data: UserSchema.UserPasswordReset,
    db_session: AsyncSession = Depends(get_async_db_session)
):
    """通过令牌重置密码"""
    success = UserCrud.reset_password(
        db_session,
        token=reset_data.token,
        new_password=PasswordHash.get_password_hash(reset_data.new_password)
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

# from core.database import get_async_db_session
# from models.UserModel.User import UserCreate, UserModel.User, UserResponse, UserUpdate
# from crud.UserModel.User import crud_create_user, crud_delete_user, crud_logout_user, crud_update_user

# UserModel.User: APIRouter = APIRouter()

# @UserModel.User.post(path="/login", response_model=UserResponse | dict)
# async def user_create(response: Response, user: UserCreate):
#     user_result = crud_create_user(next(get_async_db_session()), user)
#     if user_result is not None:
#         # 使用更标准的方式设置Cookie
#         response.set_cookie(key="session_id", value=str(user_result.user_id), httponly=True,path="/api/user")
#         return user_result
#     response.status_code = status.HTTP_400_BAD_REQUEST
#     return {"error": "Login failed"}

# @UserModel.User.post(path="/logout")
# async def user_logout(response: Response, session_id: str = Cookie()):
#     user_result = crud_logout_user(next(get_async_db_session()), int(session_id))
#     if user_result is not None:
#         response.delete_cookie("session_id")
#         return
#     response.status_code = status.HTTP_410_GONE
#     return

# @UserModel.User.put(path="/update", response_model=UserResponse)
# async def user_update(user: UserUpdate, response: Response, session_id: str = Cookie()):
#     user_result = crud_update_user(next(get_async_db_session()), int(session_id), user)
#     if user_result is not None:
#         return user_result
#     response.status_code = status.HTTP_410_GONE
#     return

# @UserModel.User.delete(path="/delete")
# async def user_delete(response: Response, session_id: str = Cookie()):
#     user_result = crud_delete_user(next(get_async_db_session()), int(session_id))
#     if user_result is not None:
#         response.delete_cookie("session_id")
#         return
#     response.status_code = status.HTTP_410_GONE
#     return
