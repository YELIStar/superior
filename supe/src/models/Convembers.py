from datetime import datetime
from sqlmodel import BigInteger, Boolean, SQLModel, Field, SmallInteger, table

# Members of conversation
class Convembers(SQLModel, table=True):
    id: int = Field(
        primary_key=True,
        sa_type=BigInteger
    )
    conversation_id: int = Field(
        foreign_key="conversations.conversation_id",
        sa_type=BigInteger
    )
    user_id: int = Field(
        foreign_key="user.user_id",
        sa_type=BigInteger
    )
    user_role: int =Field(
        sa_type=SmallInteger,
        default=0
    )
    user_joined_at: datetime = Field(
        default_factory=lambda: datetime.now()
    )
    user_last_read_id: int = Field(
        sa_type=BigInteger
    )
    user_is_muted: bool = Field(
        sa_type=Boolean,
        default=False
    )
