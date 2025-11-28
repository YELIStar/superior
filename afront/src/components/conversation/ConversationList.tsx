import React from 'react';
import { List, Empty, Spin } from 'antd';
import ConversationItem from './ConversationItem';
import { Conversation } from '../../types/conversation';

interface ConversationListProps {
    conversations: Conversation[];
    loading?: boolean;
    currentConversationId?: number;
    onSelectConversation?: (conversationId: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    loading = false,
    currentConversationId,
    onSelectConversation
}) => {
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    if (conversations.length === 0) {
        return <Empty description="暂无对话" />;
    }

    return (
        <List
            dataSource={conversations}
            renderItem={(conversation) => (
                <ConversationItem
                    key={conversation.conversation_id}
                    conversation={conversation}
                    isActive={conversation.conversation_id === currentConversationId}
                    onClick={() => onSelectConversation && onSelectConversation(conversation.conversation_id)}
                />
            )}
            className="conversation-list"
        />
    );
};

export default ConversationList;