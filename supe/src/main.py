# src/main.py（修改后）
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse

from services.v1.routers import routers
from core.database import create_db
from supe.src.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()  # 初始化日志
    create_db()  # 启动时创建数据库表
    yield

app: FastAPI = FastAPI(
    title="COT",
    version="0.1.0",
    default_response_class=UJSONResponse,
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许前端域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)

app.include_router(router=routers, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app="main:app",
        host="127.0.0.1",
        port=5055,
        reload=True,
        reload_dirs=["src"],
        log_level="debug"
    )
