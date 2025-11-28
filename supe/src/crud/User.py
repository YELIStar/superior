from sqlmodel import Session, select
from models.User import User, UserCreate, UserUpdate, UserResponse, UserRegister
from datetime import datetime
from typing import Optional, Sequence

from core.security import get_password_hash


# 1. 新增：通过ID查询用户（核心功能，用于基于ID的操作）
def crud_get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    """通过用户ID查询用户详情"""
    return session.get(User, user_id)


def crud_get_user_by_phone(session: Session, phone: str) -> Optional[User]:
    """通过手机号查询用户详情"""
    return session.exec(select(User).where(User.phone == phone)).first()

# 2. 新增：查询所有用户（支持分页）


def crud_get_all_users(
    session: Session,
    offset: int = 0,
    limit: int = 100
) -> Sequence[User]:
    """获取用户列表，支持分页（默认返回前100条）"""
    statement = select(User).offset(offset).limit(limit)
    return session.exec(statement).all()


# 3. 完善：创建用户（补充返回类型注解，保持原有逻辑）
def crud_create_user(session: Session, user_create: UserCreate) -> Optional[User]:
    """创建新用户，手机号已存在则返回None"""
    # 检查手机号是否已注册
    existing_user = crud_get_user_by_phone(session, user_create.phone)
    if existing_user:
        return None

    try:
        # 转换为数据库模型并保存
        user = User.model_validate(user_create)
        session.add(user)
        session.commit()
        session.refresh(user)  # 刷新获取自增ID等数据库生成的字段
        return user
    except Exception as e:
        session.rollback()  # 出错时回滚
        print(f"创建用户失败: {e}")
        return None


# 4. 完善：更新用户（处理手机号唯一约束）
def crud_update_user(
    session: Session,
    user_id: int,
    user_update: UserUpdate
) -> Optional[User]:
    """更新用户信息，处理手机号唯一约束"""
    user = crud_get_user_by_id(session, user_id)
    if not user:
        return None  # 用户不存在

    update_data = user_update.model_dump(exclude_unset=True)  # 只更新传入的字段

    # 若更新手机号，需检查新手机号是否被其他用户占用
    if "phone" in update_data:
        new_phone = update_data["phone"]
        # 查询新手机号对应的用户（排除当前用户）
        existing_user = crud_get_user_by_phone(session, new_phone)
        if existing_user and existing_user.user_id != user_id:
            return None  # 新手机号已被占用

    # 执行字段更新
    for key, value in update_data.items():
        setattr(user, key, value)

    try:
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        print(f"更新用户失败: {e}")
        return None


# 5. 完善：删除用户（返回布尔值明确结果）
def crud_delete_user(session: Session, user_id: int) -> bool:
    """删除用户，返回删除是否成功"""
    user = crud_get_user_by_id(session, user_id)
    if not user:
        return False  # 用户不存在

    try:
        session.delete(user)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"删除用户失败: {e}")
        return False


# 6. 完善：用户登录状态更新（补充登录逻辑）
def crud_login_user(session: Session, user_id: int) -> Optional[User]:
    """用户登录时更新状态为在线，并记录登录时间"""
    user = crud_get_user_by_id(session, user_id)
    if not user:
        return None

    user.status = 1  # 1表示在线
    user.last_login = datetime.now()  # 更新登录时间

    try:
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        print(f"更新登录状态失败: {e}")
        return None


# 7. 保留：用户登出（微调逻辑注释）
def crud_logout_user(session: Session, user_id: int) -> Optional[User]:
    """用户登出时更新状态为离线"""
    user = crud_get_user_by_id(session, user_id)
    if not user:
        return None

    user.status = 0  # 0表示离线
    # 注意：last_login通常记录登录时间，登出时可不更新，此处保留原逻辑
    user.last_login = datetime.now()

    try:
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        print(f"更新登出状态失败: {e}")
        return None


# 新增：用户注册函数
def crud_register_user(session: Session, user_register: UserRegister) -> Optional[User]:
    """用户注册"""
    # 检查手机号是否已注册
    existing_user = crud_get_user_by_phone(session, user_register.phone)
    if existing_user:
        return None

    try:
        # 转换为数据库模型并保存
        user_data = user_register.model_dump()
        password = user_data.pop('password')  # 提取明文密码
        user_data['password_hash'] = get_password_hash(password)  # 加密密码
        
        # 如果没有提供 username，则使用随机生成的
        if not user_data.get('username'):
            user_data['username'] = random_string(10)

        user = User(**user_data)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        print(f"创建用户失败: {e}")
        return None


# 新增：通过用户名查询用户
def crud_get_user_by_username(session: Session, username: str) -> Optional[User]:
    """通过用户名查询用户详情"""
    return session.exec(select(User).where(User.username == username)).first()


# 新增：请求密码重置
def crud_request_password_reset(session: Session, email: str, token: str) -> bool:
    """请求密码重置"""
    # 在实际应用中，这里会存储重置令牌到数据库并设置过期时间
    # 简化处理，只返回True表示成功
    return True


# 新增：重置密码
def crud_reset_password(session: Session, token: str, new_password: str) -> bool:
    """通过令牌重置密码"""
    # 在实际应用中，这里会验证令牌并更新密码
    # 简化处理，只返回True表示成功
    return True
