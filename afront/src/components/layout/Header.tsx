import React from 'react';
import { Layout, Typography, Avatar, Dropdown, Space, Badge } from 'antd';
import {
    UserOutlined,
    BellOutlined,
    SettingOutlined,
    LogoutOutlined,
    MessageOutlined,
    TeamOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/userSlice';
import '../../assets/Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
    showSidebar?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showSidebar = true }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.user);
    const { unreadCount } = useAppSelector(state => state.chat);
    const { unreadCount: notificationUnreadCount } = useAppSelector(state => state.notification);

    // 退出登录
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    // 用户菜单
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人资料',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '设置',
            onClick: () => navigate('/settings'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    // 导航菜单
    const navItems = [
        {
            key: 'chat',
            icon: <MessageOutlined />,
            label: '聊天',
            onClick: () => navigate('/chat'),
        },
        {
            key: 'friends',
            icon: <UserAddOutlined />,
            label: '好友',
            onClick: () => navigate('/friends'),
        },
        {
            key: 'groups',
            icon: <TeamOutlined />,
            label: '群组',
            onClick: () => navigate('/groups'),
        },
    ];

    return (
        <AntHeader style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            zIndex: 1
        }}>
            {showSidebar && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        ChatApp
                    </Title>

                    <Space style={{ marginLeft: 20 }}>
                        {navItems.map(item => (
                            <div
                                key={item.key}
                                onClick={item.onClick}
                                className="nav-item"
                            >
                                <Space>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Space>
                            </div>
                        ))}
                    </Space>
                </div>
            )}

            <Space>
                {/* 通知图标 */}
                <Badge count={notificationUnreadCount} dot={notificationUnreadCount > 0}>
                    <BellOutlined
                        style={{ fontSize: 20, cursor: 'pointer' }}
                        onClick={() => navigate('/notifications')}
                    />
                </Badge>

                {/* 消息图标 */}
                <Badge count={unreadCount} dot={unreadCount > 0}>
                    <MessageOutlined
                        style={{ fontSize: 20, cursor: 'pointer' }}
                        onClick={() => navigate('/chat')}
                    />
                </Badge>

                {/* 用户头像 */}
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Avatar
                            src={user?.avatar}
                            icon={<UserOutlined />}
                            style={{ marginRight: 8 }}
                        />
                        <span>{user?.username}</span>
                    </div>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default Header;