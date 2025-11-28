from datetime import datetime
from token import OP
from typing import Optional
from sqlmodel import VARCHAR, BigInteger, SQLModel, Field, SmallInteger, table

# Conversations information
class Conversations(SQLModel, table=True):
    conversation_id: int = Field(
        primary_key=True,
        sa_type=BigInteger
    )
    title: str = Field(
        sa_type=VARCHAR(50)
    )
    avator: str = Field(
        sa_type=VARCHAR(255)
    )
    type: int = Field(
        default=0,
        sa_type=SmallInteger
    )
    creator_id: int | None = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    create_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=VARCHAR(255)
    )
    last_message_id: int | None = Field(
        foreign_key="messages.message_id",
        sa_type=BigInteger
    )
    last_message_at: datetime | None = Field(
        default=None
    )
