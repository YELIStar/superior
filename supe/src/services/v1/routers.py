from fastapi import APIRouter

from services.v1.endpoints.User import Urouter
from services.v1.endpoints.Messages import Mrouter
from services.v1.endpoints.Friends import Frouter

routers: APIRouter = APIRouter()

routers.include_router(router=Urouter, prefix="/user")
routers.include_router(router=Mrouter, prefix="/messages")
routers.include_router(router=Frouter, prefix="/friends")
