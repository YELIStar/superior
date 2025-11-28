import React from 'react';
import { Layout, Menu, Avatar, Typography, Input, Button } from 'antd';
import {
    MessageOutlined,
    UserAddOutlined,
    TeamOutlined,
    SearchOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

const { Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

interface SidebarProps {
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
}

interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.user);
    const { unreadCount } = useAppSelector(state => state.chat);

    // 菜单选项
    const menuItems: MenuItem[] = [
        {
            key: 'chat',
            icon: <MessageOutlined />,
            label: '聊天',
            onClick: () => navigate('/chat'),
            badge: unreadCount
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
        {
            key: 'profile',
            icon: <UserAddOutlined />,
            label: '个人资料',
            onClick: () => navigate('/profile'),
        },
    ];

    return (
        <Sider
            width={260}
            collapsed={collapsed}
            onCollapse={onCollapse}
            style={{
                background: '#fff',
                borderRight: '1px solid #e8e8e8',
                overflow: 'hidden'
            }}
        >
            {/* 用户信息 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #e8e8e8'
            }}>
                {!collapsed && (
                    <>
                        <Avatar
                            src={user?.avatar}
                            size="large"
                            style={{ marginRight: 12 }}
                        />
                        <div>
                            <Title level={5} style={{ margin: 0 }}>{user?.username}</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {user?.status === 1 ? '在线' : '离线'}
                            </Text>
                        </div>
                    </>
                )}
            </div>

            {/* 搜索框 */}
            {!collapsed && (
                <div style={{ padding: '16px' }}>
                    <Search
                        placeholder="搜索..."
                        prefix={<SearchOutlined />}
                        size="small"
                        style={{ marginBottom: 16 }}
                    />

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        block
                        size="small"
                        onClick={() => navigate('/friends/add')}
                    >
                        添加好友/群组
                    </Button>
                </div>
            )}

            {/* 导航菜单 */}
            <Menu
                mode="inline"
                selectedKeys={[window.location.pathname.split('/')[1] || 'chat']}
                style={{ borderRight: 0 }}
            >
                {menuItems.map(item => (
                    <Menu.Item
                        key={item.key}
                        icon={item.icon}
                        onClick={item.onClick}
                    >
                        {item.label}
                        {item.badge && item.badge > 0 && (
                            <span style={{
                                background: '#f50',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '12px',
                                padding: '0 5px',
                                marginLeft: 8
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </Menu.Item>
                ))}
            </Menu>
        </Sider>
    );
};

export default Sidebar;