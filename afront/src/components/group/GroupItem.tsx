import React from 'react';
import { List, Avatar, Typography, Button, Space } from 'antd';
import {
    MessageOutlined,
    UserAddOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { Group } from '../../types/group';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface GroupItemProps {
    group: Group;
    onClick?: () => void;
}

const GroupItem: React.FC<GroupItemProps> = ({ group, onClick }) => {
    const navigate = useNavigate();

    // 进入群聊
    const handleChat = () => {
        navigate(`/chat?group=${group.group_id}`);
    };

    return (
        <List.Item
            onClick={onClick}
            actions={[
                <Button
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={handleChat}
                >
                    聊天
                </Button>,
                <Button
                    type="text"
                    icon={<UserAddOutlined />}
                >
                    邀请
                </Button>
            ]}
        >
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={group.avatar}
                        style={{ backgroundColor: '#f56a00' }}
                    >
                        {group.name.charAt(0)}
                    </Avatar>
                }
                title={
                    <Title level={5} style={{ margin: 0 }}>
                        {group.name}
                    </Title>
                }
                description={
                    <Space>
                        <Text type="secondary">
                            {group.member_count} 人 · 创建于 {group.created_at.split('T')[0]}
                        </Text>
                        {group.creator_id === JSON.parse(localStorage.getItem('user') || '{}')?.user_id && (
                            <Text type="secondary">(群主)</Text>
                        )}
                    </Space>
                }
            />
        </List.Item>
    );
};

export default GroupItem;