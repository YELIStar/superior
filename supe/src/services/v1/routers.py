from fastapi import APIRouter

from services.v1.endpoints.User import User_router
from services.v1.endpoints.Message import Message_router
from services.v1.endpoints.Friend import Friend_router

routers: APIRouter = APIRouter()

routers.include_router(router=User_router, prefix="/user")
routers.include_router(router=Message_router, prefix="/messages")
routers.include_router(router=Friend_router, prefix="/friends")
