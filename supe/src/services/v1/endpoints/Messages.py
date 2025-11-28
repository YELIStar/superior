from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from core.database import get_session
from models.Messages import Messages
from crud.Messages import (
    crud_create_message,
    crud_get_messages_by_conversation,
    crud_recall_message
)
from dependencies.auth import get_current_user
from models.User import User

Mrouter: APIRouter = APIRouter(tags=["Messages"])


@Mrouter.post("/", response_model=Messages)
def send_message(
    conversation_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """发送消息"""
    if not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="消息内容不能为空"
        )
    return crud_create_message(
        session=db,
        conversation_id=conversation_id,
        sender_id=current_user.user_id,
        content=content
    )


@Mrouter.get("/conversation/{conversation_id}", response_model=List[Messages])
def get_conversation_messages(
    conversation_id: int,
    offset: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """获取对话消息列表"""
    return crud_get_messages_by_conversation(
        session=db,
        conversation_id=conversation_id,
        offset=offset,
        limit=limit
    )


@Mrouter.patch("/{message_id}/recall")
def recall_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """撤回消息"""
    message = crud_recall_message(
        session=db,
        message_id=message_id,
        sender_id=current_user.user_id
    )
    if not message:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无法撤回消息（无权限或消息不存在）"
        )
    return {"message": "消息已撤回"}
