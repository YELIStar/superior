from sqlmodel import Session, select
from models.Friends import Friends
from typing import Optional, Sequence


def crud_add_friend(
    session: Session,
    user_id: int,
    friend_id: int,
    group_id: int,
    remark: str = None
) -> Optional[Friends]:
    """添加好友（检查是否已为好友）"""
    # 检查是否已存在好友关系
    statement = select(Friends).where(
        (Friends.user_id == user_id) & (Friends.friend_id == friend_id)
    )
    if session.exec(statement).first():
        return None

    friend = Friends(
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
) -> Sequence[Friends]:
    """获取用户的好友列表"""
    statement = select(Friends).where(Friends.user_id == user_id)
    return session.exec(statement).all()


def crud_delete_friend(
    session: Session,
    user_id: int,
    friend_id: int
) -> bool:
    """删除好友"""
    friend = session.exec(select(Friends).where(
        (Friends.user_id == user_id) & (Friends.friend_id == friend_id)
    )).first()
    if not friend:
        return False

    session.delete(friend)
    session.commit()
    return True
