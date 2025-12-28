from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from services.v1.routers import routers
from dependencies.database import async_engine
from utils.path_util import run_in_target_dir

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all) # 每次启动时删除所有表（仅用于开发环境）
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


app: FastAPI = FastAPI(
    title="CITODE",
    version="0.1.0",
    default_response_class=UJSONResponse,
    lifespan=lifespan
)


# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5173"],  # 允许前端域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)


app.include_router(router=routers, prefix="/api")


@run_in_target_dir()
def main():
    import uvicorn
    uvicorn.run(
        app="main:app",
        host="127.0.0.1",
        port=5055,
        reload=True,
        reload_dirs=["src"],
        log_level="debug"
    )


if __name__ == "__main__":
    main()
