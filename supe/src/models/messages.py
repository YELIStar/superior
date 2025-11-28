from sqlmodel import BigInteger, Boolean, SQLModel, Field, VARCHAR
from datetime import datetime

class Messages(SQLModel, table=True):
    message_id: int = Field(
        default=None,
        primary_key=True
    )
    conversation_id: int = Field(
        foreign_key="conversations.conversation_id",
        sa_type=BigInteger
    )
    sender_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    content: str = Field(
        sa_type=VARCHAR(length=255)
    )
    send_time: datetime = Field(
        default=datetime.now()
    )
    is_recalled: bool = Field(
        default=False,
        sa_type=Boolean
    )
    recalled_time: datetime | None
