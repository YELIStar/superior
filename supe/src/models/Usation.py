from typing import Optional
from sqlmodel import BigInteger, Boolean, Relationship, SQLModel, Field

from models import User

"""
which conversations is being shown to the user
"""
class Usation(SQLModel, table=True):
    usation_id: int = Field(
        default=None,
        primary_key=True,
        sa_type=BigInteger
    )
    user_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    conversation_id: int = Field(
        foreign_key="conversations.conversation_id",
        sa_type=BigInteger
    )