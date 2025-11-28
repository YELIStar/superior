from sqlmodel import Session, select
from models.Messages import Messages
from datetime import datetime
from typing import Optional, Sequence


def crud_create_message(
    session: Session,
    conversation_id: int,
    sender_id: int,
    content: str
) -> Messages:
    """创建新消息"""
    message = Messages(
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
) -> Sequence[Messages]:
    """获取对话中的消息列表（分页）"""
    statement = select(Messages).where(
        Messages.conversation_id == conversation_id
    ).offset(offset).limit(limit).order_by(Messages.send_time)
    return session.exec(statement).all()


def crud_recall_message(
    session: Session,
    message_id: int,
    sender_id: int  # 验证消息所有者
) -> Optional[Messages]:
    """撤回消息（仅发送者可操作）"""
    message = session.get(Messages, message_id)
    if not message or message.sender_id != sender_id:
        return None

    message.is_recalled = True
    message.recalled_time = datetime.now()
    session.commit()
    session.refresh(message)
    return message
