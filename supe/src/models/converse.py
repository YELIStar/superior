from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum, StrEnum
import json


class ConversationType(StrEnum):
    """会话类型枚举"""
    PRIVATE = "private"      # 私聊
    GROUP = "group"          # 群聊
    CHANNEL = "channel"      # 频道/广播
    SUPPORT = "support"      # 客服支持


class ConversationStatus(StrEnum):
    """会话状态"""
    ACTIVE = "active"        # 活跃
    INACTIVE = "inactive"    # 不活跃
    ARCHIVED = "archived"    # 归档
    BLOCKED = "blocked"      # 被封禁


class ConversationBase(SQLModel):
    """会话基础信息"""
    # 基本字段
    title: Optional[str] = Field(
        default=None,
        description="会话标题，群聊时为群名称，私聊时可选"
    )
    description: Optional[str] = Field(
        default=None, 
        description="会话描述/群公告"
        )

    # 类型与状态
    conversation_type: ConversationType = Field(
        default=ConversationType.PRIVATE,
        description="会话类型"
    )
    status: ConversationStatus = Field(
        default=ConversationStatus.ACTIVE,
        description="会话状态"
    )

    # 头像与封面
    avatar_url: Optional[str] = Field(default=None, description="头像URL")
    cover_url: Optional[str] = Field(default=None, description="封面图片URL")

    # 元数据
    metadata: Optional[str] = Field(
        default=None,
        description="JSON格式的额外信息，如主题、标签等"
    )

    # 设置
    is_public: bool = Field(default=False, description="是否公开会话")
    is_discoverable: bool = Field(default=True, description="是否可被搜索发现")
    allow_invites: bool = Field(default=True, description="是否允许邀请新成员")
    require_approval: bool = Field(default=False, description="加入是否需要批准")

    # 消息设置
    allow_media: bool = Field(default=True, description="是否允许发送媒体文件")
    allow_polls: bool = Field(default=True, description="是否允许发起投票")
    allow_events: bool = Field(default=True, description="是否允许创建活动")
    allow_calls: bool = Field(default=True, description="是否允许发起语音/视频通话")

    # 统计字段（可定期更新）
    message_count: int = Field(default=0, description="消息总数")
    last_message_id: Optional[int] = Field(
        default=None, description="最后一条消息ID")
    last_message_at: Optional[datetime] = Field(
        default=None, description="最后消息时间")


class Conversation(ConversationBase, table=True):
    """会话主表"""
    id: Optional[int] = Field(default=None, primary_key=True)

    # 关系字段
    creator_id: Optional[int] = Field(
        default=None,
        foreign_key="user.id",
        description="创建者ID"
    )
    created_by: Optional["User"] = Relationship(
        back_populates="created_conversations")

    # 时间戳
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
    archived_at: Optional[datetime] = Field(default=None, description="归档时间")

    # 关联关系（反向引用）
    members: List["ConversationMember"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    pinned_messages: List["PinnedMessage"] = Relationship(
        back_populates="conversation"
    )

    # 索引
    __table_args__ = (
        # 复合索引：按类型和时间排序
        Index("idx_conversation_type_status", "conversation_type", "status"),
        Index("idx_last_message_at", "last_message_at"),
        Index("idx_creator", "creator_id"),
        Index("idx_updated_at", "updated_at"),

        # 部分索引：活跃会话
        Index(
            "idx_active_conversations",
            "status",
            "last_message_at",
            postgresql_where=(status == ConversationStatus.ACTIVE)
        ),
    )

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        """获取解析后的metadata"""
        return json.loads(self.metadata) if self.metadata else {}

    @metadata_dict.setter
    def metadata_dict(self, value: Dict[str, Any]):
        """设置metadata"""
        self.metadata = json.dumps(value) if value else None

# from sqlmodel import SQLModel, Field, Enum, Column, String
# from typing import Optional, List
# from datetime import datetime
# import enum


# class ConversationType(str, enum.Enum):
#     PRIVATE = "private"
#     GROUP = "group"


# class ConversationBase(SQLModel):
#     name: str | None
#     """群聊必填"""
#     avatar_url: str | None
#     """群聊头像"""
#     description: str | None
#     """群聊描述"""

#     # 关键字段：区分类型
#     conversation_type: ConversationType = Field(
#         sa_column=Column(String(20), nullable=False),
#         description="会话类型"
#     )

#     # 群聊专有字段
#     max_members: Optional[int] = Field(default=200, nullable=True)  # 群聊最大人数
#     announcement: Optional[str] = None  # 群公告
#     can_member_invite: bool = Field(default=True)  # 是否允许成员邀请


# class Conversation(ConversationBase, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)

#     # 群聊相关字段
#     creator_id: Optional[int] = Field(
#         default=None,
#         foreign_key="user.id",
#         nullable=True  # 私聊时可为空
#     )

#     # 私聊优化字段
#     is_active: bool = Field(default=True)  # 私聊是否有效（一方删除则无效）
#     private_user1_id: Optional[int] = Field(
#         default=None,
#         foreign_key="user.id"
#     )
#     private_user2_id: Optional[int] = Field(
#         default=None,
#         foreign_key="user.id"
#     )

#     created_at: datetime = Field(default_factory=lambda: datetime.now())
#     updated_at: Optional[datetime] = Field(
#         default_factory=lambda: datetime.now(),
#         sa_column_kwargs={"onupdate": lambda: datetime.now()}
#     )

#     # 建立唯一约束：确保私聊唯一性
#     __table_args__ = (
#         # 私聊唯一性约束：同一对用户只能有一个私聊
#         sa.UniqueConstraint('private_user1_id', 'private_user2_id',
#                             name='unique_private_chat'),

#         # 检查约束：私聊时必须有 user1 和 user2
#         sa.CheckConstraint(
#             """
#             (conversation_type = 'private' AND private_user1_id IS NOT NULL
#              AND private_user2_id IS NOT NULL)
#             OR
#             (conversation_type = 'group')
#             """,
#             name='check_private_chat_users'
#         ),

#         # 群聊时必须有创建者
#         sa.CheckConstraint(
#             """
#             (conversation_type = 'group' AND creator_id IS NOT NULL)
#             OR
#             (conversation_type = 'private')
#             """,
#             name='check_group_creator'
#         )
#     )
