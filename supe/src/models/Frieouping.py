from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Mapped
from sqlmodel import VARCHAR, BigInteger, Field, Relationship, SQLModel

from models import User

# Friends grouping
class Frieouping(SQLModel, table=True):
    group_id: int = Field(
        default=None,
        unique=True,
        primary_key=True,
        sa_type=BigInteger
    )
    group_name: str = Field(
        sa_type=VARCHAR(length=255)
    )
    user_id: int = Field(
        sa_type=BigInteger,
        foreign_key="user.user_id"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(),
    )

    # friends_foreign: Mapped[list["Friends"]] = Relationship(back_populates="frieouping_foreign")
    # user_foreign: Mapped[User] = Relationship(back_populates="frieouping_foreign")
