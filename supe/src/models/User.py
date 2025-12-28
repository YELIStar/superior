from datetime import datetime
from enum import IntEnum

from sqlmodel import VARCHAR, BigInteger, Field, SQLModel, SmallInteger, DateTime, CHAR


class user_status_enum(IntEnum):
    """
    用户状态：0-离线，1-在线，2-忙碌，3-勿扰
    """
    offline = 0
    online = 1
    busy = 2
    do_not_disturb = 3

class gender_enum(IntEnum):
    """
    性别：0-未知，1-男，2-女
    """
    unknown = 0
    male = 1
    female = 2


class User(SQLModel, table=True):
    """用户信息表
    必填字段:
        电话号、密码哈希值、昵称、最后登录IP
    默认字段:
        用户状态、最后登录时间、创建时间、删除时间（软删除）
    选填字段:
        邮箱、性别、生日、签名、头像URL、省份、城市
    """
    user_id: int = Field(
        default=None,
        index=True,
        primary_key=True,
        unique=True,
        sa_type=BigInteger
    )

    phone: str = Field(
        unique=True,
        max_length=11,
        sa_type=VARCHAR(length=11)
    )
    
    password_hash: str = Field(
        sa_type=CHAR(length=60)
    )
    """bcrypt 哈希后的密码，长度固定为 60 字符"""
    
    user_status: user_status_enum = Field(
        default=user_status_enum.online,
        sa_type=SmallInteger
    )
    
    email: str | None = Field(
        default=None,
        unique=True,
        max_length=64,
        sa_type=VARCHAR(length=64)
    )
    
    gender: gender_enum = Field(
        default=gender_enum.unknown,
        sa_type=SmallInteger
    )
    
    birthday: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True)
    )
    
    nickname: str = Field(
        unique=True,
        max_length=32,
        sa_type=VARCHAR(length=32)
    )
    
    signature: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=255)
    )
    
    avatar_url: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=255)
    )
    
    province: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=32)
    )
    
    city: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=32)
    )
    
    last_login_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(timezone=True)
    )
    
    last_login_ip: str = Field(
        sa_type=VARCHAR(length=45)
    )
    
    create_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(timezone=True)
    )
    
    delete_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True)
    )
    """软删除时间，若为 None 则表示未删除"""
    
    model_config = {
        "extra": "ignore"
    } # type: ignore
