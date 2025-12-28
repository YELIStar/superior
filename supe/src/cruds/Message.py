from datetime import datetime
from typing import Optional, Sequence

from sqlmodel import Session, select

import models.Message as ModelMessage


def crud_create_message(
    session: Session,
    conversation_id: int,
    sender_id: int,
    content: str
) -> ModelMessage.Message:
    """创建新消息"""
    message = ModelMessage.Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        send_time=datetime.now()
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def crud_get_messages_by_conversation(
    session: Session,
    conversation_id: int,
    offset: int = 0,
    limit: int = 100
) -> Sequence[ModelMessage.Message]:
    """获取对话中的消息列表（分页）"""
    statement = select(ModelMessage.Message).where(
        ModelMessage.Message.conversation_id == conversation_id
    ).offset(offset).limit(limit).order_by(ModelMessage.Message.send_time)
    return session.exec(statement).all()


def crud_recall_message(
    session: Session,
    message_id: int,
    sender_id: int  # 验证消息所有者
) -> Optional[ModelMessage.Message]:
    """撤回消息（仅发送者可操作）"""
    message = session.get(ModelMessage.Message, message_id)
    if not message or message.sender_id != sender_id:
        return None

    message.is_recalled = True
    message.recalled_time = datetime.now()
    session.commit()
    session.refresh(message)
    return message
