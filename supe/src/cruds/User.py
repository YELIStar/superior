from datetime import datetime
from typing import Sequence

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

import models.User as UserModel


async def get_user_by_id(
    db_session: AsyncSession,
    user_id: int
) -> UserModel.User | None:
    """通过用户ID查询用户详情"""
    return await db_session.get(UserModel.User, user_id)


async def get_user_by_phone(
    db_session: AsyncSession,
    phone: str
) -> UserModel.User | None:
    """通过手机号查询用户"""
    user = await db_session.execute(
        select(UserModel.User).where(
            UserModel.User.phone == phone
        )
    )
    return user.scalars().first()


async def get_all_users(
    db_session: AsyncSession
) -> Sequence[UserModel.User]:
    """获取所有用户列表"""
    stmt = select(UserModel.User).where(UserModel.User.delete_at == None)
    result = await db_session.execute(stmt)
    return result.scalars().all()


async def get_user_deleted(
    user: UserModel.User
) -> bool:
    """检查用户是否被软删除"""
    return user.delete_at is not None if user else False


async def save_user(
    db_session: AsyncSession,
    user: UserModel.User
) -> bool:
    """注册新用户"""
    try:
        db_session.add(user)
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except ValueError as e:
        raise Exception(f"业务校验失败: {e}") from e
    except Exception as e:
        raise e


async def delete_user_soft(
    db_session: AsyncSession,
    user: UserModel.User,
) -> bool:
    """软删除用户"""
    user.delete_at = datetime.now()
    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e


async def delete_user_hard(
    db_session: AsyncSession,
    user: UserModel.User,
) -> bool:
    """硬删除用户"""
    try:
        await db_session.delete(user)
        await db_session.flush()
        return True
    except Exception as e:
        raise e


async def update_user_cancle_soft_delete(
    db_session: AsyncSession,
    user: UserModel.User,
) -> bool:
    """取消软删除用户"""
    user.delete_at = None
    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e


async def update_user_password(
    db_session: AsyncSession,
    user: UserModel.User,
    new_password_hash: str,
) -> bool:
    """更新用户密码"""
    user.password_hash = new_password_hash
    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e


async def update_user(
    db_session: AsyncSession,
    user: UserModel.User,
    update_data: dict,
) -> bool:
    """更新用户信息"""
    for key, value in update_data.items():
        setattr(user, key, value)

    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e


async def login_user(
    db_session: AsyncSession,
    user: UserModel.User
) -> bool:
    """用户登录时更新状态为在线，并记录登录时间"""
    user.status = UserModel.user_status_enum.online
    user.last_login_at = datetime.now()
    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e


async def logout_user(
    db_session: AsyncSession,
    user: UserModel.User
) -> bool:
    """用户登出"""
    user.status = UserModel.user_status_enum.offline
    try:
        await db_session.flush()
        await db_session.refresh(user)
        return True
    except Exception as e:
        raise e
