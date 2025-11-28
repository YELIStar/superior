from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from core.database import get_session
from models.Friends import Friends
from crud.Friends import (
    crud_add_friend,
    crud_get_user_friends,
    crud_delete_friend
)
from dependencies.auth import get_current_user
from models.User import User

Frouter: APIRouter = APIRouter(tags=["Friends"])


@Frouter.post("/", response_model=Friends)
def add_friend(
    friend_id: int,
    group_id: int,
    remark: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """添加好友"""
    if current_user.user_id == friend_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能添加自己为好友"
        )

    friend = crud_add_friend(
        session=db,
        user_id=current_user.user_id,
        friend_id=friend_id,
        group_id=group_id,
        remark=remark
    )
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已添加该好友"
        )
    return friend


@Frouter.get("/", response_model=List[Friends])
def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """获取好友列表"""
    return crud_get_user_friends(session=db, user_id=current_user.user_id)


@Frouter.delete("/{friend_id}")
def delete_friend(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """删除好友"""
    success = crud_delete_friend(
        session=db,
        user_id=current_user.user_id,
        friend_id=friend_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="好友关系不存在"
        )
    return {"message": "好友已删除"}
