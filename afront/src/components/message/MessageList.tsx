import React, { useEffect, useRef } from 'react';
import { List, Spin, Empty } from 'antd';
import MessageItem from './MessageItem';
import { Message } from '../../types/message';

interface MessageListProps {
    messages: Message[];
    loading?: boolean;
    onRecall?: (messageId: number) => void;
    onDelete?: (messageId: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    loading = false,
    onRecall,
    onDelete,
    onLoadMore,
    hasMore = false
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // 自动滚动到底部
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (loading && messages.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    if (!loading && messages.length === 0) {
        return <Empty description="暂无消息" />;
    }

    return (
        <div style={{
            height: '100%',
            overflow: 'auto',
            padding: '16px',
            background: '#fafafa'
        }}>
            {/* 加载更多按钮 */}
            {hasMore && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <button
                        onClick={onLoadMore}
                        style={{
                            background: 'none',
                            border: '1px solid #1890ff',
                            color: '#1890ff',
                            padding: '4px 16px',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                    >
                        加载更多
                    </button>
                </div>
            )}

            {/* 消息列表 */}
            <List
                dataSource={messages}
                renderItem={(message) => (
                    <MessageItem
                        key={message.message_id}
                        message={message}
                        onRecall={onRecall}
                        onDelete={onDelete}
                    />
                )}
            />

            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;