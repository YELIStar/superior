import React, { useEffect, useState } from 'react';
import { Layout, List, Button, Typography, Card, message, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchNotifications,
    markNotificationAsRead,
    deleteNotificationById
} from '../store/slices/notificationSlice';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import EmptyComponent from '../components/common/Empty';
import Loading from '../components/common/Loading';
import { formatRelativeTime } from '../utils/format';

const { Content } = Layout;
const { Title, Text } = Typography;

const Notifications: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

    const { notifications, isLoading, unreadCount } = useAppSelector(state => state.notification);
    const { isAuthenticated } = useAppSelector(state => state.user);

    // 未登录则跳转到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            dispatch(fetchNotifications());
        }
    }, [isAuthenticated, dispatch, navigate]);

    // 标记全部已读
    const handleMarkAllRead = async () => {
        try {
            await dispatch(markNotificationAsRead({ all: true })).unwrap();
            message.success('所有通知已标记为已读');
        } catch (error: any) {
            message.error(error.message || '操作失败');
        }
    };

    // 标记单条已读
    const handleMarkRead = async (id: number) => {
        try {
            await dispatch(markNotificationAsRead({ notification_id: id })).unwrap();
        } catch (error) {
            console.error('标记已读失败:', error);
        }
    };

    // 删除通知
    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteNotificationById(id)).unwrap();
            message.success('通知已删除');
        } catch (error: any) {
            message.error(error.message || '删除失败');
        }
    };

    // 处理通知点击
    const handleNotificationClick = (notification: any) => {
        // 标记为已读
        if (!notification.is_read) {
            handleMarkRead(notification.notification_id);
        }

        // 根据通知类型跳转
        switch (notification.type) {
            case 'friend_request':
                navigate('/friends');
                break;
            case 'group_invite':
                navigate(`/groups`);
                break;
            case 'message':
                navigate(`/chat?conversation=${notification.related_id}`);
                break;
            default:
                break;
        }
    };

    if (isLoading && notifications.length === 0) {
        return <Loading fullscreen />;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <Layout>
                <Header />

                <Content style={{ padding: '20px', background: '#f5f5f5' }}>
                    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Title level={3} style={{ margin: 0 }}>
                                <Space>
                                    <BellOutlined />
                                    通知中心
                                    {unreadCount > 0 && (
                                        <Text type="danger" style={{ fontSize: 16 }}>
                                            ({unreadCount} 未读)
                                        </Text>
                                    )}
                                </Space>
                            </Title>

                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleMarkAllRead}
                                disabled={unreadCount === 0}
                            >
                                标记全部已读
                            </Button>
                        </div>

                        {notifications.length === 0 ? (
                            <EmptyComponent description="暂无通知" />
                        ) : (
                            <List
                                dataSource={notifications}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => handleNotificationClick(item)}
                                        actions={[
                                            !item.is_read && (
                                                <Button
                                                    type="text"
                                                    icon={<CheckCircleOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkRead(item.notification_id);
                                                    }}
                                                >
                                                    标为已读
                                                </Button>
                                            ),
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.notification_id);
                                                }}
                                            >
                                                删除
                                            </Button>
                                        ]}
                                        style={{
                                            backgroundColor: item.is_read ? 'transparent' : '#f0f8ff',
                                            cursor: 'pointer',
                                            ...(hoveredItemId === item.notification_id && { backgroundColor: '#f5f5f5' })
                                        }}
                                        onMouseEnter={() => setHoveredItemId(item.notification_id)}
                                        onMouseLeave={() => setHoveredItemId(null)}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <div style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: '#1890ff',
                                                    color: 'white',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    {item.sender?.username?.charAt(0) || 'N'}
                                                </div>
                                            }
                                            title={
                                                <Space>
                                                    <Text strong>{item.title}</Text>
                                                    {!item.is_read && (
                                                        <span style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            background: '#f50',
                                                            display: 'inline-block'
                                                        }}></span>
                                                    )}
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <p style={{ margin: '4px 0' }}>{item.content}</p>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {formatRelativeTime(item.created_at)}
                                                        {item.sender && ` · 来自: ${item.sender.username}`}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Notifications;