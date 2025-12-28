from sqlmodel import Session, select
from typing import Optional, Sequence

import models.Friend as ModelFriend


def crud_add_friend(
    session: Session,
    user_id: int,
    friend_id: int,
    group_id: int,
    remark: str = None
) -> Optional[ModelFriend.Friend]:
    """添加好友（检查是否已为好友）"""
    # 检查是否已存在好友关系
    statement = select(ModelFriend.Friend).where(
        (ModelFriend.Friend.user_id == user_id) & (
            ModelFriend.Friend.friend_id == friend_id)
    )
    if session.exec(statement).first():
        return None

    friend = ModelFriend.Friend(
        user_id=user_id,
        friend_id=friend_id,
        group_id=group_id,
        remark=remark
    )
    session.add(friend)
    session.commit()
    session.refresh(friend)
    return friend


def crud_get_user_friends(
    session: Session,
    user_id: int
) -> Sequence[ModelFriend.Friend]:
    """获取用户的好友列表"""
    statement = select(ModelFriend.Friend).where(
        ModelFriend.Friend.user_id == user_id)
    return session.exec(statement).all()


def crud_delete_friend(
    session: Session,
    user_id: int,
    friend_id: int
) -> bool:
    """删除好友"""
    friend = session.exec(select(ModelFriend.Friend).where(
        (ModelFriend.Friend.user_id == user_id) & (
            ModelFriend.Friend.friend_id == friend_id)
    )).first()
    if not friend:
        return False

    session.delete(friend)
    session.commit()
    return True
