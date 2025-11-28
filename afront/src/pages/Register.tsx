import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, Card, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearUserError } from '../store/slices/userSlice';
import Loading from '../components/common/Loading';
import { formRules } from '../utils/validator';

const { Title, Text } = Typography;

const Register: React.FC = () => {
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

    // 提交注册
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.password !== values.confirmPassword) {
                message.error('两次输入的密码不一致');
                return;
            }

            await dispatch(registerUser({
                username: values.username,
                phone: values.phone,
                email: values.email,
                password: values.password
            })).unwrap();

            message.success('注册成功，请登录');
            navigate('/login');
        } catch (err) {
            // 表单验证失败或注册失败已在slice中处理
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
                style={{ width: 450, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                title={<Title level={3} style={{ textAlign: 'center' }}>ChatApp 注册</Title>}
            >
                <Form
                    form={form}
                    name="register"
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[formRules.required(), formRules.username()]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="4-20位字母、数字、下划线" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="手机号码"
                        rules={[formRules.required(), formRules.phone()]}
                    >
                        <Input prefix={<MobileOutlined />} placeholder="请输入手机号码" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[formRules.required(), formRules.email()]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="请输入邮箱地址" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[formRules.required(), formRules.password()]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="至少8位，包含字母和数字" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        rules={[{ required: true, message: '请确认密码' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={handleSubmit}
                            loading={isLoading}
                            block
                        >
                            注册
                        </Button>
                    </Form.Item>

                    <Row justify="center">
                        <Text>
                            已有账号? <Link to="/login">立即登录</Link>
                        </Text>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Register;