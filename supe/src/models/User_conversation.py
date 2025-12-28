from enum import IntEnum
from datetime import datetime

from sqlmodel import BigInteger, DateTime, SQLModel, Field, SmallInteger


class conversation_type_enum(IntEnum):
    """
    会话类型：1-私聊，2-群聊
    """
    private = 1
    group = 2


class conversation_status_enum(IntEnum):
    """
    会话状态：0-未读，1-正常，2-隐藏，3-删除，4-置顶，5-免打扰
    """
    unread = 0
    normal = 1
    hidden = 2
    deleted = 3
    pinned = 4
    do_not_disturb = 5


class User_conversation(SQLModel, table=True):
    user_conversations_id: int = Field(
        default=None,
        primary_key=True,
        index=True,
        unique=True,
        sa_type=BigInteger
    )

    user_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )

    conversation_id: int = Field(
        foreign_key="conversation.conversation_id",
        sa_type=BigInteger
    )

    conversation_type: conversation_type_enum = Field(
        default=conversation_type_enum.private,
        sa_type=SmallInteger
    )
    """会话类型"""

    conversation_status: conversation_status_enum = Field(
        default=conversation_status_enum.normal,
        sa_type=SmallInteger
    )
    """会话状态"""

    last_message_at: datetime = Field(
        foreign_key="conversations.last_message",
        sa_type=DateTime(True)
    )
