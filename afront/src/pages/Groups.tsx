import React, { useEffect, useState } from 'react';
import { Layout, Button, Row, Col, Input, Space, message, Modal, Form } from 'antd';
import { PlusOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchGroups,
    createNewGroup,
    fetchGroupMembers,
    removeGroupMemberByIds
} from '../store/slices/groupSlice';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import GroupItem from '../components/group/GroupItem';
import GroupMemberItem from '../components/group/GroupMemberItem';
import EmptyComponent from '../components/common/Empty';
import Loading from '../components/common/Loading';

const { Content } = Layout;
const { Search } = Input;

const Groups: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [currentGroup, setCurrentGroup] = useState<any>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [form] = Form.useForm();

    const { groups, currentGroupMembers, isLoading } = useAppSelector(state => state.group);
    const { isAuthenticated, user } = useAppSelector(state => state.user);

    // 未登录则跳转到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 获取群组列表
    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    // 筛选群组
    const filteredGroups = groups.filter(group => {
        return group.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    // 创建群组
    const handleCreateGroup = async () => {
        try {
            const values = await form.validateFields();
            await dispatch(createNewGroup({
                name: values.name,
                description: values.description,
                member_ids: values.members ? values.members.split(',').map(Number) : []
            })).unwrap();

            message.success('群组创建成功');
            setCreateModalVisible(false);
            form.resetFields();
            dispatch(fetchGroups());
        } catch (error: any) {
            message.error(error.message || '创建群组失败');
        }
    };

    // 查看群组详情
    const handleViewDetail = (group: any) => {
        setCurrentGroup(group);
        dispatch(fetchGroupMembers(group.group_id));
        setDetailModalVisible(true);
    };

    // 移出群成员
    const handleRemoveMember = async (userId: number) => {
        try {
            await dispatch(removeGroupMemberByIds({
                groupId: currentGroup.group_id,
                userId
            })).unwrap();

            message.success('成员已移出');
            dispatch(fetchGroupMembers(currentGroup.group_id));
        } catch (error: any) {
            message.error(error.message || '操作失败');
        }
    };

    if (isLoading && groups.length === 0) {
        return <Loading fullscreen />;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <Layout>
                <Header />

                <Content style={{ padding: '20px', background: '#f5f5f5' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <h2 style={{ margin: 0 }}>我的群组</h2>
                            </Col>
                            <Col>
                                <Space>
                                    <Search
                                        placeholder="搜索群组"
                                        prefix={<SearchOutlined />}
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        style={{ width: 200 }}
                                    />

                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setCreateModalVisible(true)}
                                    >
                                        创建群组
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {filteredGroups.length === 0 ? (
                            <EmptyComponent
                                description="暂无群组"
                                buttonText="创建第一个群组"
                                buttonIcon={<PlusOutlined />}
                                onButtonClick={() => setCreateModalVisible(true)}
                            />
                        ) : (
                            <div>
                                {filteredGroups.map(group => (
                                    <div
                                        key={group.group_id}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <GroupItem
                                            group={group}
                                            onClick={() => handleViewDetail(group)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Content>
            </Layout>

            {/* 创建群组弹窗 */}
            <Modal
                title="创建群组"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setCreateModalVisible(false)}>取消</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleCreateGroup}
                    >
                        创建
                    </Button>
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="群组名称"
                        rules={[{ required: true, message: '请输入群组名称' }]}
                    >
                        <Input placeholder="请输入群组名称" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="群组描述"
                    >
                        <Input.TextArea placeholder="请输入群组描述" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="members"
                        label="成员ID"
                        help="请输入成员ID，多个ID用逗号分隔"
                    >
                        <Input placeholder="例如：1,2,3" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 群组详情弹窗 */}
            <Modal
                title={currentGroup?.name || '群组详情'}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width={600}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
                    <Button
                        key="chat"
                        type="primary"
                        onClick={() => {
                            navigate(`/chat?group=${currentGroup.group_id}`);
                            setDetailModalVisible(false);
                        }}
                    >
                        进入聊天
                    </Button>
                ]}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>
                        <strong>群组ID：</strong> {currentGroup?.group_id}
                    </p>
                    <p>
                        <strong>创建时间：</strong> {currentGroup?.created_at?.split('T')[0]}
                    </p>
                    <p>
                        <strong>群主：</strong> {currentGroup?.creator?.username}
                    </p>
                    <p>
                        <strong>成员数量：</strong> {currentGroup?.member_count}
                    </p>
                    <p>
                        <strong>群组描述：</strong> {currentGroup?.description || '无'}
                    </p>
                </div>

                <h3>群成员列表</h3>
                {currentGroupMembers.length === 0 ? (
                    <EmptyComponent description="暂无群成员" />
                ) : (
                    <div>
                        {currentGroupMembers.map(member => (
                            <GroupMemberItem
                                key={member.user_id}
                                member={member}
                                isOwner={currentGroup?.creator_id === user?.user_id}
                                currentUserId={user?.user_id}
                                onRemove={handleRemoveMember}
                            />
                        ))}
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Groups;