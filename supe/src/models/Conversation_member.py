from datetime import datetime
from enum import IntEnum
from sqlmodel import BigInteger, Boolean, SQLModel, Field, SmallInteger, table


class member_role_enum(IntEnum):
    """
    成员身份，0: 成员, 1: 管理员, 2: 群主
    """
    member = 0
    admin = 1
    owner = 2


class member_status_enum(IntEnum):
    """
    成员状态：0-正常，1-禁言
    """
    normal = 0
    muted = 1


class Conversation_member(SQLModel, table=True):
    """
    对话成员
    """
    conversation_member_id: int = Field(
        default=None,
        primary_key=True,
        unique=True,
        sa_type=BigInteger
    )
    conversation_id: int = Field(
        foreign_key="conversations.conversation_id",
        sa_type=BigInteger
    )
    member_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    member_role: member_role_enum = Field(
        sa_type=SmallInteger,
        default=member_role_enum.member
    )
    """用户身份"""
    member_joined_at: datetime = Field(
        default_factory=lambda: datetime.now()
    )
    member_status: member_status_enum = Field(
        sa_type=SmallInteger,
        default=member_status_enum.normal
    )
