from datetime import datetime
from enum import IntEnum
from sqlmodel import VARCHAR, BigInteger, DateTime, SQLModel, Field, SmallInteger


class status_type_enum(IntEnum):
    active = 1
    inactive = 2


class Conversation(SQLModel, table=True):
    """会话信息"""
    conversation_id: int = Field(
        default=None,
        primary_key=True,
        sa_type=BigInteger
    )
    title: str = Field(
        sa_type=VARCHAR(50)
    )
    avator_url: str | None = Field(
        default=None,
        sa_type=VARCHAR(255)
    )
    conversation_type: status_type_enum = Field(
        default=status_type_enum.active,
        sa_type=SmallInteger
    )
    """会话类型"""
    group_master_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    create_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=VARCHAR(255)
    )
    last_message_id: int | None = Field(
        default=None,
        foreign_key="messages.message_id",
        sa_type=BigInteger
    )
    last_message_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(True)
    )
