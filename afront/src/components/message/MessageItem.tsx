import React from 'react';
import { Avatar, Typography, Space, message, Popconfirm } from 'antd';
import {
    DeleteOutlined,
    UndoOutlined,
    FileImageOutlined,
    FileOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { Message, MessageType } from '../../types/message';
import { useAppDispatch, useAppSelector } from '../../store';
import { recallMessageById } from '../../store/slices/messageSlice';
import { formatMessageTime, formatFileSize } from '../../utils/format';
import { downloadFile } from '../../utils/common';

const { Text, Paragraph } = Typography;

interface MessageItemProps {
    message: Message;
    onRecall?: (messageId: number) => void;
    onDelete?: (messageId: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onRecall, onDelete }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.user);
    const isOwn = message.sender_id === user?.user_id;
    const canRecall = isOwn && !message.is_recalled &&
        Date.now() - new Date(message.send_time).getTime() < 5 * 60 * 1000; // 5分钟内可撤回

    // 撤回消息
    const handleRecall = async () => {
        try {
            await dispatch(recallMessageById({
                messageId: message.message_id,
                conversationId: message.conversation_id
            })).unwrap();
            // message.success('消息已撤回');
            if (onRecall) onRecall(message.message_id);
        } catch (error: any) {
            // message.error(error.message || '撤回失败');
        }
    };

    // 渲染消息内容
    const renderContent = () => {
        if (message.is_recalled) {
            return (
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                    消息已撤回
                </Text>
            );
        }

        switch (message.type) {
            case MessageType.IMAGE:
                return (
                    <div style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}>
                        <img
                            src={message.content}
                            alt="图片消息"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onClick={() => window.open(message.content, '_blank')}
                        />
                    </div>
                );

            case MessageType.FILE:
                const fileInfo = JSON.parse(message.content);
                return (
                    <div
                        style={{
                            background: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: 300,
                            cursor: 'pointer'
                        }}
                        onClick={() => downloadFile(fileInfo.url, fileInfo.name)}
                    >
                        <FileOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <Text ellipsis>{fileInfo.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {formatFileSize(fileInfo.size)}
                            </Text>
                        </div>
                    </div>
                );

            case MessageType.SYSTEM:
                return (
                    <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                        {message.content}
                    </Text>
                );

            default:
                return <Paragraph style={{ margin: 0 }}>{message.content}</Paragraph>;
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
            marginBottom: 12,
            padding: '0 8px'
        }}>
            {!isOwn && (
                <Avatar
                    src={message.sender?.avatar}
                    style={{ marginRight: 8, alignSelf: 'flex-start' }}
                />
            )}

            <div style={{ maxWidth: '70%' }}>
                {!isOwn && (
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                        {message.sender?.username}
                    </Text>
                )}

                <Space
                    direction="horizontal"
                    style={{
                        background: isOwn ? '#1890ff' : '#f5f5f5',
                        color: isOwn ? 'white' : 'inherit',
                        borderRadius: isOwn ? '10px 0 10px 10px' : '0 10px 10px 10px',
                        padding: '8px 12px',
                        position: 'relative'
                    }}
                >
                    {renderContent()}

                    {/* 消息操作菜单 */}
                    {isOwn && (
                        <div style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            display: 'none',
                            zIndex: 1
                        }}
                            className="message-actions"
                            onMouseEnter={(e) => e.currentTarget.style.display = 'block'}
                            onMouseLeave={(e) => e.currentTarget.style.display = 'none'}
                        >
                            <Space>
                                {canRecall && (
                                    <Popconfirm
                                        title="确定撤回这条消息吗？"
                                        onConfirm={handleRecall}
                                        okText="是"
                                        cancelText="否"
                                    >
                                        <UndoOutlined
                                            style={{ fontSize: 12, cursor: 'pointer', color: '#999' }}
                                        />
                                    </Popconfirm>
                                )}

                                <Popconfirm
                                    title="确定删除这条消息吗？"
                                    onConfirm={() => onDelete && onDelete(message.message_id)}
                                    okText="是"
                                    cancelText="否"
                                >
                                    <DeleteOutlined
                                        style={{ fontSize: 12, cursor: 'pointer', color: '#999' }}
                                    />
                                </Popconfirm>
                            </Space>
                        </div>
                    )}
                </Space>

                <Text
                    type="secondary"
                    style={{
                        fontSize: 12,
                        display: 'block',
                        textAlign: isOwn ? 'right' : 'left',
                        marginTop: 4
                    }}
                >
                    {formatMessageTime(message.send_time)}
                </Text>
            </div>

            {isOwn && (
                <Avatar
                    src={user?.avatar}
                    style={{ marginLeft: 8, alignSelf: 'flex-start' }}
                />
            )}
        </div>
    );
};

export default MessageItem;