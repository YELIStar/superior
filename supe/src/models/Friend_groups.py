from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Mapped
from sqlmodel import VARCHAR, BigInteger, Field, Relationship, SQLModel

from models import User


class Friend_group(SQLModel, table=True):
    """
    好友分组
    """
    group_id: int = Field(
        default=None,
        unique=True,
        primary_key=True,
        sa_type=BigInteger
    )
    user_id: int = Field(
        sa_type=BigInteger,
        foreign_key="user.user_id"
    )
    group_name: str = Field(
        sa_type=VARCHAR(length=255)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(),
    )
