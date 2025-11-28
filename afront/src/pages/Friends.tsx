import React, { useEffect, useState } from 'react';
import { Layout, Button, Row, Col, Input, Space, message, Collapse } from 'antd';
import { PlusOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchFriends,
    createNewFriendGroup,
    deleteFriendById
} from '../store/slices/friendSlice';
import { fetchFriendRequests, handleNewFriendRequest } from '../store/slices/friendSlice';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import FriendGroup from '../components/friend/FriendGroup';
import AddFriendModal from '../components/friend/AddFriendModal';
import EmptyComponent from '../components/common/Empty';
import Loading from '../components/common/Loading';

const { Content } = Layout;
const { Search } = Input;

const Friends: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const { friends, groups, requests, isLoading } = useAppSelector(state => state.friend);
    const { isAuthenticated } = useAppSelector(state => state.user);

    // 未登录则跳转到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 获取好友列表和请求
    useEffect(() => {
        dispatch(fetchFriends());
        dispatch(fetchFriendRequests());
    }, [dispatch]);

    // 筛选好友
    const filteredFriends = friends.filter(friend => {
        const name = friend.remark || friend.friend_info.username;
        return name.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    // 按分组整理好友
    const friendsByGroup = groups.reduce((acc, group) => {
        acc[group.group_id] = filteredFriends.filter(friend => friend.group_id === group.group_id);
        return acc;
    }, {} as Record<number, any[]>);

    // 创建新分组
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            message.warning('请输入分组名称');
            return;
        }

        try {
            await dispatch(createNewFriendGroup(newGroupName.trim())).unwrap();
            message.success('分组创建成功');
            setNewGroupName('');
        } catch (error: any) {
            message.error(error.message || '创建分组失败');
        }
    };

    // 处理好友请求
    const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
        try {
            await dispatch(handleNewFriendRequest({
                request_id: requestId,
                action
            })).unwrap();

            message.success(action === 'accept' ? '已添加好友' : '已拒绝请求');
            dispatch(fetchFriendRequests());
            dispatch(fetchFriends());
        } catch (error: any) {
            message.error(error.message || '操作失败');
        }
    };

    if (isLoading && friends.length === 0 && groups.length === 0) {
        return <Loading fullscreen />;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <Layout>
                <Header />

                <Content style={{ padding: '20px', background: '#f5f5f5' }}>
                    <Row gutter={[16, 16]}>
                        {/* 好友列表 */}
                        <Col span={16}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                                    <Col>
                                        <h2 style={{ margin: 0 }}>我的好友</h2>
                                    </Col>
                                    <Col>
                                        <Space>
                                            <Search
                                                placeholder="搜索好友"
                                                prefix={<SearchOutlined />}
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                                style={{ width: 200 }}
                                            />

                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => setAddModalVisible(true)}
                                            >
                                                添加好友
                                            </Button>

                                            <Input
                                                placeholder="新分组名称"
                                                value={newGroupName}
                                                onChange={(e) => setNewGroupName(e.target.value)}
                                                style={{ width: 150 }}
                                                onPressEnter={handleCreateGroup}
                                            />
                                            <Button onClick={handleCreateGroup}>创建分组</Button>
                                        </Space>
                                    </Col>
                                </Row>

                                {groups.length === 0 ? (
                                    <EmptyComponent
                                        description="暂无好友分组"
                                        buttonText="创建第一个分组"
                                        buttonIcon={<PlusOutlined />}
                                        onButtonClick={() => setNewGroupName('默认分组')}
                                    />
                                ) : (
                                    <Collapse>
                                        {groups.map(group => (
                                            <FriendGroup
                                                key={group.group_id}
                                                group={group}
                                                friends={friendsByGroup[group.group_id] || []}
                                                onDeleteFriend={(friendId) => {
                                                    dispatch(deleteFriendById(friendId));
                                                    message.success('好友已删除');
                                                }}
                                                onSelectFriend={(friendId) => {
                                                    navigate(`/chat?friend=${friendId}`);
                                                }}
                                            />
                                        ))}
                                    </Collapse>
                                )}
                            </div>
                        </Col>

                        {/* 好友请求 */}
                        <Col span={8}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                                <h2 style={{ margin: 0, marginBottom: 16 }}>好友请求</h2>

                                {requests.length === 0 ? (
                                    <EmptyComponent description="暂无好友请求" />
                                ) : (
                                    <div>
                                        {requests.map(request => (
                                            <div
                                                key={request.request_id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px',
                                                    borderBottom: '1px solid #e8e8e8'
                                                }}
                                            >
                                                <div>
                                                    <p style={{ margin: 0 }}>
                                                        <strong>{request.sender?.username}</strong> 请求添加你为好友
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                                        {request.message || '无验证消息'}
                                                    </p>
                                                </div>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => handleRequestAction(request.request_id, 'accept')}
                                                    >
                                                        接受
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleRequestAction(request.request_id, 'reject')}
                                                    >
                                                        拒绝
                                                    </Button>
                                                </Space>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Friends;