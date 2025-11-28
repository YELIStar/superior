import React from 'react';
import { List, Avatar, Typography, Badge } from 'antd';
import { Conversation, ConversationType } from '../../types/conversation';
import { formatRelativeTime, truncateText } from '../../utils/format';
import { useAppSelector } from '../../store';
import '../../assets/ConversationItem.css';

const { Text, Title } = Typography;

interface ConversationItemProps {
    conversation: Conversation;
    isActive?: boolean;
    onClick?: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isActive = false,
    onClick
}) => {
    const { user } = useAppSelector(state => state.user);

    // 获取对话名称和头像
    const getConversationInfo = () => {
        if (conversation.type === ConversationType.SINGLE) {
            // 单聊
            const otherMember = conversation.members.find(m => m.user_id !== user?.user_id);
            return {
                name: otherMember?.username || '未知联系人',
                avatar: otherMember?.avatar,
                subtitle: otherMember?.username
            };
        } else {
            // 群聊
            return {
                name: conversation.name || '群聊',
                avatar: conversation.avatar,
                subtitle: `${conversation.members.length} 人`
            };
        }
    };

    const { name, avatar, subtitle } = getConversationInfo();

    return (
        <List.Item
            onClick={onClick}
            className={`conversationItem ${isActive ? 'active' : ''}`}
        >
            <Badge dot={conversation.unread_count > 0}>
                <List.Item.Meta
                    avatar={
                        <Avatar
                            src={avatar}
                            style={{ backgroundColor: '#f56a00' }}
                        >
                            {name.charAt(0)}
                        </Avatar>
                    }
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Title level={5} style={{ margin: 0 }}>{name}</Title>
                            {conversation.last_message?.send_time && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatRelativeTime(conversation.last_message.send_time)}
                                </Text>
                            )}
                        </div>
                    }
                    description={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" ellipsis style={{ maxWidth: 180 }}>
                                {conversation.last_message
                                    ? truncateText(conversation.last_message.content, 20)
                                    : '暂无消息'}
                            </Text>

                            {conversation.unread_count > 0 && (
                                <Badge count={conversation.unread_count} size="small" />
                            )}
                        </div>
                    }
                />
            </Badge>
        </List.Item>
    );
};

export default ConversationItem;