from enum import IntEnum
from sqlmodel import BigInteger, DateTime, SQLModel, Field, VARCHAR, SmallInteger
from datetime import datetime


class message_type_enum(IntEnum):
    """
    消息类型枚举，可选值：text, image, voice, video, file
    """
    text = 1
    image = 2
    voice = 3
    video = 4
    file = 5


class Message(SQLModel, table=True):
    """消息表"""
    message_id: int = Field(
        default=None,
        primary_key=True,
        unique=True,
        index=True,
        sa_type=BigInteger
    )

    conversation_id: int = Field(
        foreign_key="conversations.conversation_id",
        sa_type=BigInteger
    )
    sender_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    message_type: message_type_enum = Field(
        default=message_type_enum.text,
        sa_type=SmallInteger
    )
    """消息类型"""
    content: str = Field(
        sa_type=VARCHAR(length=255)
    )
    """消息内容（文本或文本路径）"""
    send_time: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(True)
    )
    """消息发送时间"""
    is_recalled: bool = Field(
        default=False
    )
    """消息是否被撤回"""
    recalled_time: datetime | None = Field(
        default=None,
        sa_type=DateTime(True)
    )
    """消息撤回时间"""
