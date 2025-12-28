from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import aiomysql


ASYNC_DATABASE_URL = "mysql+aiomysql://root:qianshiyouyuan@localhost:3306/superiority"


async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)
"""异步数据库引擎"""


AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)
"""异步数据库会话模板"""


async def get_async_db_session() -> AsyncGenerator[AsyncSession, None]:
    """获取异步数据库会话"""
    async with AsyncSessionLocal() as session:
        async with session.begin():
            yield session
        