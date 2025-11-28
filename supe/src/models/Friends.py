from datetime import datetime
from sqlmodel import SMALLINT, VARCHAR, BigInteger, Field, ForeignKey, SQLModel, SmallInteger
from typing import Optional

# Friends list
class Friends(SQLModel, table=True):
    id: int = Field(
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
    created_at: datetime = Field(
        default_factory=lambda: datetime.now()
    )
