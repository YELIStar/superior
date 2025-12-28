from datetime import datetime
from sqlmodel import SMALLINT, VARCHAR, BigInteger, DateTime, Field, ForeignKey, SQLModel, SmallInteger
from typing import Optional


class Friend(SQLModel, table=True):
    """
    好友列表
    """
    user_friend_id: int = Field(
        default=None,
        primary_key=True,
        unique=True,
        sa_type=BigInteger
    )
    user_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    friend_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    remark: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=255)
    )
    group_id: int = Field(
        foreign_key="frieouping.group_id",
        sa_type=BigInteger
    )
    associate_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(True)
    )
