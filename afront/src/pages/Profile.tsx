import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Typography, Row, Col, Card, message, Avatar } from 'antd';
import { UserOutlined, MailOutlined, MobileOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserProfile, updateUserProfile } from '../store/slices/userSlice';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AvatarUpload from '../components/common/AvatarUpload';
import Loading from '../components/common/Loading';

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, isAuthenticated, isLoading } = useAppSelector(state => state.user);

    // 未登录则跳转到登录页
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            dispatch(fetchUserProfile());
        }
    }, [isAuthenticated, dispatch, navigate]);

    // 初始化表单
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            });
        }
    }, [user, form]);

    // 更新个人资料
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await dispatch(updateUserProfile(values)).unwrap();

            message.success('资料更新成功');
        } catch (error: any) {
            message.error(error.message || '更新失败');
        } finally {
            setLoading(false);
        }
    };

    // 处理头像上传
    const handleAvatarChange = (url: string) => {
        form.setFieldsValue({ avatar: url });
    };

    if (isLoading || !user) {
        return <Loading fullscreen />;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <Layout>
                <Header />

                <Content style={{ padding: '20px', background: '#f5f5f5' }}>
                    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
                            个人资料
                        </Title>

                        <Row gutter={[24, 24]}>
                            {/* 头像 */}
                            <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                                <AvatarUpload
                                    value={user.avatar}
                                    onChange={handleAvatarChange}
                                    size={120}
                                />
                                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                    点击上传或更换头像
                                </Text>
                            </Col>

                            <Col span={24}>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{
                                        username: user.username,
                                        email: user.email,
                                        phone: user.phone
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="username"
                                                label="用户名"
                                                rules={[{ required: true, message: '请输入用户名' }]}
                                            >
                                                <Input prefix={<UserOutlined />} disabled />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                name="nickname"
                                                label="昵称"
                                            >
                                                <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                name="email"
                                                label="邮箱"
                                                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                                            >
                                                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                name="phone"
                                                label="手机号码"
                                            >
                                                <Input prefix={<MobileOutlined />} placeholder="请输入手机号码" />
                                            </Form.Item>
                                        </Col>

                                    </Row>

                                    <Form.Item style={{ textAlign: 'center' }}>
                                        <Button
                                            type="primary"
                                            onClick={handleSubmit}
                                            loading={loading}
                                        >
                                            保存修改
                                        </Button>

                                        <Button
                                            style={{ marginLeft: 16 }}
                                            onClick={() => navigate('/change-password')}
                                        >
                                            修改密码
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Col>
                        </Row>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Profile;