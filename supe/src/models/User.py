# from __future__ import annotations
from datetime import datetime
from sqlmodel import VARCHAR, BigInteger, Field, Relationship, SQLModel, SmallInteger, DateTime

from utils.RandString import random_string

# User profile
class User(SQLModel, table=True):
    user_id: int = Field(
        default=None,
        index=True,
        primary_key=True,
        unique=True,
        sa_type=BigInteger
    )
    phone: str = Field(
        unique=True,
        sa_type=VARCHAR(length=20)
    )
    password_hash: str = Field(
        sa_type=VARCHAR(length=255)
    ) # 加密后的密码（bcrypt/MD5 + 盐值）
    status: int = Field(
        default=1, # 1: online, 0: offline
        sa_type=SmallInteger
    )
    username: str = Field(
        default_factory=lambda: random_string(10),
        unique=True,
        sa_type=VARCHAR(length=50)
    )
    avatar: str | None = Field(
        default=None,
        sa_type=VARCHAR(length=255)
    )
    email: str | None = Field(
        default=None,
        unique=True,
        sa_type=VARCHAR(length=100)
    )
    last_login: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(timezone=True)
    )
    create_at: datetime = Field(
        default_factory=lambda: datetime.now(),
        sa_type=DateTime(timezone=True)
    )
    # frieouping_foreign: Mapped[list["Frieouping"]] = Relationship(back_populates="user_foreign")

# User request model
class UserCreate(SQLModel):
    phone: str
    password_hash: str

# User update model
class UserUpdate(SQLModel):
    phone: str
    password_hash: str
    username: str
    avatar: str | None = Field(default=None)
    email: str | None = Field(default=None)
    status: int = Field(default=1)

# User register model
class UserRegister(SQLModel):
    phone: str
    password: str
    username: str | None = None
    email: str | None = None

# Password reset model
class PasswordReset(SQLModel):
    token: str
    new_password: str

# User response model
class UserResponse(SQLModel):
    phone: str
    username: str
    avatar: str | None
    email: str | None
    status: int
