from typing import Any, Generator
from sqlalchemy.engine.base import Engine
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.orm import sessionmaker
import pymysql


# DB_URL = "sqlite:///./GUANG.db"
DB_URL = "mysql+pymysql://root:qianshiyouyuan@localhost:3306/superiority"

"""创建数据库引擎"""
engine: Engine = create_engine(
    url=DB_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)

"""定义数据库会话模板"""
SessionLocal = sessionmaker(
    bind = engine,
    class_=Session,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

def create_db() -> None:
    """创建数据库表"""
    from models import User, Usation, Messages, Frieouping, Friends, Conversations, Convembers
    SQLModel.metadata.create_all(bind=engine)

def get_session() -> Generator[Session, Any, None]:
    """获取数据库会话"""
    with SessionLocal() as session:
        yield session

# https://qoder.com/referral?referral_code=Nk2bI10b1iOZ0uaZ90qNZGegdfAVxYAr