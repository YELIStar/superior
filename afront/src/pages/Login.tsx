import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Card, Checkbox, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, clearUserError } from '../store/slices/userSlice';
import Loading from '../components/common/Loading';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useAppSelector(state => state.user);

    // 已登录则跳转到聊天页
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/chat');
        }
    }, [isAuthenticated, navigate]);

    // 处理错误提示
    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearUserError());
        }
    }, [error, dispatch]);

    // 提交登录
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await dispatch(loginUser({
                username: values.username,
                password: values.password
            })).unwrap();

            message.success('登录成功');
            navigate('/chat');
        } catch (err) {
            // 表单验证失败或登录失败已在slice中处理
        }
    };

    if (isLoading) {
        return <Loading fullscreen />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Card
                style={{ width: 400, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                title={<Title level={3} style={{ textAlign: 'center' }}>ChatApp 登录</Title>}
            >
                <Form
                    form={form}
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                >
                    <Form.Item
                        name="username"
                        label="用户名/手机号/邮箱"
                        rules={[{ required: true, message: '请输入用户名/手机号/邮箱' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Row justify="space-between">
                            <Col>
                                <Checkbox>记住我</Checkbox>
                            </Col>
                            <Col>
                                <Link to="/forgot-password">忘记密码?</Link>
                            </Col>
                        </Row>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={handleSubmit}
                            loading={isLoading}
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>

                    <Row justify="center">
                        <Text>
                            还没有账号? <Link to="/register">立即注册</Link>
                        </Text>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Login;