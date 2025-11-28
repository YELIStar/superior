import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Empty, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchConversations,
    setCurrentConversation,
    clearConversationUnread
} from '../store/slices/chatSlice';
import {
    fetchMessages,
    clearMessages,
    markMessagesRead
} from '../store/slices/messageSlice';
import { createNewConversation } from '../store/slices/chatSlice';
import { getUserDetail } from '../api/user';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ConversationList from '../components/conversation/ConversationList';
import MessageList from '../components/message/MessageList';
import MessageInput from '../components/message/MessageInput';
import EmptyComponent from '../components/common/Empty';
import { ConversationType } from '../types/conversation';

const { Content } = Layout;

const Chat: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const {
        conversations,
        currentConversationId,
        currentConversation,
        isLoading
    } = useAppSelector(state => state.chat);

    const {
        currentConversationMessages,
        isLoading: messageLoading
    } = useAppSelector(state => state.message);

    const { isAuthenticated } = useAppSelector(state => state.user);

    // 未登录则跳转到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 获取对话列表
    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    // 处理URL参数（打开指定好友/群组聊天）
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const friendId = params.get('friend');
        const groupId = params.get('group');

        if (friendId) {
            // 创建或打开与好友的对话
            handleOpenFriendChat(parseInt(friendId));
        } else if (groupId) {
            // 创建或打开群组对话
            handleOpenGroupChat(parseInt(groupId));
        } else if (conversations.length > 0 && !currentConversationId) {
            // 默认打开第一个对话
            dispatch(setCurrentConversation(conversations[0].conversation_id));
        }
    }, [conversations, dispatch]);

    // 获取当前对话的消息
    useEffect(() => {
        if (currentConversationId) {
            dispatch(clearMessages());
            setOffset(0);
            setHasMore(true);
            dispatch(fetchMessages({
                conversationId: currentConversationId,
                offset: 0,
                limit: 20
            }));

            // 标记为已读
            dispatch(markMessagesRead(currentConversationId));
        }
    }, [currentConversationId, dispatch]);

    // 加载更多消息
    const handleLoadMore = () => {
        if (currentConversationId && hasMore) {
            const newOffset = offset + 20;
            dispatch(fetchMessages({
                conversationId: currentConversationId,
                offset: newOffset,
                limit: 20
            })).unwrap().then((response) => {
                setOffset(newOffset);
                // 使用消息响应中的total字段来判断是否还有更多消息
                setHasMore(response.messages.length === 20); // 如果返回的消息数量等于请求数量，可能还有更多
            });
        }
    };

    // 打开与好友的聊天
    const handleOpenFriendChat = async (friendId: number) => {
        // 检查是否已有对话
        const existingConversation = conversations.find(
            conv => conv.type === ConversationType.SINGLE && conv.members.some(m => m.user_id === friendId)
        );

        if (existingConversation) {
            dispatch(setCurrentConversation(existingConversation.conversation_id));
        } else {
            // 创建新对话
            const friend = await getUserDetail(friendId);
            dispatch(createNewConversation({
                type: ConversationType.SINGLE,
                member_ids: [friendId],
                name: friend.username
            })).unwrap().then(conv => {
                dispatch(setCurrentConversation(conv.conversation_id));
            });
        }
    };

    // 打开群组聊天
    const handleOpenGroupChat = (groupId: number) => {
        // 检查是否已有对话
        // 注意：当前的Conversation接口定义中没有related_id字段，所以这里暂时只根据类型筛选
        // 实际项目中可能需要根据groupId查找对应的群聊对话
        const existingConversation = conversations.find(
            conv => conv.type === ConversationType.GROUP
        );

        if (existingConversation) {
            dispatch(setCurrentConversation(existingConversation.conversation_id));
        } else {
            // 创建新对话
            dispatch(createNewConversation({
                type: ConversationType.GROUP,
                member_ids: [] // 这里需要根据实际情况调整，可能需要先获取群组成员
            })).unwrap().then(conv => {
                dispatch(setCurrentConversation(conv.conversation_id));
            });
        }
    };

    // 选择对话
    const handleSelectConversation = (conversationId: number) => {
        dispatch(setCurrentConversation(conversationId));
        dispatch(clearConversationUnread(conversationId));
        window.history.pushState({}, '', '/chat');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <Layout>
                <Header />

                <Content style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
                    {/* 对话列表 */}
                    <div style={{
                        width: collapsed ? 80 : 260,
                        borderRight: '1px solid #e8e8e8',
                        overflow: 'auto'
                    }}>
                        <ConversationList
                            conversations={conversations}
                            loading={isLoading}
                            currentConversationId={currentConversationId || undefined}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>

                    {/* 聊天内容 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {!currentConversationId ? (
                            <EmptyComponent
                                description="请选择一个对话开始聊天"
                                buttonText="创建新对话"
                                buttonIcon={<span>+</span>}
                                onButtonClick={() => navigate('/friends')}
                            />
                        ) : (
                            <>
                                {/* 消息列表 */}
                                <div style={{ flex: 1, overflow: 'auto' }}>
                                    <MessageList
                                        messages={currentConversationMessages}
                                        loading={messageLoading}
                                        onLoadMore={handleLoadMore}
                                        hasMore={hasMore}
                                    />
                                </div>

                                {/* 消息输入 */}
                                <MessageInput
                                    conversationId={currentConversationId}
                                />
                            </>
                        )}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Chat;